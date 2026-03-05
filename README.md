# Lumière — Jewelry Try-On

A production-grade, browser-only jewelry try-on web application.

Upload a portrait photo → Face landmarks detected via MediaPipe FaceMesh → Jewelry overlay placed automatically → Download the result.

---

## Tech Stack

- **Next.js 14** (App Router)
- **React 18**
- **TailwindCSS**
- **MediaPipe FaceMesh** — in-browser face landmark detection
- **HTML Canvas** — photo + jewelry compositing

No backend. No external APIs. All processing runs locally in the browser.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
/app
  layout.js         — Root layout with font imports
  page.js           — Main application page
  globals.css       — Global styles + design tokens

/components
  PhotoUploader.js  — Drag-and-drop photo upload
  FaceDetector.js   — MediaPipe FaceMesh wrapper (logic only)
  JewelryRenderer.js — Canvas photo + jewelry overlay rendering
  JewelryCatalog.js  — Horizontal scrollable jewelry catalog

/lib
  faceMesh.js       — MediaPipe initialization + landmark extraction
  placement.js      — Jewelry placement math + canvas draw utilities

/data
  catalog.json      — Jewelry catalog metadata

/public/jewelry
  necklace1.png … necklace6.png  — Transparent jewelry PNG assets
```

---

## Facial Landmarks Used

| Index | Location   | Used for        |
|-------|------------|-----------------|
| 152   | Chin tip   | Vertical anchor |
| 234   | Left jaw   | Face width calc |
| 454   | Right jaw  | Face width calc |
| 10    | Forehead   | Face height     |
| 132   | Left ear   | Reference       |
| 361   | Right ear  | Reference       |

---

## Adding Jewelry

1. Add a transparent PNG to `/public/jewelry/`
2. Add an entry to `/data/catalog.json`:

```json
{
  "id": "necklace-07",
  "name": "Your Piece",
  "type": "necklace",
  "material": "Material",
  "image": "/jewelry/your-file.png",
  "description": "Description",
  "price": "0,000",
  "placementType": "necklace"
}
```

---

## Tips for Best Results

- Use a well-lit, front-facing portrait photo
- Ensure neck and upper chest are visible
- JPG or PNG, up to 20MB
- Higher resolution photos produce sharper results

---

## License

MIT
