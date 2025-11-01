// ===== MAIN INITIALIZATION =====
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

    const init = async () => {
        initNavigation();

        // Load content for home page initially
        await Promise.all([
            loadContent('project', 'project-container'),
            loadContent('note', 'notes-container')
        ]);
        initTimelineSlideshows();
        initFullscreenButtons();
    };

    init().catch(console.error);
});

// ===== NAVIGATION FUNCTIONS =====
function initNavigation() {
    const nav = document.querySelector('.main-nav');
    const pages = document.querySelectorAll('.page');
    const pageCache = new Map();

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
        if (!btn) return;

        const targetId = btn.dataset.target;
        if (!targetId) return;

        activatePage(targetId);

        // Load content if needed and not cached
        if ((targetId === 'project' || targetId === 'note') && !pageCache.has(targetId)) {
            const containerId = `${targetId}-container`;
            await loadContent(targetId, containerId);
            pageCache.set(targetId, true);
        }
    });
}






// ===== DYNAMIC CONTENT LOADING =====
async function loadContent(label, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/repos/p0kks/p0kks.me/issues?labels=${label}&state=open`);
        if (!response.ok) throw new Error('Failed to fetch GitHub issues');
        
        const issues = await response.json();
        
        if (issues.length === 0) {
            if (label === 'project') {
                showFallbackProjects(container);
            } else {
                showFallbackNotes(container);
            }
        } else {
            container.innerHTML = '<div class="card-grid"></div>';
            const cardGrid = container.querySelector('.card-grid');
            issues.forEach(issue => {
                const card = createCard(issue, label);
                cardGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading content:', error);
        if (label === 'project') {
            showFallbackProjects(container);
        } else {
            showFallbackNotes(container);
        }
    }

    // initFilterButtons expects the section name used in data-section ("project" or "note")
    initFilterButtons(label);
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
    } else if (['poetry'].includes(lname)) {
        tagLabel.classList.add('tag-label-poetry');
        iconClass = 'fas fa-feather-alt';
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
    card.className = 'unified-markdown';

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
    summary.className = 'unified-markdown-summary';

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
    contentWrapper.className = 'unified-markdown-content';

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
    cardTagsAndLinks.style.flexWrap = 'wrap';

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

function showFallbackContent(container, label, fallbackItems, message) {
    container.innerHTML = `
        <p class="status-message">
            ${message} <br>
            <small>
                Create issues with the "${label}" label in the
                <a href="https://github.com/p0kks/p0kks.me" target="_blank">p0kks.me repository</a>.
                ${label === 'project' ? '<br>Use labels: "code", "audio", "other" for categories, "live" for live projects.' : ''}
            </small>
        </p>
        <div style="margin-top: 2rem;">
            <p style="text-align: center; opacity: 0.7; margin-bottom: 1rem;">Example ${label}s:</p>
            <div class="card-grid">
            </div>
        </div>
    `;

    const cardGrid = container.querySelector('.card-grid');
    fallbackItems.forEach(item => {
        const card = createCard(item, label);
        cardGrid.appendChild(card);
    });
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
    showFallbackContent(container, 'note', fallbackNotes, 'No GitHub notes found.');
    initFilterButtons('note');
}

function initFullscreenButtons() {
    const fullscreenBtn = document.querySelector('.fullscreen-btn');
    const slideshowContainer = document.querySelector('.slideshow-container');

    if (!fullscreenBtn || !slideshowContainer) return;

    const toggleFullscreen = async () => {
        try {
            // If the gallery is inside a <details> that is closed, open it first so
            // the element can be fullscreened reliably across browsers.
            const parentDetails = slideshowContainer.closest('details');
            if (parentDetails && !parentDetails.open) parentDetails.open = true;

            if (!document.fullscreenElement) {
                await slideshowContainer.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }
        } catch (err) {
            console.error('Error attempting to toggle fullscreen:', err);
        }
    };

    const updateFullscreenIcon = () => {
        const icon = fullscreenBtn.querySelector('i');
        icon.className = document.fullscreenElement ? 'fas fa-compress' : 'fas fa-expand';
    };

    fullscreenBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleFullscreen(); });
    document.addEventListener('fullscreenchange', updateFullscreenIcon);
    // ensure icon matches initial state
    updateFullscreenIcon();
    // nothing else to initialize here; thumbnails and slide info are handled by the slideshow setup
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
    showFallbackContent(container, 'project', fallbackProjects, 'No GitHub projects found.');
    initFilterButtons('project');
}


function initFilterButtons(section) {
    const filterButtons = document.querySelectorAll(`.filter-buttons button[data-section="${section}"]`);
    // Map logical section name to actual container id in the DOM
    const containerId = section === 'project' ? 'project-container' : (section === 'note' ? 'notes-container' : `${section}-container`);
    const cards = document.querySelectorAll(`#${containerId} .unified-markdown`);

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

    // Immediately apply the active filter on initialization
    const activeFilterButton = document.querySelector(`.filter-buttons button[data-section="${section}"].active`);
    if (activeFilterButton) {
        const filter = activeFilterButton.dataset.filter;
        cards.forEach(card => {
            let display = 'none';
            if (section === 'project') {
                display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
            } else if (section === 'note') {
                display = (filter === 'note' || card.dataset.month == filter) ? 'block' : 'none';
            }
            card.style.display = display;
        });
    }
}

const galleryImages = [
    { 
        src: 'assets/images/gallery/01.JPG', 
        alt: 'Scenic View', 
        description: 'A beautiful landscape capturing nature\'s essence.',
        subtitle: 'Nature\'s Beauty'
    },
    { 
        src: 'assets/images/gallery/02.JPG', 
        alt: 'Urban Life', 
        description: 'City lights and modern architecture blend together.',
        subtitle: 'City Perspectives'
    },
    { 
        src: 'assets/images/gallery/03.JPG', 
        alt: 'Abstract Patterns', 
        description: 'Geometric shapes create an interesting composition.',
        subtitle: 'Pattern Study'
    },
    { 
        src: 'assets/images/gallery/04.JPG', 
        alt: 'Natural Details', 
        description: 'Close-up view revealing intricate details.',
        subtitle: 'Macro World'
    },
    { 
        src: 'assets/images/gallery/05.JPG', 
        alt: 'Minimalist Space', 
        description: 'Clean lines and simple forms create harmony.',
        subtitle: 'Less is More'
    }
].map((img) => ({
    ...img,
    thumbnail: img.src.replace('.JPG', '-thumb.JPG')
}));

function initTimelineSlideshows() {
    const slideshows = document.querySelectorAll('.timeline-gallery');
    
    const createSlide = ({ src, alt, description }, index) => {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="slide" data-index="${index}">
                <img src="${src}" 
                     alt="${alt}" 
                     loading="lazy">
            </div>
        `;
        return template.content.firstElementChild;
    };

    const setupSlideshow = (gallery) => {
        const slideshow = gallery.querySelector('.slideshow');
        const [prevButton, nextButton] = ['.prev', '.next'].map(sel => gallery.querySelector(sel));
        let slideIndex = 0;
        let slides;
        let touchStartX = 0;
        let touchEndX = 0;

        if (gallery.closest('#gallery-dropdown')) {
            slideshow.innerHTML = '';
            const fragment = document.createDocumentFragment();
            galleryImages.forEach(imageData => fragment.appendChild(createSlide(imageData)));
            slideshow.appendChild(fragment);

            // Create navigation dots container
            let navDots = gallery.querySelector('.nav-dots');
            if (!navDots) {
                navDots = document.createElement('div');
                navDots.className = 'nav-dots';
                galleryImages.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'nav-dot';
                    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                    dot.addEventListener('click', () => showSlide(index));
                    navDots.appendChild(dot);
                });
                gallery.appendChild(navDots);
            }

            // Create current slide info container below the slideshow
            let currentInfo = gallery.querySelector('.current-slide-info');
            if (!currentInfo) {
                currentInfo = document.createElement('div');
                currentInfo.className = 'current-slide-info';
                gallery.appendChild(currentInfo);
            }
        }
        slides = gallery.querySelectorAll('.slide');
    const thumbs = [];
    const currentInfoEl = gallery.querySelector('.current-slide-info');
        if (!slides.length) return;

        const showSlide = (n) => {
            slideIndex = (n + slides.length) % slides.length;
            slideshow.style.transform = `translateX(-${slideIndex * 100}%)`;
            
            // Update current info (subtitle + description) from galleryImages data
            const info = galleryImages[slideIndex] || {};
            if (currentInfoEl) {
                currentInfoEl.innerHTML = `<h3 class="slide-subtitle">${info.subtitle || info.alt || ''}</h3><p class="slide-description">${info.description || ''}</p>`;
            }

            // Update navigation dots
            const dots = gallery.querySelectorAll('.nav-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === slideIndex);
                dot.setAttribute('aria-current', index === slideIndex ? 'true' : 'false');
            });
        };

        // Touch navigation for touch devices
        slideshow.addEventListener('touchstart', e => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        slideshow.addEventListener('touchend', e => {
            touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) {
                showSlide(slideIndex + 1);
            } else if (touchEndX - touchStartX > 50) {
                showSlide(slideIndex - 1);
            }
        }, { passive: true });

        // Keyboard navigation
        gallery.addEventListener('keydown', e => {
            if (e.key === 'ArrowLeft') showSlide(slideIndex - 1);
            if (e.key === 'ArrowRight') showSlide(slideIndex + 1);
        });

        showSlide(0);
    };

    slideshows.forEach(setupSlideshow);
}