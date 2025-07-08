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
const menu = document.querySelector('#main-menu');
const menuLinks = menu.querySelectorAll('a');

function isMobile() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function setTabbing(enabled) {
  menuLinks.forEach(link => {
    if (enabled) {
      link.removeAttribute('tabindex');
    } else {
      link.setAttribute('tabindex', '-1');
    }
  });
}

function openMenu() {
  header.classList.add('nav-expanded');
  menu.setAttribute('aria-hidden', 'false');
  setTabbing(true);
}

function closeMenu() {
  header.classList.remove('nav-expanded');
  menu.setAttribute('aria-hidden', 'true');
  setTabbing(false);
}

menuButton.addEventListener('click', () => {
  const isOpen = header.classList.contains('nav-expanded');
  if (isOpen) {
    closeMenu();
  } else {
    openMenu();
  }
});

function applyInitialAccessibilityState() {
  if (isMobile()) {
    menu.setAttribute('aria-hidden', 'true');
    setTabbing(false);
  } else {
    menu.setAttribute('aria-hidden', 'false');
    setTabbing(true);
  }
}

window.addEventListener('resize', applyInitialAccessibilityState);
window.addEventListener('load', applyInitialAccessibilityState);
