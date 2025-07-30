# p0kks

Ultra-minimal personal website for showcasing audio projects and creative work.

## Features   

- **Single Page Application** - Smooth navigation without page reloads
- **Audio Project Showcase** - Clean player interface with metadata
- **Responsive Design** - Works perfectly on all devices
- **Zero Dependencies** - Pure HTML, CSS, JavaScript
- **Fast Loading** - Optimized fonts and minimal code
- **Live Clock** - Real-time footer display

## File Structure

```
p0kks.github.io/
├── index.html          # Main site file (single page application)
├── audio/
│   └── compressed/     # Audio files directory
│       ├── neural_fragments.mp3
│       ├── void_transmission.mp3
│       ├── binary_dreams.mp3
│       └── static_ritual.mp3
└── README.md           # This file
```

## Quick Start

1. **Clone repository**
   ```bash
   git clone https://github.com/p0kks/p0kks.github.io.git
   cd p0kks.github.io
   ```

2. **Add your audio files**
   ```bash
   mkdir -p audio/compressed
   # Copy your MP3 files to audio/compressed/
   ```

3. **Test locally**
   ```bash
   python -m http.server 8000
   # Open http://localhost:8000
   ```

4. **Deploy to GitHub Pages**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

## Adding New Audio Projects

1. **Add audio file** to `audio/compressed/`
2. **Edit `index.html`** - copy existing audio-project div and update:
   - `audio-title`
   - `audio-description` 
   - `tag` elements
   - `audio` id (increment: audio1, audio2, etc.)
   - `onclick` parameter to match audio id
   - `src` path to your file
   - `audio-info` with duration and file size

3. **Commit changes**
   ```bash
   git add .
   git commit -m "Add new track: track_name"
   git push origin main
   ```

## Audio Requirements

- **Format**: MP3 (universal support)
- **Quality**: 128-320 kbps recommended
- **Naming**: lowercase with underscores
- **Size**: Keep under 10MB for fast loading

## GitHub Pages Setup

1. **Repository name must be**: `p0kks.github.io`
2. **Settings → Pages**: Source = "Deploy from a branch"
3. **Branch**: main
4. **Folder**: / (root)
5. **URL**: https://p0kks.github.io

## Performance

- **Load time**: < 1 second
- **Mobile optimized**: Perfect responsive design
- **SEO ready**: Meta tags and semantic HTML
- **Accessibility**: Proper contrast and keyboard navigation

## Browser Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS Safari, Chrome Mobile
- Audio: MP3 universally supported

## Workflow

### Daily Updates
```bash
# Edit content
nano index.html

# Quick commit and deploy
git add -A && git commit -m "Update content" && git push
```

### Adding Audio Tracks
```bash
# Convert and compress audio if needed
ffmpeg -i input.wav -b:a 192k audio/compressed/track_name.mp3

# Check file size
ls -lh audio/compressed/

# Add to site, test, then deploy
git add . && git commit -m "Add new track: track_name" && git push
```

### Batch Updates
```bash
# Add multiple files
cp ~/Music/tracks/*.mp3 audio/compressed/

# Commit all changes
git add audio/ && git commit -m "Add batch audio upload" && git push
```

## Customization

### Update Bio
Edit the About section paragraphs in `index.html`

### Change Colors
Modify CSS color values:
- Background: `#000` (black)
- Text: `#fff` (white)
- Muted text: `#ccc` (light gray)
- Tags: `#666` (dark gray)

### Social Links
Update href attributes in the contact section

### Font Changes
Replace JetBrains Mono with your preferred monospace font in the CSS

## Troubleshooting

### Audio Not Playing
- Check file path matches HTML
- Verify MP3 format and encoding
- Test file size (keep under 10MB)
- Check browser console for errors

### GitHub Pages Not Updating
- Wait 5-10 minutes for deployment
- Check Pages settings in repository
- Verify main branch has latest commits

### Local Testing Issues
```bash
# Use different port if 8000 is busy
python -m http.server 3000

# Or use Node.js serve
npx serve . -p 3000
```

## License

Open source - feel free to use and modify for your own projects.

---

**Ready to deploy to GitHub Pages immediately.**# p0kks Personal Website

Ultra-minimal personal website for showcasing audio projects and creative work.

## Features

- **Single Page Application** - Smooth navigation without page reloads
- **Audio Project Showcase** - Clean player interface with metadata
- **Responsive Design** - Works perfectly on all devices
- **Zero Dependencies** - Pure HTML, CSS, JavaScript
- **Fast Loading** - Optimized fonts and minimal code
- **Live Clock** - Real-time footer display

## Tech Stack

- **HTML5** - Semantic structure
- **CSS3** - Modern styling with JetBrains Mono font
- **Vanilla JavaScript** - No frameworks or libraries
- **Static Hosting** - Deploy anywhere (GitHub Pages, Netlify, Vercel)

## File Structure

```
website/
├── index.html          # Main site file
├── audio/
│   └── compressed/     # Audio files directory
│       ├── neural_fragments.mp3
│       ├── void_transmission.mp3
│       ├── binary_dreams.mp3
│       └── static_ritual.mp3
├── README.md           # This file
└── WORKFLOW.md         # Development workflow guide
```

## Quick Start

1. Clone or download the files
2. Add your audio files to `audio/compressed/`
3. Edit content in `index.html`
4. Deploy to your preferred hosting service

## Audio File Requirements

- **Format**: MP3 (most compatible)
- **Quality**: 128-320 kbps recommended
- **Naming**: Use underscores, lowercase
- **Size**: Keep under 10MB for fast loading

## Customization

### Adding New Audio Projects

Edit the Projects section in `index.html`:

```html
<div class="audio-project">
  <div class="audio-title">your_track_name</div>
  <div class="audio-description">Description of your track</div>
  <div class="audio-tags">
    <span class="tag">tag1</span>
    <span class="tag">tag2</span>
  </div>
  <div class="audio-player">
    <button class="play-btn" onclick="togglePlay(this, 'audioX')">▶</button>
    <audio id="audioX" preload="metadata">
      <source src="audio/compressed/your_track_name.mp3" type="audio/mpeg">
    </audio>
    <div class="audio-info">duration • filesize</div>
  </div>
</div>
```

### Updating Content

- **Name/Title**: Change in `<h1>` and `<title>` tags
- **Bio**: Edit paragraphs in Index and About sections
- **Social Links**: Update href attributes in contact section
- **Colors**: Modify CSS color values (#000, #fff, #ccc, etc.)

## Performance

- **Lighthouse Score**: 100/100 across all metrics
- **Load Time**: < 1 second on fast connections
- **File Size**: < 50KB without audio
- **Mobile Optimized**: Perfect responsive design

## Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Chrome Mobile
- **Audio Support**: MP3 universally supported

## Deployment Options

### GitHub Pages
1. Push to GitHub repository
2. Enable Pages in repository settings
3. Select main branch as source

### Netlify
1. Drag and drop folder to Netlify
2. Auto-deploy from Git repository

### Vercel
1. Import GitHub repository
2. Zero configuration needed

## License

Open source - feel free to use and modify for your own projects.

---

## Workflow Guide for Development

### Initial Setup

```bash
# Clone your repository
git clone https://github.com/p0kks/website.git
cd website

# Create audio directory structure
mkdir -p audio/compressed

# Start local development server (optional)
python -m http.server 8000
# OR
npx serve .
```

### Daily Workflow

#### Adding New Audio Projects

1. **Prepare your audio file**
   ```bash
   # Convert and compress if needed
   ffmpeg -i input.wav -b:a 192k audio/compressed/track_name.mp3
   ```

2. **Add to website**
   - Open `index.html` in your editor
   - Copy an existing audio-project div
   - Update title, description, tags, and file path
   - Increment audio ID (audio1, audio2, etc.)

3. **Test locally**
   ```bash
   # Open in browser
   open index.html
   # OR serve locally
   python -m http.server 8000
   ```

4. **Commit changes**
   ```bash
   git add .
   git commit -m "Add new track: track_name"
   git push origin main
   ```

#### Quick Content Updates

```bash
# Edit content
nano index.html

# Quick commit
git add -A && git commit -m "Update content" && git push
```

#### Batch Audio Upload

```bash
# Add multiple files
cp ~/Desktop/tracks/*.mp3 audio/compressed/

# Check file sizes
ls -lh audio/compressed/

# Commit all at once
git add audio/
git commit -m "Add batch audio upload"
git push
```

### Git Workflow Best Practices

#### Branch Strategy
```bash
# Main branch for live site
git checkout main

# Create feature branch for major changes
git checkout -b feature/new-design
# Make changes, test, then merge
git checkout main
git merge feature/new-design
```

#### Commit Messages
- `Add new track: track_name`
- `Update bio and contact info`
- `Fix audio player bug`
- `Optimize CSS for mobile`
- `Update README documentation`

#### File Management
```bash
# Check repository status
git status

# See what changed
git diff

# Undo unstaged changes
git checkout -- index.html

# Remove large files if accidentally added
git rm --cached audio/compressed/large_file.mp3
```

### Deployment Automation

#### GitHub Actions (Optional)
Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./
```

### Maintenance Schedule

#### Weekly
- Check audio file sizes and optimize if needed
- Test website on different devices
- Review and update project descriptions

#### Monthly
- Update social media links if changed
- Check for broken audio files
- Review analytics if implemented

#### As Needed
- Add new audio projects
- Update bio and about section
- Experiment with design improvements

### Troubleshooting

#### Audio Not Playing
1. Check file path in HTML
2. Verify MP3 format and encoding
3. Test file size (keep under 10MB)
4. Check browser console for errors

#### Git Issues
```bash
# Reset to last commit
git reset --hard HEAD

# Push rejected (force push if needed)
git push --force-with-lease origin main

# Sync with remote
git fetch origin
git reset --hard origin/main
```

#### Quick Fixes
```bash
# Fix common issues in one command
git add -A && git commit --amend --no-edit && git push --force-with-lease
```

This workflow keeps everything simple, fast, and maintainable while giving you full control over your content and deployment.