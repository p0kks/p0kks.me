const CONFIG = {
  owner: 'p0kks',
  repo: 'p0kks.me',
  apiBase: 'https://api.github.com',
  cacheTTL: 5 * 60 * 1000, // 5 minutes
  labels: {
    audio: 'audio work',
    code: 'code work',
    note: 'note'
  }
};

const state = {
  token: localStorage.getItem('gh_token') || '',
  cache: {},
  activeSection: 'audio'
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadAllContent();
});

function setupEventListeners() {
  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const section = e.target.dataset.section;
      switchSection(section);
    });
  });

  // Token management
  document.getElementById('tokenSave').addEventListener('click', saveToken);
  document.getElementById('tokenClear').addEventListener('click', clearToken);
  document.getElementById('tokenInput').value = state.token ? '••••••••' : '';

  // Note creation
  document.getElementById('createNoteBtn').addEventListener('click', toggleNoteForm);
  document.getElementById('cancelNote').addEventListener('click', toggleNoteForm);
  document.getElementById('noteForm').addEventListener('submit', createNote);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const form = document.getElementById('noteForm');
      if (!form.classList.contains('hidden')) {
        toggleNoteForm();
      }
    }
  });
}

function switchSection(section) {
  state.activeSection = section;
  
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });
  
  document.querySelectorAll('.section').forEach(sec => {
    sec.classList.toggle('active', sec.id === `${section}-section`);
  });
}

function saveToken() {
  const input = document.getElementById('tokenInput');
  const token = input.value.trim();
  
  if (token && token !== '••••••••') {
    state.token = token;
    localStorage.setItem('gh_token', token);
    input.value = '••••••••';
    showStatus('Token saved. Reloading content...', 'loading');
    clearCache();
    loadAllContent();
  }
}

function clearToken() {
  state.token = '';
  localStorage.removeItem('gh_token');
  document.getElementById('tokenInput').value = '';
  showStatus('Token cleared. Using public API.', 'loading');
  clearCache();
  loadAllContent();
}

function clearCache() {
  state.cache = {};
  localStorage.removeItem('gh_cache');
}

function showStatus(message, type = 'loading') {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  
  if (type === 'error') {
    setTimeout(() => status.classList.add('hidden'), 5000);
  }
}

function hideStatus() {
  document.getElementById('status').classList.add('hidden');
}

async function loadAllContent() {
  showStatus('Loading content...', 'loading');
  
  try {
    const issues = await fetchIssues();
    renderAudio(issues);
    renderCode(issues);
    renderNotes(issues);
    hideStatus();
  } catch (error) {
    showStatus(`Error: ${error.message}`, 'error');
  }
}

async function fetchIssues() {
  const cacheKey = 'all_issues';
  const cached = getCache(cacheKey);
  
  if (cached) {
    return cached;
  }
  
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  if (state.token) {
    headers['Authorization'] = `token ${state.token}`;
  }
  
  const url = `${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/issues?state=open&per_page=100`;
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  
  const issues = await response.json();
  setCache(cacheKey, issues);
  
  return issues;
}

function getCache(key) {
  const cached = state.cache[key];
  if (cached && Date.now() - cached.timestamp < CONFIG.cacheTTL) {
    return cached.data;
  }
  return null;
}

function setCache(key, data) {
  state.cache[key] = {
    data,
    timestamp: Date.now()
  };
}

function filterIssuesByLabel(issues, label) {
  return issues.filter(issue => 
    issue.labels.some(l => l.name.toLowerCase() === label.toLowerCase())
  );
}

function renderAudio(issues) {
  const audioIssues = filterIssuesByLabel(issues, CONFIG.labels.audio);
  const grid = document.getElementById('audio-grid');
  
  if (audioIssues.length === 0) {
    grid.innerHTML = '<p style="font-family: var(--mono); color: var(--text-dim);">No audio work found.</p>';
    return;
  }
  
  grid.innerHTML = audioIssues.map(issue => {
    const audioUrl = extractAudioUrl(issue.body);
    const coverUrl = extractImageUrl(issue.body);
    const excerpt = sanitizeAndTruncate(issue.body, 150);
    
    return `
      <article class="card">
        <div class="card-header">
          <a href="${issue.html_url}" target="_blank" rel="noopener" class="card-title">
            ${escapeHtml(issue.title)}
          </a>
          <span class="card-number">#${issue.number}</span>
        </div>
        ${coverUrl ? `<img src="${coverUrl}" alt="Cover art" class="cover-art" loading="lazy">` : ''}
        ${excerpt ? `<div class="card-body">${excerpt}</div>` : ''}
        ${audioUrl ? `
          <div class="audio-player">
            <audio controls preload="metadata">
              <source src="${audioUrl}">
              Your browser does not support audio playback.
            </audio>
          </div>
        ` : ''}
        ${renderLabels(issue.labels)}
        ${renderMeta(issue)}
      </article>
    `;
  }).join('');
}

function renderCode(issues) {
  const codeIssues = filterIssuesByLabel(issues, CONFIG.labels.code);
  const grid = document.getElementById('code-grid');
  
  if (codeIssues.length === 0) {
    grid.innerHTML = '<p style="font-family: var(--mono); color: var(--text-dim);">No code work found.</p>';
    return;
  }
  
  grid.innerHTML = codeIssues.map(issue => {
    const description = sanitizeAndTruncate(issue.body, 200);
    const repoLinks = extractRepoLinks(issue.body);
    const languages = extractLanguages(issue.body);
    
    return `
      <article class="card">
        <div class="card-header">
          <a href="${issue.html_url}" target="_blank" rel="noopener" class="card-title">
            ${escapeHtml(issue.title)}
          </a>
          <span class="card-number">#${issue.number}</span>
        </div>
        ${description ? `<div class="card-body">${description}</div>` : ''}
        ${languages.length > 0 ? `
          <div class="badges">
            ${languages.map(lang => `<span class="badge">${escapeHtml(lang)}</span>`).join('')}
          </div>
        ` : ''}
        ${repoLinks.length > 0 ? `
          <div class="code-links">
            ${repoLinks.map(link => `
              <a href="${link.url}" target="_blank" rel="noopener">${escapeHtml(link.text)}</a>
            `).join('')}
          </div>
        ` : ''}
        ${renderLabels(issue.labels)}
        ${renderMeta(issue)}
      </article>
    `;
  }).join('');
}

function renderNotes(issues) {
  const noteIssues = filterIssuesByLabel(issues, CONFIG.labels.note);
  const grid = document.getElementById('notes-grid');
  
  if (noteIssues.length === 0) {
    grid.innerHTML = '<p style="font-family: var(--mono); color: var(--text-dim);">No notes yet.</p>';
    return;
  }
  
  grid.innerHTML = noteIssues.map(issue => {
    const content = sanitizeAndTruncate(issue.body, 250);
    
    return `
      <article class="card">
        <div class="card-header">
          <a href="${issue.html_url}" target="_blank" rel="noopener" class="card-title">
            ${escapeHtml(issue.title)}
          </a>
          <span class="card-number">#${issue.number}</span>
        </div>
        ${content ? `<div class="card-body">${content}</div>` : ''}
        ${renderMeta(issue)}
      </article>
    `;
  }).join('');
}

function renderLabels(labels) {
  if (labels.length === 0) return '';
  
  return `
    <div class="labels">
      ${labels.map(label => `
        <span class="label" style="background-color: #${label.color}20; border: 1px solid #${label.color};">
          ${escapeHtml(label.name)}
        </span>
      `).join('')}
    </div>
  `;
}

function renderMeta(issue) {
  const date = new Date(issue.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  return `
    <div class="card-meta">
      <span>📅 ${date}</span>
      <span>💬 ${issue.comments}</span>
      <span>👤 ${escapeHtml(issue.user.login)}</span>
    </div>
  `;
}

function toggleNoteForm() {
  const form = document.getElementById('noteForm');
  const btn = document.getElementById('createNoteBtn');
  
  form.classList.toggle('hidden');
  btn.classList.toggle('hidden');
  
  if (!form.classList.contains('hidden')) {
    document.getElementById('noteTitle').focus();
  }
}

async function createNote(e) {
  e.preventDefault();
  
  const title = document.getElementById('noteTitle').value.trim();
  const body = document.getElementById('noteBody').value.trim();
  
  if (!title || !body) return;
  
  if (!state.token) {
    // Fallback to GitHub UI
    const url = `https://github.com/${CONFIG.owner}/${CONFIG.repo}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(CONFIG.labels.note)}`;
    window.open(url, '_blank');
    toggleNoteForm();
    document.getElementById('noteForm').reset();
    return;
  }
  
  showStatus('Creating note...', 'loading');
  
  try {
    const response = await fetch(`${CONFIG.apiBase}/repos/${CONFIG.owner}/${CONFIG.repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${state.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        body,
        labels: [CONFIG.labels.note]
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to create note');
    }
    
    showStatus('Note created successfully!', 'loading');
    setTimeout(() => {
      hideStatus();
      toggleNoteForm();
      document.getElementById('noteForm').reset();
      clearCache();
      loadAllContent();
    }, 1000);
    
  } catch (error) {
    showStatus(`Error creating note: ${error.message}`, 'error');
  }
}

// Utility functions
function extractAudioUrl(text) {
  if (!text) return null;
  const audioRegex = /https?:\/\/[^\s]+\.(mp3|wav|ogg|m4a)/i;
  const match = text.match(audioRegex);
  return match ? match[0] : null;
}

function extractImageUrl(text) {
  if (!text) return null;
  const imageRegex = /!\[.*?\]\((https?:\/\/[^\s)]+)\)/;
  const match = text.match(imageRegex);
  return match ? match[1] : null;
}

function extractRepoLinks(text) {
  if (!text) return [];
  const links = [];
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/github\.com\/[^\s)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    links.push({ text: match[1], url: match[2] });
  }
  
  return links;
}

function extractLanguages(text) {
  if (!text) return [];
  const langRegex = /```(\w+)/g;
  const languages = new Set();
  let match;
  
  while ((match = langRegex.exec(text)) !== null) {
    languages.add(match[1]);
  }
  
  return Array.from(languages);
}

function sanitizeAndTruncate(text, maxLength) {
  if (!text) return '';
  
  // Remove markdown links but keep text
  let clean = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  // Remove images
  clean = clean.replace(/!\[.*?\]\([^\)]+\)/g, '');
  // Remove code blocks
  clean = clean.replace(/```[\s\S]*?```/g, '');
  // Remove inline code
  clean = clean.replace(/`[^`]+`/g, '');
  // Remove headers
  clean = clean.replace(/^#+\s+/gm, '');
  // Clean whitespace
  clean = clean.replace(/\s+/g, ' ').trim();
  
  if (clean.length > maxLength) {
    return escapeHtml(clean.substring(0, maxLength)) + '...';
  }
  
  return escapeHtml(clean);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}