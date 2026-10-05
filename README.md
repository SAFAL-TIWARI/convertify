# Convertify

> **Less noise, more signal, just convert.**  
> *An independent builder project inspired by the Hacker House Goa 2026 visual language. Not an official Hacker House Goa product.*

Convertify is a local-first professional file conversion platform. It operates directly on your machine using high-performance open-source engines (Sharp, PDF-Lib, Mammoth, SheetJS, and headless LibreOffice). Files stay completely on your computer—never uploaded to third-party conversion APIs or cloud databases.

---

## Key Features

- **Local-First Processing:** Files are processed exclusively by your local Node.js backend running on `localhost`.
- **Privacy & Isolation:** Temporary directories (`temp/uploads`, `temp/outputs`) are isolated, and temporary files are automatically cleaned up immediately after conversion and periodically purged.
- **500 MB File Limit:** Rigorous multi-layer validation prevents memory bloat: rejects oversized files, empty files, and mismatched binary signatures.
- **Active Conversion Engines:**
  - **Images (Sharp / libvips):** Lossless & lossy conversions between `JPG`, `PNG`, `WEBP`, `AVIF`, `TIFF`, and `GIF`. Includes optional compression quality sliders, dimensions resizing, and aspect-ratio locking.
  - **Documents (Native Node Engine):**
    - `TXT` / `MD` ➔ `PDF` (clean A4 layout, Helvetica typography, automatic pagination)
    - `TXT` / `MD` ➔ `DOCX` (structured Word documents)
    - `DOCX` ➔ `TXT`, `HTML`, `MD` (clean content extraction via Mammoth)
    - `PDF` ➔ `TXT`, `DOCX`, `HTML` (modern PDF.js text reconstruction)
    - `XLSX` / `XLS` / `CSV` ➔ `CSV`, `HTML`, `TXT`, `JSON`, `XLSX` (SheetJS)
  - **Office Suite (LibreOffice Headless):** Auto-detected on host (`soffice.exe`). When installed, unlocks legacy formats (`DOC`, `PPT`, `PPTX`, `ODT`, `RTF`).
- **Original HH Goa Visual Identity:**
  - Editorial serif typography (`Newsreader`) & technical monospace metadata (`JetBrains Mono`).
  - Warm cream background (`#f7f1dc`), primary tropical green (`#046634`), deep green (`#033e22`), vibrant pink accents (`#f00f77`), and yellow signal markers (`#f3d000`).
  - Coastal wave and palm frond line motifs.
  - No AI-generated clichés (no generic purple gradients, no floating glass cards).
- **Format Catalog & Instant Shortcuts:** Organized tool shortcuts (`PDF → DOCX`, `PNG → WEBP`, `JPG → PNG`, etc.) with dynamic compatibility matrices and clear "Coming soon" indicators for future media categories.

---

## Architecture Overview

```
convertifty/
├── client/                     # React 18 + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── components/
│   │   │   ├── catalog/        # Format catalog & tool shortcuts
│   │   │   ├── converter/      # Workspace, progress stepper, image tuning
│   │   │   ├── diagnostics/    # Real-time engine health drawer
│   │   │   ├── format-selector/# Searchable format modal with categories
│   │   │   ├── layout/         # Header, footer, notice banner
│   │   │   ├── result/         # Download actions & interactive preview
│   │   │   └── uploader/       # Drag-and-drop dropzone with 500MB validation
│   │   ├── lib/                # API client & byte formatters
│   │   └── index.css           # HH Goa tokens & dot patterns
├── server/                     # Express + TypeScript
│   ├── routes/                 # /api/convert, /api/jobs, /api/download, /api/formats, /api/diagnostics
│   ├── services/
│   │   ├── conversion/
│   │   │   ├── document/       # NodeDocumentEngine & LibreOfficeEngine
│   │   │   ├── image/          # SharpImageEngine
│   │   │   └── placeholders/   # Audio, Video, Archive architecture placeholders
│   │   ├── engineRegistry.ts   # Central capability & routing matrix
│   │   ├── jobs/               # In-memory lifecycle & cleanup manager
│   │   └── validation/         # Magic byte, MIME, and size validation
│   ├── utils/                  # Temp storage & path sanitization
│   └── tests/                  # Automated conversion test suite
└── shared/
    └── types/                  # Shared TypeScript interfaces
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher (v24.x recommended)
- **npm**: v9.0.0 or higher

*(Optional)* **LibreOffice**: For legacy Office document conversions (`.doc`, `.ppt`, `.odt`):
- **Windows:** `winget install TheDocumentFoundation.LibreOffice`
- **macOS:** `brew install --cask libreoffice`
- **Linux:** `sudo apt install libreoffice`

---

### Installation

```bash
# Clone the repository and install dependencies
npm install
```

---

### Running the Application

To launch both the Node backend (port 3001) and Vite frontend (port 5173) concurrently:

```bash
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

### Running the Test Suite

Run the automated verification suite covering image transformations, document conversions, file validators, and security guards:

```bash
npm test
```

---

## Privacy & Security

- **Strict Path Sanitization:** Filenames are stripped of path traversal characters (`../`, `..\`) and dangerous shell control characters.
- **Child Process Isolation:** External processes are spawned with explicit argument arrays (no shell interpolation) and hard process timeouts.
- **Zero Cloud Retention:** Converted files live strictly in your temporary directory and are purged periodically or upon restart.
