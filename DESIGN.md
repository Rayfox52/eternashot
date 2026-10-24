# EternaShot — Y2K Neo-Brutalist Design Specification
**Date**: October 2026 | **Product**: EternaShot Web Photo Booth
**Visual Archetype**: Y2K Cyber-Industrial Neo-Brutalism (Retro Digicam + Early Web High-Contrast Raw Interface)

---

## 1. Aesthetic Manifesto & Anti-Slop Discipline
EternaShot merges the mechanical tactility of early-2000s Japanese print-club purikura booths and digicam OSDs with contemporary Neo-Brutalism:
- **No blurry gradient soup**: No purple-to-cyan ambient glow orbs.
- **Hard drop shadows**: High-contrast, sharp offset shadows (`3px 3px 0 #000` or `#ccff00`), collapsing on `:active` with `translate(2px, 2px)`.
- **Deliberate geometry**: Crisp 3px–4px radius corners or sharp right angles, never generic SaaS pill shapes.
- **Camcorder & Digicam OSD**: Real technical camera readouts (`[REC]`, `[ISO 400]`, `[ETN-2000]`, `[4:3 HD]`, crosshairs).
- **Tactile feedback**: Physical mechanical push buttons, solid borders (`2px solid #000` / `#ffffff`), clean vector SVG icons.

---

## 2. Color System
| Token | Hex Value | Role & Usage |
| :--- | :--- | :--- |
| `--bg-main` | `#0a0c10` | Darkroom tech chassis background |
| `--bg-surface` | `#12151e` | Panel & card surface |
| `--bg-elevated`| `#1a1e2b` | Button rest state & drawer panels |
| `--border-dark`| `#000000` | Hard contrast border |
| `--border-tech`| `#2a3142` | Structural divider lines |
| `--accent-lime`| `#ccff00` | Primary Y2K brutalist accent (Shutter, active tabs, status) |
| `--accent-pink`| `#ff2a70` | Secondary punch accent (Rec dot, pose tags, retake) |
| `--accent-blue`| `#2563eb` | Technical secondary highlight |
| `--text-main`  | `#f8fafc` | High readability foreground |
| `--text-muted` | `#94a3b8` | Technical annotations & subtitles |
| `--text-black` | `#000000` | High-contrast label on neon accents |

---

## 3. Typography Hierarchy
- **Brand & Major Headers**: `'Space Grotesk'`, 800 weight, uppercase, tracked `0.5px`.
- **UI Labels & Actions**: `'Outfit'`, 700 weight, uppercase brutalist buttons.
- **Camera OSD & Readouts**: `'Courier Prime'`, monospace, `[DATA STAMPS]`.
- **Body & Captions**: `'Plus Jakarta Sans'`, 500–600 weight.

---

## 4. Mechanical Component Rules
1. **Shutter Button**:
   - High-voltage `#ccff00` button with `2.5px solid #000000` and `4px 4px 0px #000000` hard shadow.
   - Mechanical click: On `:active`, collapses to `1px 1px 0px #000` and `translate(3px, 3px)`.
2. **Viewfinder**:
   - Thin 2px white corner brackets with corner tick length 14px.
   - Digicam OSD info: `[REC ●]`, `[ETN-2000]`, `[AF-LOCK]`, `[ISO 400]`.
3. **Photostrip**:
   - Crisp physical archival strip with subtle bottom paper shadow `4px 8px 0px rgba(0,0,0,0.4)`.
   - Watermark: `ETERNASHOT · ARCHIVE 2000`.
4. **Layout & Frame Carousels**:
   - Hard bordered tiles with instant hover state border color changes.
   - Mini geometric layout glyphs.
