# p0kks.me

A high-performance, minimal personal portal designed with an "Obsidian" brutalist aesthetic. Built for speed, accessibility, and seamless content delivery.

## 🚀 Features

- **Brutalist Design**: High-contrast, grayscale aesthetic with focus on typography and hierarchy.
- **Dynamic Content**: Fetches portfolio items and journal entries directly from GitHub Issues using the GitHub REST API.
- **Optimized Performance**: 
    - Zero frameworks, zero dependencies (build-less).
    - Session-based caching for API requests.
    - Optimized canvas animations with `visibilitychange` detection to save CPU.
- **Glassmorphic UI**: Interactive elements use sophisticated frosted-glass effects with native `-webkit-backdrop-filter` support.
- **Responsive Layout**: Fluid design that adapts from mobile to large desktop screens.
- **Matrix Background**: Custom animated Nordic Rune matrix effect (Elder Futhark) that respects `prefers-reduced-motion`.
- **Accessible & SEO Ready**: Semantic HTML5, ARIA compliance, and full Open Graph/Twitter metadata.

## 🛠 Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Custom Properties), Vanilla JavaScript (ES6+).
- **External Dependencies**: 
    - [Marked.js](https://marked.js.org/) (Markdown parsing)
    - [DOMPurify](https://github.com/cure53/dompurify) (XSS sanitization)
    - [Highlight.js](https://highlightjs.org/) (Code syntax highlighting)
- **Content Management**: GitHub Issues (leveraged as a lightweight Headless CMS).

## 📁 Project Structure

```text
.
├── .github/workflows/  # CI/CD for GitHub Pages
├── assets/
│   └── images/         # Optimized branding and profile assets
├── index.html          # Core application logic and structure
├── style.css           # Global design system and component styles
├── CNAME               # Custom domain configuration
└── README.md           # Documentation
```

## 🛠 Local Development

Any static file server will work. For example:

```bash
# Using Python
python -m http.server 8000

# Using Node (npx)
npx serve .
```

## 🚢 Deployment

Automatically deployed to **GitHub Pages** via the included GitHub Actions workflow (`static.yml`). Pushing to the `main` branch triggers an instant build and deployment.

## ⚖️ License

MIT © 2026 [p0kks](https://p0kks.me)
