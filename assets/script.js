'use strict';
const navLinks=document.querySelectorAll('nav a, .site-title');
const filterButtons=document.querySelectorAll('.filter-btn');
const projectCards=document.querySelectorAll('.project-card');

function showPage(id,link){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  navLinks.forEach(a=>a.classList.remove('active'));
  const page=document.getElementById(id);
  if(page) page.classList.add('active');
  if(link && link.tagName==='A' && link.dataset.target){ link.classList.add('active'); }
  history.replaceState(null,'','#'+id);
}

function filterProjects(category){
  projectCards.forEach(card=>{
    if(category==='all' || card.dataset.category===category){
      card.style.display='block';
    }else{
      card.style.display='none';
    }
  });
  filterButtons.forEach(btn=>{
    btn.classList.toggle('active',btn.dataset.filter===category);
  });
}

navLinks.forEach(a=>{
  a.addEventListener('click',e=>{
    e.preventDefault();
    showPage(a.dataset.target||'home',a);
  });
});

filterButtons.forEach(btn=>{
  btn.addEventListener('click',()=>{filterProjects(btn.dataset.filter);});
});

// Initialize with all projects visible
filterProjects('all');

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("slide");
  if (slides.length === 0) return;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}
