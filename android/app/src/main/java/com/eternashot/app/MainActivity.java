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
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.webkit.ConsoleMessage;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.JsPromptResult;
import android.webkit.JsResult;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import androidx.print.PrintHelper;

import com.getcapacitor.BridgeActivity;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "EternaShotNative";
    private static final int PERMISSION_REQ_CODE = 101;

    private PermissionRequest pendingWebPermissionRequest = null;
    private boolean permissionRequestedOnce = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 1. Request Runtime Permissions immediately
        requestRequiredPermissions();

        // 2. Configure WebView settings and add JavaScript Bridge
        setupWebViewBridge();
    }

    @Override
    public void onResume() {
        super.onResume();
        // Auto-activate camera when returning to app if permission is granted
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            if (pendingWebPermissionRequest != null) {
                try {
                    pendingWebPermissionRequest.grant(pendingWebPermissionRequest.getResources());
                } catch (Exception e) {
                    Log.e(TAG, "Error granting pending WebRTC permission onResume", e);
                }
                pendingWebPermissionRequest = null;
            }
            runOnUiThread(() -> {
                if (getBridge() != null && getBridge().getWebView() != null) {
                    getBridge().getWebView().postDelayed(() -> {
                        getBridge().getWebView().evaluateJavascript(
                            "if (window.initCamera && typeof window.hasActiveCameraStream === 'function' && !window.hasActiveCameraStream()) { window.initCamera(true); }",
                            null
                        );
                    }, 350);
                }
            });
        }
    }

    private void requestRequiredPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            List<String> list = new ArrayList<>();
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                list.add(Manifest.permission.CAMERA);
            }
            if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
                if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                    list.add(Manifest.permission.WRITE_EXTERNAL_STORAGE);
                }
            }

            if (!list.isEmpty()) {
                permissionRequestedOnce = true;
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
                settings.setJavaScriptEnabled(true);

                // Add Native JavaScript Bridge for direct save to gallery, native print, and permission request
                webView.addJavascriptInterface(new NativeAndroidBridge(this), "AndroidBridge");

                // Get existing Capacitor WebChromeClient for complete delegation
                final WebChromeClient defaultClient = webView.getWebChromeClient();

                // Custom WebChromeClient: Synchronize WebRTC camera permissions with Android runtime permissions
                webView.setWebChromeClient(new WebChromeClient() {
                    @Override
                    public void onPermissionRequest(final PermissionRequest request) {
                        runOnUiThread(() -> {
                            try {
                                if (request == null) return;
                                Log.d(TAG, "onPermissionRequest called for: " + java.util.Arrays.toString(request.getResources()));

                                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                                    // OS permission granted: safe to grant WebRTC hardware access immediately
                                    request.grant(request.getResources());
                                } else {
                                    // OS permission NOT granted: store request and prompt user for OS permission
                                    pendingWebPermissionRequest = request;
                                    requestRequiredPermissions();
                                }
                            } catch (Exception e) {
                                Log.e(TAG, "Failed onPermissionRequest", e);
                            }
                        });
                    }

                    @Override
                    public void onPermissionRequestCanceled(PermissionRequest request) {
                        super.onPermissionRequestCanceled(request);
                        if (pendingWebPermissionRequest == request) {
                            pendingWebPermissionRequest = null;
                        }
                    }

                    @Override
                    public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback, FileChooserParams fileChooserParams) {
                        if (defaultClient != null) {
                            return defaultClient.onShowFileChooser(webView, filePathCallback, fileChooserParams);
                        }
                        return super.onShowFileChooser(webView, filePathCallback, fileChooserParams);
                    }

                    @Override
                    public boolean onJsAlert(WebView view, String url, String message, JsResult result) {
                        if (defaultClient != null) {
                            return defaultClient.onJsAlert(view, url, message, result);
                        }
                        return super.onJsAlert(view, url, message, result);
                    }

                    @Override
                    public boolean onJsConfirm(WebView view, String url, String message, JsResult result) {
                        if (defaultClient != null) {
                            return defaultClient.onJsConfirm(view, url, message, result);
                        }
                        return super.onJsConfirm(view, url, message, result);
                    }

                    @Override
                    public boolean onJsPrompt(WebView view, String url, String message, String defaultValue, JsPromptResult result) {
                        if (defaultClient != null) {
                            return defaultClient.onJsPrompt(view, url, message, defaultValue, result);
                        }
                        return super.onJsPrompt(view, url, message, defaultValue, result);
                    }

                    @Override
                    public boolean onConsoleMessage(ConsoleMessage consoleMessage) {
                        if (defaultClient != null) {
                            return defaultClient.onConsoleMessage(consoleMessage);
                        }
                        return super.onConsoleMessage(consoleMessage);
                    }

                    @Override
                    public void onGeolocationPermissionsShowPrompt(String origin, GeolocationPermissions.Callback callback) {
                        if (defaultClient != null) {
                            defaultClient.onGeolocationPermissionsShowPrompt(origin, callback);
                        } else {
                            super.onGeolocationPermissionsShowPrompt(origin, callback);
                        }
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
                if (pendingWebPermissionRequest != null) {
                    try {
                        pendingWebPermissionRequest.grant(pendingWebPermissionRequest.getResources());
                    } catch (Exception e) {
                        Log.e(TAG, "Error granting pending WebRTC permission", e);
                    }
                    pendingWebPermissionRequest = null;
                }
                runOnUiThread(() -> {
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().postDelayed(() -> {
                            getBridge().getWebView().evaluateJavascript(
                                "if (window.initCamera) { window.initCamera(true); }",
                                null
                            );
                        }, 250);
                    }
                });
            } else {
                if (pendingWebPermissionRequest != null) {
                    try {
                        pendingWebPermissionRequest.deny();
                    } catch (Exception ignored) {}
                    pendingWebPermissionRequest = null;
                }
                runOnUiThread(() -> {
                    Toast.makeText(this, "Izin kamera dibutuhkan untuk live preview studio.", Toast.LENGTH_LONG).show();
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().evaluateJavascript(
                            "if (window.onCameraPermissionDenied) { window.onCameraPermissionDenied(); }",
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
        public void requestCameraPermission() {
            runOnUiThread(() -> {
                if (ContextCompat.checkSelfPermission(MainActivity.this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
                    if (getBridge() != null && getBridge().getWebView() != null) {
                        getBridge().getWebView().evaluateJavascript(
                            "if (window.initCamera) { window.initCamera(true); }",
                            null
                        );
                    }
                } else {
                    boolean showRationale = ActivityCompat.shouldShowRequestPermissionRationale(MainActivity.this, Manifest.permission.CAMERA);
                    if (!showRationale && permissionRequestedOnce) {
                        Toast.makeText(
                            MainActivity.this,
                            "Silakan aktifkan Izin Kamera di Pengaturan Aplikasi agar live studio dapat terbuka.",
                            Toast.LENGTH_LONG
                        ).show();
                        try {
                            Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                            intent.setData(Uri.fromParts("package", getPackageName(), null));
                            startActivity(intent);
                        } catch (Exception e) {
                            Log.e(TAG, "Cannot open app settings", e);
                        }
                    } else {
                        permissionRequestedOnce = true;
                        requestRequiredPermissions();
                    }
                }
            });
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
