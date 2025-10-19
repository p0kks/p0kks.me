// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // initTheme(); // Removed theme initialization
    initNavigation();
    // Load content for projects and notes, but only display when their section is active
    loadContent('project', 'project-container');
    loadContent('note', 'notes-container');
});

/* ===== THEME: light -> dark -> deep ===== */
// Removed theme functions: initTheme, nextTheme, applyTheme

// ===== NAVIGATION FUNCTIONS =====
function initNavigation() {
    const navButtons = document.querySelectorAll('.main-nav .nav-btn');
    // const homeNavCards = document.querySelectorAll('.home-nav-cards .nav-card'); // Removed
    const pages = document.querySelectorAll('.page');

    function activatePage(targetId) {
        pages.forEach(page => {
            page.classList.remove('active');
            if (page.id === targetId) {
                page.classList.add('active');
            }
        });

        navButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.target === targetId) {
                btn.classList.add('active');
            }
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const targetId = e.target.dataset.target;
            activatePage(targetId);
        });
    });

    // Removed event listeners for homeNavCards
    /*
    homeNavCards.forEach(card => {
        card.addEventListener('click', (e) => {
            const targetId = e.currentTarget.dataset.target; // Use currentTarget for delegated events
            activatePage(targetId);
        });
    });
    */
}


// ===== DYNAMIC CONTENT LOADING =====
async function loadContent(label, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with ID "${containerId}" not found.`);
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
                showFallbackProjects(container);
            } else {
                container.innerHTML = `<p class="status-message">No ${label}s yet. Check back soon!</p>`;
            }
            return;
        }

        container.innerHTML = '';
        issues.forEach(issue => {
            const card = createCard(issue, label);
            container.appendChild(card);
        });

        initFilterButtons(label);

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

function createCard(issue, label) {
    const card = document.createElement('div');
    card.className = 'card';

    const issueDate = new Date(issue.created_at);
    let subtitle = '';
    let category = '';

    if (label === 'project') {
        const firstLine = issue.body.split('\n')[0];
        subtitle = firstLine.substring(0, 100) + (firstLine.length > 100 ? '...' : '');
        category = issue.labels.find(l =>
            ['code', 'audio', 'other'].includes(l.name.toLowerCase())
        )?.name || 'other';
        card.dataset.category = category;
    } else if (label === 'note') {
        subtitle = issueDate.toLocaleDateString('en-GB', {
            month: 'long',
            year: 'numeric'
        });
        card.dataset.month = issueDate.getMonth();
    }

    const tagsHtml = issue.labels.map(l => `<span class="tag-label">${l.name}</span>`).join('');

    const fullContent = marked.parse(issue.body);
    const truncatedContent = fullContent.substring(0, 200) + (fullContent.length > 200 ? '...' : '');

    card.innerHTML = `
        <h3 class="card-title">${escapeHtml(issue.title)}</h3>
        <p class="card-subtitle">${subtitle}</p>
        <div class="card-content collapsed">${truncatedContent}</div>
        ${fullContent.length > 200 ? '<button class="read-more-btn">Read More</button>' : ''}
        <div class="card-tags">${tagsHtml}</div>
    `;

    const readMoreBtn = card.querySelector('.read-more-btn');
    if (readMoreBtn) {
        readMoreBtn.addEventListener('click', () => {
            const contentDiv = card.querySelector('.card-content');
            contentDiv.classList.toggle('collapsed');
            if (contentDiv.classList.contains('collapsed')) {
                contentDiv.innerHTML = truncatedContent;
                readMoreBtn.textContent = 'Read More';
            } else {
                contentDiv.innerHTML = fullContent;
                readMoreBtn.textContent = 'Show Less';
            }
        });
    }

    return card;
}

function showFallbackProjects(container) {
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
            <div class="card-grid">
                ${fallbackProjects.map(project => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    card.dataset.category = project.category;
                    card.innerHTML = `
                        <h3 class="card-title">${escapeHtml(project.title)}</h3>
                        <p class="card-subtitle">${project.content.split('\n')[0].substring(0, 100) + (project.content.split('\n')[0].length > 100 ? '...' : '' )}</p>
                        <div class="card-content">${marked.parse(project.content)}</div>
                        <div class="card-tags"><span class="tag-label">${project.category}</span></div>
                    `;
                    return card.outerHTML;
                }).join('')}
            </div>
        </div>
    `;
    initFilterButtons('project');
}


function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initFilterButtons(section) {
    const filterButtons = document.querySelectorAll(`.filter-buttons button[data-section="${section}"]`);
    const cards = document.querySelectorAll(`#${section}-container .card`);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filter = button.dataset.filter;
            cards.forEach(card => {
                let display = 'none';
                if (section === 'project') {
                    display = (filter === 'all' || card.dataset.category === filter) ? 'flex' : 'none';
                } else if (section === 'note') {
                    display = (filter === 'all' || card.dataset.month == filter) ? 'flex' : 'none';
                }
                card.style.display = display;
            });
        });
    });
}