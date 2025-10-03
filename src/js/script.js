// Page navigation with smooth scrolling
document.addEventListener('DOMContentLoaded', function() {
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

// Project filtering
const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.dropdown-project');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Set active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;

        projectCards.forEach(card => {
            if (filter === 'all' || card.dataset.category === filter) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// Slideshow
let slideIndex = 1;
// Only initialize slideshow if slides exist
if (document.getElementsByClassName("slide").length > 0) {
    showSlides(slideIndex);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active-dot", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active-dot";
}

// Dropdown Bookmarks (Dynamic Content Loading Placeholder)
// If dynamic content loading is required, you would add JavaScript here.
// Example: Fetch data from an API and populate the .dropdown-content div.
// const dropdownBookmarks = document.querySelector('.dropdown-bookmarks');
// dropdownBookmarks.addEventListener('toggle', () => {
//   if (dropdownBookmarks.open) {
//     // Load content dynamically
//     console.log('Dropdown opened, load content!');
//   } else {
//     console.log('Dropdown closed');
//   }
// });

// Update current year in footer
const yearElement = document.getElementById('current-year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// Welcome text - no functionality

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
                    <div class="note-date">${new Date(note.created_at).toLocaleDateString('en-GB', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        year: 'numeric' 
                    })}</div>
                    ${escapeHtml(note.title)}
                </summary>
                <div class="dropdown-content">
                    <div class="note-content">${renderMarkdown(note.body)}</div>
                    <div class="note-footer">
                        <a href="${note.html_url}" target="_blank" rel="noopener noreferrer" class="note-link interactive-element">
                            View on GitHub
                        </a>
                    </div>
                </div>
            `;
            notesContainer.appendChild(noteEl);
        });
        
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

// Simple markdown renderer for GitHub-flavored markdown
function renderMarkdown(text) {
    if (!text) return '';
    
    // First handle GitHub callouts (special syntax)
    let processedText = text
        // GitHub callouts: > [!NOTE] with content on same or next line
        .replace(/^> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*(.*)$/gim, 
            '<div class="callout callout-$1"><strong>$1</strong> $2</div>')
        
        // Regular blockquotes (handle multi-line separately)
        .replace(/^> ([^\[!].*)$/gim, '<blockquote>$1</blockquote>');
    
    // Then process other markdown
    return processedText
        // Headers
        .replace(/^###### (.*$)/gim, '<h6>$1</h6>')
        .replace(/^##### (.*$)/gim, '<h5>$1</h5>')
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/_(.*?)_/gim, '<em>$1</em>')
        .replace(/__(.*?)__/gim, '<strong>$1</strong>')
        
        // Code blocks and inline code
        .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/gim, '<code>$1</code>')
        
        // Links
        .replace(/\[([^\[]+)\]\(([^\)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        
        // Images
        .replace(/!\[([^\[]+)\]\(([^\)]+)\)/gim, '<img src="$2" alt="$1" loading="lazy">')
        
        // Line breaks and paragraphs
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        
        // Lists
        .replace(/^\* (.*$)/gim, '<li>$1</li>')
        .replace(/<li>[\s\S]*?<\/li>/gim, matches => `<ul>${matches}</ul>`)
        
        // Wrap in paragraph if no other block elements
        .replace(/^(?!<[h|ul|ol|pre|blockquote|div])([\s\S]*?)$/gim, '<p>$1</p>');
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
                    <div class="project-subtitle">${new Date(project.created_at).getFullYear()}</div>
                    <span class="project-title">${escapeHtml(project.title)}</span>
                </summary>
                <div class="dropdown-content">
                    <div class="project-description">${renderMarkdown(project.body)}</div>
                    <div class="project-links">
                        <a href="${project.html_url}" class="interactive-element" target="_blank" rel="noopener">source</a>
                        ${project.labels.some(label => label.name === 'live') ? 
                            `<a href="${extractLiveUrl(project.body)}" class="interactive-element" target="_blank" rel="noopener">visit</a>` : ''}
                    </div>
                </div>
            `;
            projectsContainer.appendChild(projectEl);
        });
        
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
}

function getFallbackProjectsHTML() {
    return `
        <details class="dropdown-project" data-category="code">
            <summary class="interactive-element">
                <div class="project-subtitle">03/10/2025</div>
                p0kks.me
            </summary>
            <div class="dropdown-content">
                <div class="project-description">This portfolio website. Built with plain HTML, CSS and JavaScript.</div>
                <div class="note-footer">
                    <a href="https://github.com/p0kks/p0kks.github.io" target="_blank" rel="noopener noreferrer" class="note-link interactive-element">
                        View on GitHub
                    </a>
                </div>
            </div>
        </details>
        <details class="dropdown-project" data-category="code">
            <summary class="interactive-element">
                <div class="project-subtitle">03/10/2025</div>
                Discord Bot
            </summary>
            <div class="dropdown-content">
                <div class="project-description">A custom Discord bot for a community server, built with Node.js. It provides various utility commands, moderation tools, and fun features.</div>
                <div class="note-footer">
                    <a href="#" target="_blank" rel="noopener noreferrer" class="note-link interactive-element">
                        View on GitHub
                    </a>
                </div>
            </div>
        </details>
        <details class="dropdown-project" data-category="audio">
            <summary class="interactive-element">
                <div class="project-subtitle">03/10/2025</div>
                Ambient Music
            </summary>
            <div class="dropdown-content">
                <div class="project-description">A collection of short, experimental ambient tracks. Exploring textures and soundscapes.</div>
                <div class="note-footer">
                    <a href="#" target="_blank" rel="noopener noreferrer" class="note-link interactive-element">
                        View on GitHub
                    </a>
                </div>
            </div>
        </details>
        <details class="dropdown-project" data-category="other">
            <summary class="interactive-element">
                <div class="project-subtitle">03/10/2025</div>
                Reaper Configuration
            </summary>
            <div class="dropdown-content">
                <div class="project-description">My personal configuration for the Reaper DAW, including themes, scripts, and settings.</div>
                <div class="note-footer">
                    <a href="#" target="_blank" rel="noopener noreferrer" class="note-link interactive-element">
                        View on GitHub
                    </a>
                </div>
            </div>
        </details>
    `;
}

function extractLiveUrl(text) {
    const urlMatch = text.match(/https?:\/\/[^\s)]+/);
    return urlMatch ? urlMatch[0] : '#';
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

}); // End of DOMContentLoaded