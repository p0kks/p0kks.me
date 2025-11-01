// ===== MAIN INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    // Configure DOMPurify to open links in new tabs
    if (typeof DOMPurify !== 'undefined') {
        DOMPurify.setConfig({ ADD_ATTR: ['target', 'rel'] });
        DOMPurify.addHook('afterSanitizeAttributes', function (node) {
            if ('href' in node && node.tagName === 'A') {
                node.setAttribute('target', '_blank');
                node.setAttribute('rel', 'noopener');
            }
        });
    }

    initNavigation();
    initHomeFilterButtons();
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

function initHomeFilterButtons() {
    const button = document.querySelector('#home .filter-buttons .filter-btn');
    if (!button) return;

    // Change label
    button.textContent = 'open/close all';

    button.addEventListener('click', () => {
        const dropdowns = document.querySelectorAll('#home .home-dropdown');
        const anyClosed = Array.from(dropdowns).some(d => !d.open);
        dropdowns.forEach(d => d.open = anyClosed);
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
            } else if (label === 'note') {
                showFallbackNotes(container);
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

function createTagLabel(name) {
    const tagLabel = document.createElement('span');
    tagLabel.className = 'tag-label';

    const icon = document.createElement('i');
    const lname = name.toLowerCase();
    let iconClass = '';

    if (['audio'].includes(lname)) {
        tagLabel.classList.add('tag-label-audio');
        iconClass = 'fas fa-volume-up';
    } else if (['code'].includes(lname)) {
        tagLabel.classList.add('tag-label-code');
        iconClass = 'fas fa-code';
    } else if (['web'].includes(lname)) {
        tagLabel.classList.add('tag-label-web');
        iconClass = 'fas fa-globe';
    } else if (lname.includes('cover')) {
        tagLabel.classList.add('tag-label-cover');
        iconClass = 'fas fa-microphone-alt';
    } else if (lname.includes('original')) {
        tagLabel.classList.add('tag-label-original');
        iconClass = 'fas fa-star';
    } else if (['note'].includes(lname)) {
        tagLabel.classList.add('tag-label-note');
        iconClass = 'fas fa-file-alt';
    } else if (['thoughts'].includes(lname)) {
        tagLabel.classList.add('tag-label-thoughts');
        iconClass = 'fas fa-comment-alt';
    } else if (['insights'].includes(lname)) {
        tagLabel.classList.add('tag-label-insights');
        iconClass = 'fas fa-lightbulb';
    } else if (['project'].includes(lname)) {
        tagLabel.classList.add('tag-label-project');
        iconClass = 'fas fa-folder-open';
    }

    if (iconClass) {
        icon.className = iconClass;
        tagLabel.appendChild(icon);
    }

    const text = document.createTextNode(name);
    tagLabel.appendChild(text);

    return tagLabel;
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

    const titleSpan = document.createElement('span');
    titleSpan.className = 'dropdown-title';
    titleSpan.textContent = issue.title;
    dropdownHeaderContent.appendChild(titleSpan);

    summary.appendChild(dropdownHeaderContent);

    const dropdownRightContent = document.createElement('div');
    dropdownRightContent.className = 'dropdown-right-content';

    const subtitleSpan = document.createElement('span');
    subtitleSpan.className = 'dropdown-subtitle';

    subtitleSpan.innerHTML = ''; // Clear any existing content
    const labels = Array.isArray(issue.labels) ? issue.labels : [];
    labels.forEach(l => {
        const name = (l && l.name) ? l.name : '';
        if (name === label) return; // Skip the main label
        const tagLabel = createTagLabel(name);
        subtitleSpan.appendChild(tagLabel);
    });
    dropdownRightContent.appendChild(subtitleSpan);

    summary.appendChild(dropdownRightContent);

    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'home-dropdown-content';

    const cardContent = document.createElement('div');
    // Add markdown-body class conditionally
    if (label === 'project' || label === 'note') {
        cardContent.classList.add('markdown-body');
    }
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

    const issueDate = new Date(issue.created_at);
    const day = issueDate.getDate().toString().padStart(2, '0');
    const month = issueDate.toLocaleString('en-us', { month: 'short' });
    const year = issueDate.getFullYear();
    const formattedDate = `${day} ${month}, ${year}`;

    const cardDate = document.createElement('span');
    cardDate.className = 'card-date';
    cardDate.textContent = formattedDate;
    cardFooter.appendChild(cardDate);

    const cardTagsAndLinks = document.createElement('div');
    cardTagsAndLinks.style.display = 'flex';
    cardTagsAndLinks.style.gap = '15px';
    cardTagsAndLinks.style.alignItems = 'center';

    const cardTags = document.createElement('div');
    cardTags.className = 'card-tags';
    const labelsForTags = Array.isArray(issue.labels) ? issue.labels : [];
    labelsForTags.forEach(l => {
        const name = (l && l.name) ? l.name : '';
        const tagLabel = createTagLabel(name);
        cardTags.appendChild(tagLabel);
    });


    if (label === 'project') {
        const cardLinks = document.createElement('div');
        cardLinks.className = 'card-links';


        if (issue.homepage) {
            const liveLink = document.createElement('a');
            liveLink.href = issue.homepage;
            liveLink.target = '_blank';
            liveLink.rel = 'noopener';
            liveLink.innerHTML = '<i class="fas fa-external-link-alt"></i>';
            cardLinks.appendChild(liveLink);
        }
        if (cardLinks.children.length > 0) {
            cardTagsAndLinks.appendChild(cardLinks);
        }
    }
    
    cardFooter.appendChild(cardTagsAndLinks);

    contentWrapper.appendChild(cardContent);
    contentWrapper.appendChild(cardFooter);

    card.appendChild(summary);
    card.appendChild(contentWrapper);

    return card;
}

function showFallbackNotes(container) {
    const fallbackNotes = [
        {
            title: 'My first note',
            body: 'This is my first note. I can write anything here.',
            created_at: new Date().toISOString(),
            labels: [{name: 'note'}, {name: 'thoughts'}]
        },
        {
            title: 'Another note',
            body: 'This is another note. I can use markdown here.',
            created_at: new Date().toISOString(),
            labels: [{name: 'note'}, {name: 'insights'}]
        }
    ];

    container.innerHTML = `
        <p class="status-message">
            No GitHub notes found. <br>
            <small>
                Create issues with the "note" label in the
                <a href="https://github.com/p0kks/p0kks.me" target="_blank">p0kks.me repository</a>.
            </small>
        </p>
        <div style="margin-top: 2rem;">
            <p style="text-align: center; opacity: 0.7; margin-bottom: 1rem;">Example notes:</p>
            <div class="card-grid">
            </div>
        </div>
    `;

    const cardGrid = container.querySelector('.card-grid');
    fallbackNotes.forEach(note => {
        const card = createCard(note, 'note');
        cardGrid.appendChild(card);
    });

    initFilterButtons('note');
}

function showFallbackProjects(container) {
    const fallbackProjects = [
        {
            title: 'p0kks.me',
            body: 'This portfolio website. Built with plain HTML, CSS and JavaScript.',
            labels: [{name: 'project'}, {name: 'code'}],
            created_at: new Date().toISOString(),
        },
        {
            title: 'Discord Bot',
            body: 'A custom Discord bot for a community server, built with Node.js. It provides various utility commands, moderation tools, and fun features.',
            labels: [{name: 'project'}, {name: 'code'}],
            created_at: new Date().toISOString(),
        },
        {
            title: 'Cover Song',
            body: 'Peder Elias - Cover Song. A cover song project.',
            labels: [{name: 'project'}, {name: 'audio'}, {name: 'cover'}],
            created_at: new Date().toISOString(),
        },
        {
            title: 'Ambient Music',
            body: 'A collection of short, experimental ambient tracks. Exploring textures and soundscapes.',
            labels: [{name: 'project'}, {name: 'audio'}, {name: 'original'}],
            created_at: new Date().toISOString(),
        },
        {
            title: 'Reaper Configuration',
            body: 'My personal configuration for the Reaper DAW, including themes, scripts, and settings.',
            labels: [{name: 'project'}, {name: 'other'}],
            created_at: new Date().toISOString(),
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
            </div>
        </div>
    `;

    const cardGrid = container.querySelector('.card-grid');
    fallbackProjects.forEach(project => {
        const card = createCard(project, 'project');
        cardGrid.appendChild(card);
    });

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
                    display = (filter === 'note' || card.dataset.month == filter) ? 'block' : 'none';
                }
                card.style.display = display;
            });
        });
    });
}