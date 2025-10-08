// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();

    // Initialize hotlinks
    initHotlinks();
    
    // Initialize project filtering
    initProjectFilter();

    // Initialize dropdowns
    initDropdowns();

    // Update current year in footer
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // Notes system using GitHub Issues
    const notesContainer = document.getElementById('notes-content');
    if (notesContainer) {
        loadNotes();
    }

    // Projects system using GitHub Issues
    const projectsContainer = document.querySelector('.project-container');
    if (projectsContainer) {
        loadProjects();
    }

async function loadNotes() {
    try {
        notesContainer.innerHTML = '<p class="loading-notes">Loading notes...</p>';
        
        const response = await fetch('https://api.github.com/repos/p0kks/p0kks.me/issues?labels=note&state=open&sort=created&direction=desc');
        
        if (!response.ok) {
            throw new Error('Failed to fetch notes');
        }
        
        const notes = await response.json();
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<p class="no-notes">No notes yet. Check back soon!</p>';
            return;
        }
        
        notesContainer.innerHTML = '';
        
        notes.forEach(note => {
            const noteEl = document.createElement('details');
            noteEl.className = 'dropdown-note';
            noteEl.innerHTML = `
                <summary class="interactive-element">
                    <div>
                        <div class="note-date">${new Date(note.created_at).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                        })}</div>
                        ${escapeHtml(note.title)}
                    </div>
                    <span class="dropdown-icon">+</span>
                </summary>
                <div class="dropdown-content">
                    <div class="note-content">${renderMarkdown(note.body)}</div>

                </div>
            `;
            notesContainer.appendChild(noteEl);
        });

        initDropdowns();
        
    } catch (error) {
        console.error('Error loading notes:', error);
        notesContainer.innerHTML = `
            <p class="notes-error">
                Unable to load notes. <br>
                <small>Make sure the <a href="https://github.com/p0kks/p0kks.me" target="_blank">p0kks.me repository</a> exists.</small>
            </p>
        `;
    }
}

function renderMarkdown(text) {
    if (!text) return '';

    let html = text.trim();

    // GitHub callouts
    html = html.replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/gim,
        '<div class="callout callout-$1"><strong>$1</strong> $2</div>');
    html = html.replace(/^> ([^\[!].*)$/gim, '<blockquote>$1</blockquote>');

    // Headers
    html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>');
    html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>');
    html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>');
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold and italic
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    html = html.replace(/_(.*?)_/gim, '<em>$1</em>');
    html = html.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Code blocks and inline code
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>');
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Links
    html = html.replace(/\[([^\[]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Images
    html = html.replace(/!\[([^\[]+)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" loading="lazy">');

    // Line breaks and paragraphs
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/<li>[\s\S]*?<\/li>/gim, matches => `<ul>${matches}</ul>`);

    // Wrap in paragraph if no other block elements
    html = html.replace(/^(?!<[h|ul|ol|pre|blockquote|div])([\s\S]*?)$/gim, '<p>$1</p>');

    // Remove leading and trailing <br> tags
    html = html.replace(/^<p><br>/, '<p>').replace(/<br><\/p>$/, '<\/p>');

    return html;
}

// HTML escape function
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Projects system using GitHub Issues
async function loadProjects() {
    try {
        projectsContainer.innerHTML = '<p class="loading-notes">Loading projects...</p>';
        
        const response = await fetch('https://api.github.com/repos/p0kks/p0kks.me/issues?labels=project&state=open&sort=created&direction=desc');
        
        if (!response.ok) throw new Error('Failed to fetch projects');
        
        const projects = await response.json();
        
        if (projects.length === 0) {
            // Show fallback projects if no GitHub issues found
            showFallbackProjects();
            return;
        }
        
        projectsContainer.innerHTML = '';
        
        projects.forEach(project => {
            const category = project.labels.find(label => 
                ['code', 'audio', 'other'].includes(label.name.toLowerCase())
            )?.name || 'other';
            
            const projectEl = document.createElement('details');
            projectEl.className = 'dropdown-project';
            projectEl.dataset.category = category;
            projectEl.innerHTML = `
                <summary class="interactive-element">
                    <div>
                        <div class="project-subtitle">${new Date(project.created_at).getFullYear()}</div>
                        <span class="project-title">${escapeHtml(project.title)}</span>
                    </div>
                    <span class="dropdown-icon">+</span>
                </summary>
                <div class="dropdown-content">
                    <div class="project-description">${renderMarkdown(project.body)}</div>

                </div>
            `;
            projectsContainer.appendChild(projectEl);
        });

        initDropdowns();
        
        // Re-initialize filter functionality
        initProjectFilter();
        
    } catch (error) {
        console.error('Error loading projects:', error);
        showFallbackProjects();
    }
}

function showFallbackProjects() {
    projectsContainer.innerHTML = `
        <p class="no-notes">
            No GitHub projects found. <br>
            <small>
                Create issues with the "project" label in the 
                <a href="https://github.com/p0kks/p0kks.me" target="_blank">p0kks.me repository</a>.
                <br>Use labels: "code", "audio", "other" for categories, "live" for live projects.
            </small>
        </p>
        <div style="margin-top: 2rem;">
            <p style="text-align: center; opacity: 0.7; margin-bottom: 1rem;">Example projects:</p>
            ${getFallbackProjectsHTML()}
        </div>
    `;
    
    // Initialize filter functionality for fallback projects
    initProjectFilter();

    // Initialize dropdowns for fallback projects
    initDropdowns();
}

function getFallbackProjectsHTML() {
    return `
        <details class="dropdown-project" data-category="code">
            <summary class="interactive-element">
                <div>
                    <div class="project-subtitle">03/10/2025</div>
                    p0kks.me
                </div>
                <span class="dropdown-icon">+</span>
            </summary>
            <div class="dropdown-content">
                <div class="project-description">This portfolio website. Built with plain HTML, CSS and JavaScript.</div>
            </div>
        </details>
        <details class="dropdown-project" data-category="code">
            <summary class="interactive-element">
                <div>
                    <div class="project-subtitle">03/10/2025</div>
                    Discord Bot
                </div>
                <span class="dropdown-icon">+</span>
            </summary>
            <div class="dropdown-content">
                <div class="project-description">A custom Discord bot for a community server, built with Node.js. It provides various utility commands, moderation tools, and fun features.</div>
            </div>
        </details>
        <details class="dropdown-project" data-category="audio">
            <summary class="interactive-element">
                <div>
                    <div class="project-subtitle">03/10/2025</div>
                    Ambient Music
                </div>
                <span class="dropdown-icon">+</span>
            </summary>
            <div class="dropdown-content">
                <div class="project-description">A collection of short, experimental ambient tracks. Exploring textures and soundscapes.</div>
            </div>
        </details>
        <details class="dropdown-project" data-category="other">
            <summary class="interactive-element">
                <div>
                    <div class="project-subtitle">03/10/2025</div>
                    Reaper Configuration
                </div>
                <span class="dropdown-icon">+</span>
            </summary>
            <div class="dropdown-content">
                <div class="project-description">My personal configuration for the Reaper DAW, including themes, scripts, and settings.</div>
            </div>
        </details>
    `;
}



function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.dropdown-project');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            projectCards.forEach(card => {
                card.style.display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
            });
        });
    });
}

});

// ===== NAVIGATION FUNCTIONS =====
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            const targetPage = document.getElementById(targetId);
            
            console.log('Navigation clicked:', targetId);

            if (targetPage) {
                // Update active link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');

                // Update active page
                pages.forEach(page => {
                    page.classList.toggle('active', page.id === targetId);
                });

                // Scroll to the section
                setTimeout(() => {
                    targetPage.scrollIntoView({ behavior: 'smooth' });
                }, 50);
            }
        });
    });
}

function initHotlinks() {
    const hotlinkAudio = document.getElementById('hotlink-audio');
    const hotlinkCode = document.getElementById('hotlink-code');
    const hotlinkNotes = document.getElementById('hotlink-notes');

    hotlinkAudio.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('nav a[data-target="projects"]').click();
        setTimeout(() => {
            document.querySelector('.filter-btn[data-filter="audio"]').click();
        }, 100);
    });

    hotlinkCode.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('nav a[data-target="projects"]').click();
        setTimeout(() => {
            document.querySelector('.filter-btn[data-filter="code"]').click();
        }, 100);
    });

    hotlinkNotes.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('nav a[data-target="notes"]').click();
    });
}

function initDropdowns() {
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        details.addEventListener('toggle', () => {
            const icon = details.querySelector('.dropdown-icon');
            if (icon) {
                icon.textContent = details.open ? '-' : '+';
            }
        });
    });
}