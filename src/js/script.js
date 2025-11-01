// MAIN INITIALIZATION
document.addEventListener('DOMContentLoaded', function() {
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
    Promise.all([
        loadContent('project', 'project-container'),
        loadContent('note', 'notes-container')
    ]).then(() => {
        initTimelineSlideshows();
        initFullscreenButtons();
    }).catch(console.error);
});

// NAVIGATION
function initNavigation() {
    const nav = document.querySelector('.main-nav');
    const pages = document.querySelectorAll('.page');
    const pageCache = new Set();

    function activatePage(targetId) {
        pages.forEach(page => page.classList.toggle('active', page.id === targetId));
        nav.querySelectorAll('.nav-btn').forEach(btn => {
            const isActive = btn.dataset.target === targetId;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-pressed', isActive);
        });
    }

    nav.addEventListener('click', async (e) => {
        const btn = e.target.closest('.nav-btn');
        if (!btn?.dataset.target) return;

        const targetId = btn.dataset.target;
        activatePage(targetId);

        if ((targetId === 'project' || targetId === 'note') && !pageCache.has(targetId)) {
            await loadContent(targetId, `${targetId}-container`);
            pageCache.add(targetId);
        }
    });
}

// CONTENT LOADING
async function loadContent(label, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/repos/p0kks/p0kks.me/issues?labels=${label}&state=open`);
        if (!response.ok) throw new Error('Failed to fetch');
        
        const issues = await response.json();
        
        if (issues.length === 0) {
            showFallback(container, label);
        } else {
            container.innerHTML = '<div class="card-grid"></div>';
            const cardGrid = container.querySelector('.card-grid');
            issues.forEach(issue => cardGrid.appendChild(createCard(issue, label)));
        }
    } catch (error) {
        console.error('Error loading content:', error);
        showFallback(container, label);
    }

    initFilterButtons(label);
}

function createCard(issue, label) {
    const card = document.createElement('details');
    card.className = 'unified-markdown';

    if (label === 'project') {
        const category = issue.labels?.find(l => ['code', 'audio', 'other'].includes(l.name?.toLowerCase()))?.name || 'other';
        card.dataset.category = category;
    } else if (label === 'note') {
        card.dataset.month = new Date(issue.created_at || Date.now()).getMonth();
    }

    const summary = document.createElement('summary');
    summary.className = 'unified-markdown-summary';
    summary.innerHTML = `
        <div class="dropdown-header-content">
            <span class="dropdown-title">${issue.title}</span>
        </div>
        <div class="dropdown-tags"></div>
        <span class="dropdown-icon"></span>
    `;

    const dropdownTagsContainer = summary.querySelector('.dropdown-tags');
    (issue.labels || []).forEach(l => {
        if (l.name !== label) {
            const tagLabel = createTagLabel(l.name);
            tagLabel.classList.add('dropdown-tag-label');
            dropdownTagsContainer.appendChild(tagLabel);
        }
    });

    const content = document.createElement('div');
    content.className = 'unified-markdown-content';
    
    const bodyDiv = document.createElement('div');
    if (typeof marked !== 'undefined' && issue.body) {
        const raw = marked.parse(issue.body);
        bodyDiv.innerHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(raw) : raw;
    } else {
        bodyDiv.textContent = issue.body || '';
    }
    content.appendChild(bodyDiv);

    const footer = createCardFooter(issue, label);
    content.appendChild(footer);

    card.appendChild(summary);
    card.appendChild(content);

    return card;
}

function createCardFooter(issue, label) {
    const footer = document.createElement('div');
    footer.className = 'card-footer';

    const date = new Date(issue.created_at);
    const formatted = `${String(date.getDate()).padStart(2, '0')} ${date.toLocaleString('en-us', { month: 'short' })}, ${date.getFullYear()}`;
    
    footer.innerHTML = `<span class="card-date" style="margin-left: auto;">${formatted}</span>`;
    return footer;
}

function createTagLabel(name) {
    const tag = document.createElement('span');
    tag.className = 'tag-label';

    const lname = name.toLowerCase();

    if (['audio', 'cover', 'original'].includes(lname)) tag.classList.add('tag-label-audio');
    else if (['code', 'web'].includes(lname)) tag.classList.add('tag-label-code');
    else if (['note', 'insights', 'poetry', 'thoughts'].includes(lname)) tag.classList.add('tag-label-note');
    else if (['code', 'web'].includes(lname)) tag.classList.add('tag-label-code');
    else if (['note', 'thoughts', 'insights', 'poetry'].includes(lname)) tag.classList.add('tag-label-note');

    tag.appendChild(document.createTextNode(name));
    return tag;
}

function showFallback(container, label) {
    const examples = label === 'project' ? [
        { title: 'p0kks.me', body: 'This portfolio website. Built with plain HTML, CSS and JavaScript.', labels: [{name: 'project'}, {name: 'code'}], created_at: new Date().toISOString() },
        { title: 'Discord Bot', body: 'A custom Discord bot for a community server, built with Node.js.', labels: [{name: 'project'}, {name: 'code'}], created_at: new Date().toISOString() },
        { title: 'Cover Song', body: 'Peder Elias - Cover Song.', labels: [{name: 'project'}, {name: 'audio'}, {name: 'cover'}], created_at: new Date().toISOString() }
    ] : [
        { title: 'My first note', body: 'This is my first note.', created_at: new Date().toISOString(), labels: [{name: 'note'}, {name: 'thoughts'}] },
        { title: 'Another note', body: 'This is another note.', created_at: new Date().toISOString(), labels: [{name: 'note'}, {name: 'insights'}] }
    ];

    container.innerHTML = `
        <p class="status-message">
            No GitHub ${label}s found. <br>
            <small>Create issues with the "${label}" label in the <a href="https://github.com/p0kks/p0kks.me" target="_blank">p0kks.me repository</a>.</small>
        </p>
        <div style="margin-top: 2rem;"><p style="text-align: center; opacity: 0.7; margin-bottom: 1rem;">Example ${label}s:</p><div class="card-grid"></div></div>
    `;

    const cardGrid = container.querySelector('.card-grid');
    examples.forEach(item => cardGrid.appendChild(createCard(item, label)));
}

function initFilterButtons(section) {
    const buttons = document.querySelectorAll(`.filter-buttons button[data-section="${section}"]`);
    const containerId = section === 'project' ? 'project-container' : 'notes-container';
    const cards = document.querySelectorAll(`#${containerId} .unified-markdown`);

    const applyFilter = (filter) => {
        cards.forEach(card => {
            const show = section === 'project' 
                ? (filter === 'all' || card.dataset.category === filter)
                : (filter === 'note' || card.dataset.month == filter);
            card.style.display = show ? 'block' : 'none';
        });
    };

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-pressed', 'false');
            });
            button.classList.add('active');
            button.setAttribute('aria-pressed', 'true');
            applyFilter(button.dataset.filter);
        });
    });

    const active = document.querySelector(`.filter-buttons button[data-section="${section}"].active`);
    if (active) applyFilter(active.dataset.filter);
}

// GALLERY
const galleryImages = [
    { src: 'assets/images/gallery/01.JPG', alt: 'Scenic View', description: 'A beautiful landscape capturing nature\'s essence.', subtitle: 'Nature\'s Beauty' },
    { src: 'assets/images/gallery/02.JPG', alt: 'Urban Life', description: 'City lights and modern architecture blend together.', subtitle: 'City Perspectives' },
    { src: 'assets/images/gallery/03.JPG', alt: 'Abstract Patterns', description: 'Geometric shapes create an interesting composition.', subtitle: 'Pattern Study' },
    { src: 'assets/images/gallery/04.JPG', alt: 'Natural Details', description: 'Close-up view revealing intricate details.', subtitle: 'Macro World' },
    { src: 'assets/images/gallery/05.JPG', alt: 'Minimalist Space', description: 'Clean lines and simple forms create harmony.', subtitle: 'Less is More' }
];

function initTimelineSlideshows() {
    const gallery = document.querySelector('.timeline-gallery');
    if (!gallery) return;

    const slideshow = gallery.querySelector('.slideshow');
    let slideIndex = 0;
    let touchStartX = 0;

    slideshow.innerHTML = galleryImages.map((img, i) => 
        `<div class="slide" data-index="${i}"><img src="${img.src}" alt="${img.alt}" loading="lazy"></div>`
    ).join('');

    const navDots = document.createElement('div');
    navDots.className = 'nav-dots';
    galleryImages.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'nav-dot';
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
        dot.addEventListener('click', () => showSlide(i));
        navDots.appendChild(dot);
    });
    gallery.appendChild(navDots);

    const currentInfo = document.createElement('div');
    currentInfo.className = 'current-slide-info';
    gallery.appendChild(currentInfo);

    const slides = gallery.querySelectorAll('.slide');
    
    const showSlide = (n) => {
        slideIndex = (n + slides.length) % slides.length;
        slideshow.style.transform = `translateX(${slideIndex * -100}%)`;
        
        const info = galleryImages[slideIndex];
        currentInfo.innerHTML = `<h3 class="slide-subtitle">${info.subtitle}</h3><p class="slide-description">${info.description}</p>`;

        gallery.querySelectorAll('.nav-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === slideIndex);
            dot.setAttribute('aria-current', i === slideIndex ? 'true' : 'false');
        });
    };

    slideshow.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].screenX, { passive: true });
    slideshow.addEventListener('touchend', e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) showSlide(slideIndex + (diff > 0 ? 1 : -1));
    }, { passive: true });

    gallery.addEventListener('keydown', e => {
        if (e.key === 'ArrowLeft') showSlide(slideIndex - 1);
        if (e.key === 'ArrowRight') showSlide(slideIndex + 1);
    });

    showSlide(0);
}

function initFullscreenButtons() {
    const btn = document.querySelector('.fullscreen-btn');
    const container = document.querySelector('.slideshow-container');
    if (!btn || !container) return;

    const toggle = async () => {
        try {
            const details = container.closest('details');
            if (details && !details.open) details.open = true;

            if (!document.fullscreenElement) {
                await container.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Fullscreen error:', err);
        }
    };

    const updateIcon = () => {
        btn.querySelector('i').className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
    };

    btn.addEventListener('click', e => { e.stopPropagation(); toggle(); });
    document.addEventListener('fullscreenchange', updateIcon);
    updateIcon();
}