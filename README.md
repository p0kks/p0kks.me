# p0kks.me

A minimal, single-page personal website for [p0kks.me](https://p0kks.me), built with plain HTML, CSS, and a small inline JavaScript effect.

## Overview

This repository currently contains a lightweight static landing page with:

- Profile header and short bio
- Expandable sections for About, Code Projects, and Audio Projects
- Dynamic content fetching from GitHub Issues for portfolio items and journals
- Glassmorphic modal for seamless rich-content viewing without navigating away
- Subtle animated matrix-style canvas background (using an optimized `requestAnimationFrame` loop)
- Responsive footer and mobile-friendly layout

## Stack

- HTML5
- CSS3 (custom properties + responsive media queries)
- Vanilla JavaScript (no build step, no framework)

## Project Structure

```text
.
├── assets/
│   └── images/
│       ├── p0kks-me-optimized.png
│       └── p0kks-me-pfp.png
├── CNAME
├── index.html
├── style.css
└── README.md
```

## Local Development

Because this is a static site, any simple local web server works.

### Option 1: Python

```bash
python -m http.server 8000
```

Then open <http://localhost:8000>.

### Option 2: Open directly

You can also open `index.html` directly in a browser.

## Maintenance Notes

- External links opened in a new tab use `rel="noopener noreferrer"`.
- Reduced-motion preference is respected by disabling animations.
- Canvas animation pauses when the page is hidden to reduce background CPU usage.

## License

MIT (or project owner's preferred license).
