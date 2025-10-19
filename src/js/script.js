// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    loadContent('project', 'project-container');
    loadContent('note', 'notes-container');
});

// ===== NAVIGATION FUNCTIONS =====
function initNavigation() {
    const navButtons = document.querySelectorAll('.main-nav .nav-btn');
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

    let category = '';
    if (label === 'project') {
        category = issue.labels.find(l =>
            ['code', 'audio', 'other'].includes(l.name.toLowerCase())
        )?.name || 'other';
        card.dataset.category = category;
    } else if (label === 'note') {
        const issueDate = new Date(issue.created_at);
        card.dataset.month = issueDate.getMonth();
    }

    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';

    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title';
    cardTitle.textContent = issue.title;
    cardHeader.appendChild(cardTitle);

    const cardContent = document.createElement('div');
    cardContent.className = 'card-content hidden';
    cardContent.innerHTML = marked.parse(issue.body);

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const cardTags = document.createElement('div');
    cardTags.className = 'card-tags';
    issue.labels.forEach(l => {
        const tagLabel = document.createElement('span');
        tagLabel.className = 'tag-label';
        tagLabel.textContent = l.name;
        cardTags.appendChild(tagLabel);
    });
    cardFooter.appendChild(cardTags);

    if (label === 'project') {
        const cardLinks = document.createElement('div');
        cardLinks.className = 'card-links';

        if (issue.github) {
            const githubLink = document.createElement('a');
            githubLink.href = issue.github;
            githubLink.target = '_blank';
            githubLink.rel = 'noopener';
            githubLink.innerHTML = '<img src="assets/icons/github.png" alt="GitHub" class="card-icon">';
            cardLinks.appendChild(githubLink);
        }
        if (issue.live) {
            const liveLink = document.createElement('a');
            liveLink.href = issue.live;
            liveLink.target = '_blank';
            liveLink.rel = 'noopener';
            liveLink.innerHTML = '<img src="assets/icons/githubpages.png" alt="Live Demo" class="card-icon">';
            cardLinks.appendChild(liveLink);
        }
        if (cardLinks.children.length > 0) {
            cardFooter.appendChild(cardLinks);
        }
    } else if (label === 'note') {
        const cardDate = document.createElement('span');
        cardDate.className = 'card-date';
        const issueDate = new Date(issue.created_at);
        cardDate.textContent = issueDate.toLocaleDateString(); // Format date nicely
        cardFooter.appendChild(cardDate);
    }

    card.appendChild(cardHeader);
    card.appendChild(cardContent);
    card.appendChild(cardFooter);

    card.addEventListener('click', () => {
        card.classList.toggle('expanded');
        cardContent.classList.toggle('hidden');
    });

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

                    const cardHeader = document.createElement('div');
                    cardHeader.className = 'card-header';
                    const cardTitle = document.createElement('h3');
                    cardTitle.className = 'card-title';
                    cardTitle.textContent = project.title;
                    cardHeader.appendChild(cardTitle);

                    const cardContent = document.createElement('div');
                    cardContent.className = 'card-content hidden';
                    cardContent.innerHTML = marked.parse(project.content);

                    const cardFooter = document.createElement('div');
                    cardFooter.className = 'card-footer';
                    const cardTags = document.createElement('div');
                    cardTags.className = 'card-tags';
                    const tagLabel = document.createElement('span');
                    tagLabel.className = 'tag-label';
                    tagLabel.textContent = project.category;
                    cardTags.appendChild(tagLabel);
                    cardFooter.appendChild(cardTags);

                    card.appendChild(cardHeader);
                    card.appendChild(cardContent);
                    card.appendChild(cardFooter);

                    card.addEventListener('click', () => {
                        card.classList.toggle('expanded');
                        cardContent.classList.toggle('hidden');
                    });
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