# p0kks

Ultra-minimal personal website for showcasing audio and computer projects.

## Features

- **Single Page Application** - Smooth navigation without page reloads.
- **Data-Driven Content** - Projects are loaded from JSON files for easy updates.
- **Audio Projects**    - Sections for audio projects.
- **Computer Projects** - Sections for computer projects.
- **Responsive Design** - Works perfectly on all devices.
- **Zero Dependencies** - Pure HTML, CSS, JavaScript.
- **Fast Loading** - Optimized fonts and minimal code.
- **Live Clock** - Real-time footer display.

## File Structure

```
p0kks.github.io/
├── index.html
├── computer-projects.json
├── computer/
│   └── ...
├── audio-projects.json
├── audio/
│   └── ...
└── readme.md
```

## How to Update Projects

### Computer Projects

1.  Upload your file or link to the `computer/` directory.
2.  Edit `computer-projects.json`.
3.  Add a new JSON object to the array for each new project.

**Example `computer-projects.json` entry:**

```json
{
  "title": "My New Project",
  "description": "A brief description of my awesome project.",
  "tags": ["python", "api", "backend"],
  "link": "https://github.com/p0kks/my-new-project"
}
```

### Audio Projects

1.  Upload your audio file to the `audio/` directory.
2.  Edit `audio-projects.json`.
3.  Add a new JSON object to the array for each new track.

**Example `audio-projects.json` entry:**

```json
{
  "title": "My New Track",
  "description": "A description of the new audio track.",
  "tags": ["ambient", "experimental"],
  "audioSrc": "audio/compressed/my_new_track.mp3",
  "duration": "3:14",
  "size": "4.5mb"
}
```

## License

Open source - feel free to use and modify for your own projects.
