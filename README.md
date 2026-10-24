# ⚡ EternaShot // Y2K Neo-Brutalist Web Photo Booth

> **Retro 4-Pose Aesthetic Photobooth Studio** built with pure Vanilla JavaScript, CSS3, HTML5 Canvas, and WebRTC. Designed with an authentic **Y2K Neo-Brutalist** aesthetic (digicam viewfinder HUD, high-contrast palette, tactile mechanical controls, and hard-edge drop shadows).

![EternaShot Preview](https://img.shields.io/badge/STYLE-Y2K%20NEO--BRUTALIST-ccff00?style=for-the-badge&logoColor=000)
![Author](https://img.shields.io/badge/AUTHOR-Rayfox52-ccff00?style=for-the-badge&logo=github)
![License](https://img.shields.io/badge/LICENSE-MIT-ff2a70?style=for-the-badge)
![Status](https://img.shields.io/badge/STATUS-LIVE-00e5ff?style=for-the-badge)

🔗 **Live Website**: [https://rayfox52.github.io/eternashot/](https://rayfox52.github.io/eternashot/)

---

## 📸 Key Features

- **Digicam Viewfinder HUD (OSD)**: Live camera overlays with viewfinder brackets, reticle crosshair, `[REC ●]`, `[4:3 HD]`, `[ETN-2000 // AF-LOCK]`, and `[ISO 400]`.
- **Automated 4-Pose Capture Sequence**: 3-second countdown per shot with audio shutter clicks, flash feedback, and live pose suggestions.
- **5 Strip Formats**:
  - Vertical Classic (1x4)
  - Grid 2x2 (Square Album)
  - Twin 2-Strip (Double Strip)
  - Wide 1x3 (Cinematic Landscape)
  - Film 35mm (Analog film roll with realistic sprockets)
- **14 Frame Templates**: Cyber Black, Acid Lime, Hot Punch Pink, Holographic Silver, 90s Vintage Film, Pastel Checker, Y2K Denim, Sweet Hearts, Newspaper, and more.
- **Real-Time CSS Color Grading Filters**: Original, Mono Seoul (B&W), Warm Vintage, Film 90s, Soft Cream, Cool Tone, Golden Hour, and Noir Studio.
- **150+ Drag & Drop Sticker Drawer**: Expandable sticker collection with custom vector doodles, Y2K badges, and keyboard emojis.
- **Behind-The-Scenes (BTS) Video Recording**: Automatically records short video clips during your capture session with instant WebM download.
- **High-Resolution 1800px Canvas Export**: Dimensionless precision vector rendering that guarantees crisp printable image quality.
- **Cross-Platform Responsive**: Fully optimized for Desktop, Laptop, Tablet, and Mobile screens with zero cut-off viewports.

---

## 🚀 Quick Start (Local)

1. Clone or download this repository:
   ```bash
   git clone https://github.com/<your-username>/eternashot.git
   cd eternashot
   ```

2. Start the local server:
   - On Windows: Double-click `start.bat`
   - Or run with Node.js:
     ```bash
     node serve.js
     ```

3. Open in your browser:
   - Laptop / PC: `http://localhost:3000`
   - Smartphone (on same Wi-Fi): `http://<your-local-ip>:3000`

---

## 🌐 Deploy to GitHub Pages (Free HTTPS)

Webcam permissions (`getUserMedia`) **require HTTPS** in modern mobile & desktop browsers. GitHub Pages provides free, automatic HTTPS SSL certificates!

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "feat: initial commit for EternaShot photobooth"
git branch -M main
git remote add origin https://github.com/<your-username>/eternashot.git
git push -u origin main
```

### Step 2: Enable GitHub Pages
1. Go to your repository on GitHub: `https://github.com/<your-username>/eternashot`
2. Click **Settings** (tab atas) → **Pages** (di sidebar kiri).
3. Under **Build and deployment**:
   - **Source**: Select `Deploy from a branch`
   - **Branch**: Select `main` / Folder: `/ (root)`
4. Click **Save**.
5. Wait 1-2 minutes. Your photobooth is now LIVE at:
   ```
   https://<your-username>.github.io/eternashot/
   ```

---

## 🛠️ Tech Stack

- **Core**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Canvas API**: High-resolution image stitching & sticker compositing
- **MediaStream Recording API**: Real-time BTS video capture
- **Web Audio API**: Synthesized shutter clicks and countdown beeps (zero external audio file dependencies)
- **Typography**: Space Grotesk, Courier Prime, Plus Jakarta Sans

---

## 📄 License

MIT License. Free to use and customize!
