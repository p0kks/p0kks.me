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

async function loadContent(label, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
        const response = await fetch(`https://api.github.com/repos/p0kks/p0kks.me/issues?labels=${label}&state=open`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        if (!response.ok) {
            console.error('GitHub API Error:', await response.text());
            throw new Error('Failed to fetch GitHub issues');
        }
        
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
        src: 'assets/images/gallery/image-01.webp', 
        alt: 'Gallery Image 1', 
        description: 'First image in the gallery showcase.',
        subtitle: 'Image One'
    },
    { 
        src: 'assets/images/gallery/image-02.webp', 
        alt: 'Gallery Image 2', 
        description: 'Second image in the gallery showcase.',
        subtitle: 'Image Two'
    },
    { 
        src: 'assets/images/gallery/image-03.webp', 
        alt: 'Gallery Image 3', 
        description: 'Third image in the gallery showcase.',
        subtitle: 'Image Three'
    },
    { 
        src: 'assets/images/gallery/image-04.webp', 
        alt: 'Gallery Image 4', 
        description: 'Fourth image in the gallery showcase.',
        subtitle: 'Image Four'
    },
    { 
        src: 'assets/images/gallery/image-05.webp', 
        alt: 'Gallery Image 5', 
        description: 'Fifth image in the gallery showcase.',
        subtitle: 'Image Five'
    }
];

function initTimelineSlideshows() {
    const slideshows = document.querySelectorAll('.timeline-gallery');
    
    const preloadImage = (src) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    };

    const createSlide = ({ src, alt, description }, index) => {
        const template = document.createElement('template');
        template.innerHTML = `
            <div class="slide" data-index="${index}" role="tabpanel" aria-roledescription="slide">
                <img src="${src}" 
                     alt="${alt}"
                     loading="${index < 2 ? 'eager' : 'lazy'}"
                     decoding="async">
            </div>
        `;
        return template.content.firstElementChild;
    };

    const setupSlideshow = (gallery) => {
        if (!gallery) return;
        const slideshow = gallery.querySelector('.slideshow');
        if (!slideshow) {
            console.error('Slideshow element not found');
            return;
        }
        
        let slideIndex = 0;
        let touchStartX = 0;
        let touchEndX = 0;
        let isAnimating = false;

        if (gallery.closest('#gallery-dropdown')) {
            slideshow.innerHTML = '';
            const fragment = document.createDocumentFragment();
            galleryImages.forEach((imageData, index) => {
                fragment.appendChild(createSlide(imageData));
            });
            slideshow.appendChild(fragment);

            // Create navigation container
            let galleryNav = gallery.querySelector('.gallery-nav');
            if (!galleryNav) {
                galleryNav = document.createElement('div');
                galleryNav.className = 'gallery-nav';

                // Previous button
                const prevButton = document.createElement('button');
                prevButton.className = 'nav-button prev';
                prevButton.innerHTML = '&lt;';
                prevButton.setAttribute('aria-label', 'Previous slide');
                prevButton.addEventListener('click', () => showSlide(slideIndex - 1));

                // Navigation dots container
                const navDots = document.createElement('div');
                navDots.className = 'nav-dots';
                galleryImages.forEach((_, index) => {
                    const dot = document.createElement('button');
                    dot.className = 'nav-dot';
                    dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                    dot.addEventListener('click', () => showSlide(index));
                    navDots.appendChild(dot);
                });

                // Next button
                const nextButton = document.createElement('button');
                nextButton.className = 'nav-button next';
                nextButton.innerHTML = '&gt;';
                nextButton.setAttribute('aria-label', 'Next slide');
                nextButton.addEventListener('click', () => showSlide(slideIndex + 1));

                // Append all navigation elements
                galleryNav.appendChild(prevButton);
                galleryNav.appendChild(navDots);
                galleryNav.appendChild(nextButton);
                gallery.appendChild(galleryNav);
            }

            // Create current slide info container below the slideshow
            let currentInfo = gallery.querySelector('.current-slide-info');
            if (!currentInfo) {
                currentInfo = document.createElement('div');
                currentInfo.className = 'current-slide-info';
                gallery.appendChild(currentInfo);
            }
        }
                const slides = gallery.querySelectorAll('.slide');
        const currentInfoEl = gallery.querySelector('.current-slide-info');
        if (!slides.length) return;

        const showSlide = async (n, animate = true) => {
            if (isAnimating) return;
            isAnimating = true;

            const newIndex = (n + slides.length) % slides.length;
            if (animate) {
                slideshow.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            } else {
                slideshow.style.transition = 'none';
            }

            slideIndex = newIndex;
            slideshow.style.transform = `translateX(-${slideIndex * 100}%)`;
            
            // Preload next and previous images
            const nextIndex = (slideIndex + 1) % slides.length;
            const prevIndex = (slideIndex - 1 + slides.length) % slides.length;
            Promise.all([
                preloadImage(galleryImages[nextIndex].src),
                preloadImage(galleryImages[prevIndex].src)
            ]).catch(console.error);

            // Update current info with fade effect
            const info = galleryImages[slideIndex] || {};
            if (currentInfoEl) {
                currentInfoEl.style.opacity = '0';
                setTimeout(() => {
                    currentInfoEl.innerHTML = `
                        <h3 class="slide-subtitle">${info.subtitle || info.alt || ''}</h3>
                        <p class="slide-description">${info.description || ''}</p>
                    `;
                    currentInfoEl.style.opacity = '1';
                }, 150);
            }

            // Update navigation dots and aria labels
            const dots = gallery.querySelectorAll('.nav-dot');
            dots.forEach((dot, index) => {
                const isActive = index === slideIndex;
                dot.classList.toggle('active', isActive);
                dot.setAttribute('aria-current', isActive ? 'true' : 'false');
                dot.setAttribute('aria-label', `Go to slide ${index + 1}${isActive ? ' (current)' : ''}`);
            });

            // Reset animation lock after transition
            setTimeout(() => {
                isAnimating = false;
            }, 300);
        };

        // Enhanced touch navigation
        let touchStartY = 0;
        let touchMoveX = 0;
        let initialTransform = 0;

        const handleTouchStart = (e) => {
            if (isAnimating) return;
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            initialTransform = slideIndex * -100;
            slideshow.style.transition = 'none';
        };

        const handleTouchMove = (e) => {
            if (isAnimating) return;
            const touchCurrentX = e.touches[0].clientX;
            const touchCurrentY = e.touches[0].clientY;
            
            // Calculate delta movements
            const deltaX = touchCurrentX - touchStartX;
            const deltaY = touchCurrentY - touchStartY;
            
            // Check if scrolling is more horizontal than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                e.preventDefault();
                touchMoveX = deltaX;
                
                // Calculate percentage moved
                const percentMoved = (touchMoveX / slideshow.offsetWidth) * 100;
                slideshow.style.transform = `translateX(${initialTransform + percentMoved}%)`;
            }
        };

        const handleTouchEnd = (e) => {
            if (isAnimating) return;
            slideshow.style.transition = 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            const moveThreshold = slideshow.offsetWidth * 0.2; // 20% threshold
            if (Math.abs(touchMoveX) > moveThreshold) {
                if (touchMoveX > 0) {
                    showSlide(slideIndex - 1);
                } else {
                    showSlide(slideIndex + 1);
                }
            } else {
                // Snap back if threshold not met
                showSlide(slideIndex);
            }
            
            touchMoveX = 0;
        };

        slideshow.addEventListener('touchstart', handleTouchStart, { passive: true });
        slideshow.addEventListener('touchmove', handleTouchMove, { passive: false });
        slideshow.addEventListener('touchend', handleTouchEnd, { passive: true });

        // Enhanced keyboard navigation
        gallery.addEventListener('keydown', e => {
            if (isAnimating) return;
            
            switch (e.key) {
                case 'ArrowLeft':
                case 'h':
                    e.preventDefault();
                    showSlide(slideIndex - 1);
                    break;
                case 'ArrowRight':
                case 'l':
                    e.preventDefault();
                    showSlide(slideIndex + 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    showSlide(0);
                    break;
                case 'End':
                    e.preventDefault();
                    showSlide(slides.length - 1);
                    break;
            }
        });

        // Initial slide setup without animation
        showSlide(0, false);
        
        // Preload next slide
        if (galleryImages.length > 1) {
            preloadImage(galleryImages[1].src).catch(console.error);
        }
    };

    slideshows.forEach(setupSlideshow);
});