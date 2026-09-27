// Website Made by Bence (All rights reserved © 2025 Bence Barens)

const detail_view = document.querySelector('#detail-view');
const grid_view = document.querySelector('#grid-view');
const gallery = document.querySelector('.gallery');

detail_view.addEventListener('click', ()=> {
    detail_view.classList.add("active");
    grid_view.classList.remove("active");
    gallery.classList.remove("gallery-condensed");
});

grid_view.addEventListener('click', ()=> {
    detail_view.classList.remove("active");
    grid_view.classList.add("active");
    gallery.classList.add("gallery-condensed");
});