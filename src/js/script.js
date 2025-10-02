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
        console.log('Target page found:', targetPage);

        if (targetPage) {
            // Smooth scroll to the section
            targetPage.scrollIntoView({ behavior: 'smooth' });

            // Update active link
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            link.classList.add('active');

            // Update active page
            pages.forEach(page => {
                if (page.id === targetId) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
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
showSlides(slideIndex);

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

// Toggle all dropdowns
const toggleAllBtn = document.getElementById('toggle-all');
if (toggleAllBtn) {
    const allDropdowns = document.querySelectorAll('details[class^="dropdown-"]');
    let allOpen = false;

    toggleAllBtn.addEventListener('click', () => {
        allOpen = !allOpen;
        
        allDropdowns.forEach(dropdown => {
            dropdown.open = allOpen;
        });
        
        toggleAllBtn.textContent = allOpen ? 'close all' : 'toggle all';
    });
}

// Notes system using GitHub Issues
const notesContainer = document.getElementById('notes-content');
if (notesContainer) {
    loadNotes();
}

async function loadNotes() {
    try {
        notesContainer.innerHTML = '<p class="loading-notes">Loading notes...</p>';
        
        const response = await fetch('https://api.github.com/repos/p0kks/notes/issues?labels=note&state=open&sort=created&direction=desc');
        
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
                    <h3>${new Date(note.created_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    })} - ${escapeHtml(note.title)}</h3>
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
                <small>Make sure the <a href="https://github.com/p0kks/notes" target="_blank">notes repository</a> exists.</small>
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

}); // End of DOMContentLoaded