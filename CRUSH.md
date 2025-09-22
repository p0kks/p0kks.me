# CRUSH.md - p0kks.github.io

## Project Overview
Static website hosted on GitHub Pages. No build process required.

## Commands
```bash
# No build/lint/test commands needed - static HTML site
# To test locally:
# python -m http.server 8000
# Then visit http://localhost:8000
```

## Code Style Guidelines
- Use HTML5 semantic elements
- Keep CSS simple and minimal
- Optimize images for web (under 100KB when possible)
- Use descriptive alt text for images
- Maintain clean, readable HTML structure
- Prefer external assets over inline styles/scripts
- Use lowercase filenames with hyphens as separators
- Comment code when purpose isn't immediately obvious

## Naming Conventions
- Filenames: lowercase with hyphens (e.g., profile-pic.png)
- CSS classes: lowercase with hyphens (e.g., .main-header)
- IDs: descriptive and unique

## Error Handling
- Ensure all links are valid
- Test site responsiveness on mobile
- Check image loading and alt text
- Validate HTML structure

## Import Guidelines
- Use absolute paths for assets
- Keep external dependencies minimal
- Prefer native HTML/CSS/JS over frameworks

## Additional Notes
- This is a static site - no dynamic content
- Changes are deployed automatically via GitHub Pages
- Keep the site lightweight and fast-loading