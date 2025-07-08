const header = document.querySelector('header');

window.addEventListener('scroll', () => {
if (window.scrollY > 50) {
    header.classList.add('scrolled');
} else {
    header.classList.remove('scrolled');
}
});

let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
if (window.scrollY > lastScrollY) {
    header.classList.add('hide-header');
} else {
    header.classList.remove('hide-header');
}
lastScrollY = window.scrollY;
});

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

const menuButton = document.querySelector('#menu-toggle');

menuButton.addEventListener('click', ()=> {
    if (header.classList.contains('nav-expanded')){
        header.classList.remove('nav-expanded')
    } else{
        header.classList.add('nav-expanded')
    }
});