package com.eternashot.app;

import android.Manifest;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.media.MediaScannerConnection;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.print.PrintHelper;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "EternaShotNative";
    private static final int PERMISSION_REQ_CODE = 101;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Request Runtime Permissions immediately
        requestRequiredPermissions();

        // 2. Configure WebView settings and add JavaScript Bridge
        setupWebViewBridge();
    }

    private void requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            java.util.List<String> list = new java.util.ArrayList<>();
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                list.add(Manifest.permission.CAMERA);
            }
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                list.add(Manifest.permission.RECORD_AUDIO);
            }
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                    list.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
                }
            }

            if (!list.isEmpty()) {
                ActivityCompat.requestPermissions(this, list.toArray(new String[0]), PERMISSION_REQ_CODE);
            }
        }
    }

    private void setupWebViewBridge() {
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setMediaPlaybackRequiresUserGesture(false);
                settings.setAllowFileAccess(true);
                settings.setAllowContentAccess(true);
                settings.setDomStorageEnabled(true);
                settings.setDatabaseEnabled(true);

                // Add Native JavaScript Bridge for direct save to gallery and native print
                webView.addJavascriptInterface(new NativeAndroidBridge(this), "AndroidBridge");

                // Override WebChromeClient to guarantee WebRTC camera permission grant
                webView.setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
                    @Override
                    public void onPermissionRequest(final PermissionRequest request) {
                        runOnUiThread(() -> {
                            try {
                                if (request != null) {
                                    request.grant(request.getResources());
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "Failed to grant webview permission", e);
                            }
                        });
                    }
                });
            }
        } catch (Exception e) {
            Log.e(TAG, "Error configuring webView bridge", e);
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQ_CODE) {
            boolean cameraGranted = false;
            for (int i = 0; i < permissions.length; i++) {
                if (Manifest.permission.CAMERA.equals(permissions[i]) && grantResults[i] == PackageManager.PERMISSION_GRANTED) {
                    cameraGranted = true;
                    break;
                }
            }

            if (cameraGranted) {
                runOnUiThread(() -> {
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().evaluateJavascript(
                            "if (window.initCamera) { window.initCamera(true); }",
                            null
                        );
                    }
                });
            }
        }
    }

    // =========================================================
    // NATIVE JAVASCRIPT INTERFACE FOR ANDROID (SAVE & PRINT)
    // =========================================================
    public class NativeAndroidBridge {
        private final Context context;

        public NativeAndroidBridge(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public void saveImageToGallery(String base64Data, String filename) {
            runOnUiThread(() -> {
                try {
                    String cleanData = base64Data;
                    if (cleanData.contains(",")) {
                        cleanData = cleanData.substring(cleanData.indexOf(",") + 1);
                    }
                    byte[] imageBytes = Base64.decode(cleanData, Base64.DEFAULT);

                    boolean saved = false;

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                        // Android 10+ Scoped MediaStore Storage
                        ContentValues values = new ContentValues();
                        values.put(MediaStore.Images.Media.DISPLAY_NAME, filename);
                        values.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
                        values.put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/EternaShot");
                        values.put(MediaStore.Images.Media.IS_PENDING, 1);

                        Uri uri = context.getContentResolver().insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values);
                        if (uri != null) {
                            try (OutputStream out = context.getContentResolver().openOutputStream(uri)) {
                                if (out != null) {
                                    out.write(imageBytes);
                                    out.flush();
                                    saved = true;
                                }
                            }
                            values.clear();
                            values.put(MediaStore.Images.Media.IS_PENDING, 0);
                            context.getContentResolver().update(uri, values, null, null);
                        }
                    } else {
                        // Android 9 and below Legacy Storage
                        File picturesDir = Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_PICTURES);
                        File eternaDir = new File(picturesDir, "EternaShot");
                        if (!eternaDir.exists()) eternaDir.mkdirs();

                        File imageFile = new File(eternaDir, filename);
                        try (FileOutputStream fos = new FileOutputStream(imageFile)) {
                            fos.write(imageBytes);
                            fos.flush();
                            saved = true;
                        }

                        MediaScannerConnection.scanFile(
                            context,
                            new String[]{imageFile.getAbsolutePath()},
                            new String[]{"image/png"},
                            null
                        );
                    }

                    if (saved) {
                        Toast.makeText(context, "✅ Strip foto berhasil disimpan di Galeri HP!", Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(context, "❌ Gagal menyimpan foto ke galeri.", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error saving image to gallery", e);
                    Toast.makeText(context, "Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }

        @JavascriptInterface
        public void printImage(String base64Data) {
            runOnUiThread(() -> {
                try {
                    String cleanData = base64Data;
                    if (cleanData.contains(",")) {
                        cleanData = cleanData.substring(cleanData.indexOf(",") + 1);
                    }
                    byte[] imageBytes = Base64.decode(cleanData, Base64.DEFAULT);
                    Bitmap bitmap = BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);

                    if (bitmap != null) {
                        PrintHelper printHelper = new PrintHelper(MainActivity.this);
                        printHelper.setScaleMode(PrintHelper.SCALE_MODE_FIT);
                        printHelper.printBitmap("EternaShot_Strip", bitmap);
                    } else {
                        Toast.makeText(context, "Gagal memproses gambar untuk dicetak.", Toast.LENGTH_SHORT).show();
                    }
                } catch (Exception e) {
                    Log.e(TAG, "Error printing image", e);
                    Toast.makeText(context, "Print Error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                }
            });
        }
    }
}
