// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    // Initialize dropdowns
    initDropdowns();

    // Notes and Projects system using GitHub Issues
    loadIssues('note', 'notes-content', 'collapsible-item', 'notes');
    loadIssues('project', 'project-container', 'collapsible-item', 'projects');

});

async function loadIssues(label, containerId, itemClass, pageId) {
    const container = document.getElementById(containerId) || document.querySelector(`.${containerId}`);
    if (!container) {
        console.error(`Container with ID or class "${containerId}" not found.`);
        return;
    }

    container.innerHTML = `<p class="status-message">Loading ${label}s...</p>`;
    
    try {
        const response = await fetch(`https://api.github.com/repos/p0kks/p0kks.me/issues?labels=${label}&state=open&sort=created&direction=desc`, {
            headers: {
                'User-Agent': 'p0kks.me-portfolio'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to fetch ${label}s`);
        }
        
        const issues = await response.json();
        
        if (issues.length === 0) {
            if (label === 'project') {
                showFallbackProjects(container); // Use fallback for projects if no issues
            } else {
                container.innerHTML = `<p class="status-message">No ${label}s yet. Check back soon!</p>`;
            }
            return;
        }
        
        container.innerHTML = '';
        
        issues.forEach(issue => {
            const issueDate = new Date(issue.created_at);
            const issueEl = document.createElement('details');
            issueEl.className = itemClass;
            
            if (label === 'note') {
                issueEl.dataset.month = issueDate.getMonth();
            } else if (label === 'project') {
                const category = issue.labels.find(l => 
                    ['code', 'audio', 'other'].includes(l.name.toLowerCase())
                )?.name || 'other';
                issueEl.dataset.category = category;
            }

            let itemSubtitle = '';
            if (label === 'project') {
                const firstLine = issue.body.split('\n')[0];
                itemSubtitle = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');
            } else {
                itemSubtitle = issueDate.toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric'
                });
            }

            let summaryContent = '';
            const labelsHtml = issue.labels.map(l => `<span class="tag-label" data-label="${l.name.toLowerCase()}">${l.name}</span>`).join('');
            summaryContent = `
                <summary class="interactive-element">
                    <div class="summary-content-wrapper">
                        <div class="item-details">
                            <div class="item-subtitle">${itemSubtitle}</div>
                            <span class="item-title">${escapeHtml(issue.title)}</span>
                        </div>
                        <div class="item-labels-summary">
                            ${labelsHtml}
                        </div>
                    </div>
                    <span class="dropdown-icon">+</span>
                </summary>
                <div class="dropdown-content">
                    <div class="item-content">${marked.parse(issue.body)}</div>
                </div>
            `;
            issueEl.innerHTML = summaryContent;
            container.appendChild(issueEl);
        });

        initDropdowns();
        if (pageId === 'notes' || pageId === 'projects') {
            initIssueFilter(pageId, itemClass);
        }
        
    } catch (error) {
        console.error(`Error loading ${label}s:`, error);
        container.innerHTML = `
            <p class="status-message">
                Unable to load ${label}s. <br>
                <small>Make sure the <a href="https://github.com/p0kks/p0kks.me" target="_blank">p0kks.me repository</a> exists.</small>
            </p>
        `;
    }
}

function showFallbackProjects(container) {
    container.innerHTML = `
        <p class="status-message">
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
    
    initIssueFilter('projects', 'collapsible-item');
    initDropdowns();
}

function getFallbackProjectsHTML() {
    const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    const fallbackProjects = [
        {
            category: 'code',
            title: 'p0kks.me',
            content: 'This portfolio website. Built with plain HTML, CSS and JavaScript.'
        },
        {
            category: 'code',
            title: 'Discord Bot',
            content: 'A custom Discord bot for a community server, built with Node.js. It provides various utility commands, moderation tools, and fun features.'
        },
        {
            category: 'audio',
            title: 'Cover Song',
            content: 'Peder Elias - Cover Song. A cover song project.'
        },
        {
            category: 'audio',
            title: 'Ambient Music',
            content: 'A collection of short, experimental ambient tracks. Exploring textures and soundscapes.'
        },
        {
            category: 'other',
            title: 'Reaper Configuration',
            content: 'My personal configuration for the Reaper DAW, including themes, scripts, and settings.'
        }
    ];

    let projectsHtml = '';
    fallbackProjects.forEach(project => {
        const firstLine = project.content.split('\n')[0];
        const itemSubtitle = firstLine.substring(0, 50) + (firstLine.length > 50 ? '...' : '');

        projectsHtml += `
            <details class="collapsible-item" data-category="${project.category}">
                <summary class="interactive-element">
                    <div class="summary-content-wrapper">
                        <div class="item-details">
                            <div class="item-subtitle">${itemSubtitle}</div>
                            <span class="item-title">${project.title}</span>
                        </div>
                        <div class="item-labels-summary">
                            <span class="tag-label" data-label="${project.category}">${project.category}</span>
                        </div>
                    </div>
                    <span class="dropdown-icon">+</span>
                </summary>
                <div class="dropdown-content">
                    <div class="item-content">${project.content}</div>
                </div>
            </details>
        `;
    });

    return projectsHtml;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initIssueFilter(pageId, itemClass) {
    const filterButtons = document.querySelectorAll(`#${pageId} .filter-btn`);
    const issueCards = document.querySelectorAll(`#${pageId} .${itemClass}`);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            issueCards.forEach(card => {
                let display = 'none';
                if (pageId === 'notes') {
                    display = filter === 'all' || card.dataset.month == filter ? '' : 'none';
                } else if (pageId === 'projects') {
                    display = filter === 'all' || card.dataset.category === filter ? '' : 'none';
                }
                card.style.display = display;
            });
        });
    });
}

// ===== NAVIGATION FUNCTIONS =====
function initNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.dataset.target;
            const targetPage = document.getElementById(targetId);

            if (targetPage) {
                // Update active link
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                link.classList.add('active');

                // Update active page
                pages.forEach(page => {
                    page.classList.toggle('active', page.id === targetId);
                });

                // Scroll to the section
                targetPage.scrollIntoView({ behavior: 'smooth' });
            }
        });
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