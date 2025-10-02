// Page navigation with smooth scrolling
const navLinks = document.querySelectorAll('nav a');
const pages = document.querySelectorAll('.page');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.dataset.target;
        const targetPage = document.getElementById(targetId);

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
                card.style.display = 'block';
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