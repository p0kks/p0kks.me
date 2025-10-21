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
            page.classList.toggle('active', page.id === targetId);
        });

        navButtons.forEach(btn => {
            const isActive = btn.dataset.target === targetId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    navButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            // Use the button element as the source (handles clicks on child elements)
            const btn = e.currentTarget;
            const targetId = btn.dataset.target;
            if (targetId) activatePage(targetId);
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

    if (container.innerHTML === '') {
        container.innerHTML = `<p class="status-message">Loading ${label}s...</p>`;
    }

    try {
        // Browsers block setting a custom User-Agent header, so omit it here.
        const response = await fetch(`https://api.github.com/repos/p0kks/p0kks.me/issues?labels=${label}&state=open&sort=created&direction=desc`);

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

        // initFilterButtons expects the section name used in data-section ("project" or "note")
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
    const card = document.createElement('details');
    card.className = 'home-dropdown';

    if (label === 'project') {
        const labels = Array.isArray(issue.labels) ? issue.labels : [];
        const category = labels.find(l => {
            const name = (l && l.name) ? l.name.toLowerCase() : '';
            return ['code', 'audio', 'other'].includes(name);
        })?.name || 'other';
        card.dataset.category = category;
    } else if (label === 'note') {
        const issueDate = new Date(issue.created_at || Date.now());
        card.dataset.month = issueDate.getMonth();
    }

    const summary = document.createElement('summary');
    summary.className = 'home-dropdown-summary';

    const dropdownHeaderContent = document.createElement('div');
    dropdownHeaderContent.className = 'dropdown-header-content';

    const subtitleSpan = document.createElement('span');
    subtitleSpan.className = 'dropdown-subtitle';

    if (label === 'project') {
        const firstLine = issue.body ? issue.body.split('\n')[0] : '';
        subtitleSpan.textContent = firstLine;
    } else if (label === 'note') {
        const issueDate = new Date(issue.created_at);
        subtitleSpan.textContent = issueDate.toLocaleString('en-us', { month: 'long' }).toLowerCase();
    }
    dropdownHeaderContent.appendChild(subtitleSpan);

    const titleSpan = document.createElement('span');
    titleSpan.className = 'dropdown-title';
    titleSpan.textContent = issue.title;
    dropdownHeaderContent.appendChild(titleSpan);

    summary.appendChild(dropdownHeaderContent);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'home-dropdown-content';

    const cardContent = document.createElement('div');
    const bodyText = issue.body || '';
    // Use marked only if available and bodyText is non-empty. Sanitize the HTML with DOMPurify.
    if (typeof marked !== 'undefined' && bodyText) {
        const raw = marked.parse(bodyText);
        cardContent.innerHTML = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(raw) : raw;
    } else {
        cardContent.textContent = bodyText || '';
    }

    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';

    const cardTags = document.createElement('div');
    cardTags.className = 'card-tags';
    const labelsForTags = Array.isArray(issue.labels) ? issue.labels : [];
    labelsForTags.forEach(l => {
        const name = (l && l.name) ? l.name : '';
        const tagLabel = document.createElement('span');
        tagLabel.className = 'tag-label';
        tagLabel.textContent = name;
        // Add specific classes based on label name
        const lname = name.toLowerCase();
        if (lname === 'note' || lname === 'insights' || lname === 'thoughts') {
            tagLabel.classList.add('tag-label-yellow');
        } else if (lname === 'project') {
            tagLabel.classList.add('tag-label-blue');
        } else if (lname === 'code') {
            tagLabel.classList.add('tag-label-green');
        } else if (lname === 'audio') {
            tagLabel.classList.add('tag-label-red');
        }
        cardTags.appendChild(tagLabel);
    });
    cardFooter.appendChild(cardTags);

    if (label === 'project') {
        const cardLinks = document.createElement('div');
        cardLinks.className = 'card-links';


        if (issue.homepage) {
            const liveLink = document.createElement('a');
            liveLink.href = issue.homepage;
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
        cardDate.textContent = issueDate.toLocaleDateString();
        cardFooter.appendChild(cardDate);
    }

    contentWrapper.appendChild(cardContent);
    contentWrapper.appendChild(cardFooter);

    card.appendChild(summary);
    card.appendChild(contentWrapper);

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
                    const card = document.createElement('details');
                    card.className = 'home-dropdown';
                    card.dataset.category = project.category;

                    const summary = document.createElement('summary');
                    summary.className = 'home-dropdown-summary';

                    const dropdownHeaderContent = document.createElement('div');
                    dropdownHeaderContent.className = 'dropdown-header-content';

                    const subtitleSpan = document.createElement('span');
                    subtitleSpan.className = 'dropdown-subtitle';
                    subtitleSpan.textContent = project.content.split('\n')[0];
                    dropdownHeaderContent.appendChild(subtitleSpan);

                    const titleSpan = document.createElement('span');
                    titleSpan.className = 'dropdown-title';
                    titleSpan.textContent = project.title;
                    dropdownHeaderContent.appendChild(titleSpan);

                    summary.appendChild(dropdownHeaderContent);

                    const contentWrapper = document.createElement('div');
                    contentWrapper.className = 'home-dropdown-content';

                    const cardContent = document.createElement('div');
                    const raw = (typeof marked !== 'undefined') ? marked.parse(project.content) : project.content;
                    cardContent.innerHTML = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(raw) : raw;

                    const cardFooter = document.createElement('div');
                    cardFooter.className = 'card-footer';
                    const cardTags = document.createElement('div');
                    cardTags.className = 'card-tags';
                    const tagLabel = document.createElement('span');
                    tagLabel.className = 'tag-label';
                    tagLabel.textContent = project.category;
                    // Add specific classes based on category name
                    if (project.category.toLowerCase() === 'code') {
                        tagLabel.classList.add('tag-label-green');
                    } else if (project.category.toLowerCase() === 'audio') {
                        tagLabel.classList.add('tag-label-red');
                    } else if (project.category.toLowerCase() === 'project') {
                        tagLabel.classList.add('tag-label-blue');
                    }
                    cardTags.appendChild(tagLabel);
                    cardFooter.appendChild(cardTags);
                    contentWrapper.appendChild(cardContent);
                    contentWrapper.appendChild(cardFooter);

                    card.appendChild(summary);
                    card.appendChild(contentWrapper);

                    return card.outerHTML;
                }).join('')}
            </div>
        </div>
    `;
    initFilterButtons('project');
}


function initFilterButtons(section) {
    const filterButtons = document.querySelectorAll(`.filter-buttons button[data-section="${section}"]`);
    // Map logical section name to actual container id in the DOM
    const containerId = section === 'project' ? 'project-container' : (section === 'note' ? 'notes-container' : `${section}-container`);
    const cards = document.querySelectorAll(`#${containerId} .home-dropdown`);

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            // update aria-pressed state for accessibility
            filterButtons.forEach(btn => btn.setAttribute('aria-pressed', 'false'));
            button.setAttribute('aria-pressed', 'true');

            const filter = button.dataset.filter;
            cards.forEach(card => {
                let display = 'none';
                if (section === 'project') {
                    display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
                } else if (section === 'note') {
                    display = (filter === 'all' || card.dataset.month == filter) ? 'block' : 'none';
                }
                card.style.display = display;
            });
        });
    });
}