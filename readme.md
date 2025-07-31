# p0kks

Ultra-minimal personal website showcasing the intersection of code and music.

## About

Clean, fast, and functional personal portfolio built with zero dependencies. Features dynamic project loading, audio playback, and responsive design.

## Features

• **Zero Dependencies** - Pure HTML, CSS, JavaScript
• **Audio Integration** - Built-in audio player for music projects  
• **Dynamic Content** - Projects loaded from JSON files
• **Responsive Design** - Works on all devices
• **Fast Loading** - Optimized fonts and minimal code
• **Dark Theme** - Easy on the eyes
• **Live Clock** - Real-time footer display

## Structure

```
├── index.html           # Main site file
├── dev/
│   └── dev.json        # Computer projects data
├── audio/
│   ├── audio.json      # Audio projects data
│   └── *.mp3           # Audio files
└── p0kks.png           # Site icon
```

## Adding Projects

### Computer Projects
Edit `dev/dev.json`:
```json
{
  "title": "Project Name",
  "description": "Brief description",
  "tags": ["javascript", "minimal"],
  "link": "https://github.com/username/repo"
}
```

### Audio Projects  
Edit `audio/audio.json`:
```json
{
  "title": "Track Name",
  "description": "Track description", 
  "tags": ["ambient", "experimental"],
  "audioSrc": "audio/track.mp3",
  "duration": "3:14",
  "size": "4.5mb"
}
```

## Live Site

Visit: [p0kks.github.io](https://p0kks.github.io)

## License

Open source - use and modify freely.