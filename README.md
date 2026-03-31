# p0kks.me

A minimal personal website hosted on GitHub Pages. A static single-page application (SPA) that fetches data from GitHub API to display portfolio items and journal entries.

## Features

- **Static Site**: No server, no build process
- **SPA Architecture**: Hash-based routing for smooth navigation
- **GitHub API Integration**: Dynamic content from GitHub issues
- **Vanilla JavaScript**: No frameworks or external dependencies
- **Privacy-Focused**: No client-side tracking, cookies, or analytics
- **Performance Optimized**: API response caching with 5-minute expiration
- **Visual Micro-Interactions**: Subtle animations and feedback
- **Responsive Design**: Mobile-first approach
- **Dark Mode Only**: Optimized for dark themes
- **Accessibility**: WCAG compliant with focus management and semantic HTML

## Tech Stack

- **Frontend**: HTML5, CSS3, ES6+ JavaScript
- **Styling**: CSS Custom Properties (variables), Flexbox, Grid
- **Routing**: Hash-based SPA routing
- **API**: GitHub REST API v3
- **Caching**: In-memory response caching
- **Hosting**: GitHub Pages
- **Domain**: Custom domain (p0kks.me)

## Project Structure

```
p0kks.me/
├── assets/
│   ├── css/
│   │   ├── variables.css  # CSS custom properties (colors, spacing, typography)
│   │   └── main.css       # Main styles and layout (includes animations)
│   ├── js/
│   │   ├── app.js         # Entry point, DOMContentLoaded handler
│   │   ├── router.js      # Hash-based SPA router
│   │   ├── render.js      # Content rendering (portfolio, journal, markdown, featured)
│   │   ├── api.js         # GitHub API client with caching
│   │   ├── cache.js       # In-memory API response caching
│   │   ├── config.js      # Configuration (owner, repo, labels, limits)
│   │   └── modal.js       # Modal dialog system (with focus trap)
│   └── icons/
│       └── favicon.svg    # Site favicon
├── content/
│   └── placeholder.md     # Placeholder file (currently unused)
├── meta/
│   ├── philosophy.md      # Project philosophy
│   └── privacy.md         # Privacy statement
├── 404.html               # GitHub Pages 404 error page
├── CNAME                  # Custom domain configuration (p0kks.me)
├── index.html             # Main HTML entry point
├── .gitignore             # Git ignore rules
├── README.md              # Project description
└── AGENTS.md              # Agent documentation
```

## Development

### Local Development

**1. Serve locally** (optional, for testing):
```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)
npx http-server -p 8000

# Using PHP (if installed)
php -S localhost:8000
```

**2. Open in browser:**
Navigate to `http://localhost:8000`

**3. View in browser:**
Simply open `index.html` directly in a browser (file:// protocol works).

### Content Management

Portfolio and journal content is sourced from GitHub issues in this repository:

- **Portfolio Items**: Issues labeled `portfolio`
- **Journal Entries**: Issues labeled `journal`
- **Featured Items**: Issues labeled `featured` (displayed on home page)
- **Content Format**: Issue body rendered as Markdown
- **Title**: Issue title becomes the display title

### Configuration

Edit `assets/js/config.js` to customize:

```javascript
export const CONFIG = {
  owner: "p0kks",           // GitHub username
  repo: "p0kks.me",         // Repository name
  labels: {
    portfolio: "portfolio", // Label for portfolio items
    journal: "journal",     // Label for journal entries
    featured: "featured"    // Label for featured items
  },
  limits: {
    journalRecent: 3        // Number of recent journal entries to show
  },
  perPage: 100              // GitHub API pagination limit
};
```

## Customization

### Styling

- **Variables**: Edit `assets/css/variables.css` for design tokens
- **Layout**: Edit `assets/css/main.css` for styles and animations
- **Colors**: All colors defined as CSS custom properties for easy theming

### Content

- **Home Page**: Featured portfolio items (labeled `featured` in GitHub)
- **Portfolio**: All issues labeled `portfolio`
- **Journal**: All issues labeled `journal`
- **About**: Static content in `index.html`

### Navigation

Hash-based routing:
- `#home` - Home page with featured items
- `#portfolio` - Portfolio section
- `#journal` - Journal section
- `#journal-123` - Individual journal entry

## API Integration

The site fetches data from GitHub API:
```
https://api.github.com/repos/{owner}/{repo}/issues
```

**Rate Limiting**: 60 requests/hour for unauthenticated requests. Caching reduces API calls.

**Response Format**:
```json
[
  {
    "number": 123,
    "title": "Issue Title",
    "body": "Markdown content",
    "created_at": "2024-01-01T00:00:00Z",
    "html_url": "https://github.com/p0kks/p0kks.me/issues/123",
    "labels": [
      { "name": "portfolio" }
    ],
    "pull_request": null
  }
]
```

## Performance

- **No Build Process**: Direct deployment to GitHub Pages
- **Caching**: 5-minute in-memory cache for API responses
- **Minimal Bundle**: Under 50KB total (excluding images)
- **Fast Loading**: Optimized for quick initial page loads
- **No External Dependencies**: Pure vanilla implementation

## Privacy & Security

- **No Tracking**: No analytics, cookies, or client-side tracking
- **IP Logging**: GitHub API requests may log IP addresses (standard web behavior)
- **Public Repository**: All content is publicly accessible via GitHub
- **HTTPS Only**: Served over secure connection

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- CSS Grid and Flexbox support required
- No Internet Explorer support

## License

MIT License - see LICENSE file for details.

## Author

**p0kks** - [GitHub](https://github.com/p0kks) - [Website](https://p0kks.me)

## Contributing

This is a personal website project. For suggestions or issues, please open a GitHub issue.

## Acknowledgments

- Built with vanilla HTML, CSS, and JavaScript
- Hosted on GitHub Pages
- Content managed via GitHub Issues
- Inspired by minimal web design principles
