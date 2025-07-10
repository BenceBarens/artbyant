const header = document.querySelector('header');

window.addEventListener('scroll', () => {
if (window.scrollY > 80) {
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

function switchLanguage(lang) {
  const path = window.location.pathname;
  const english = document.querySelector('#lang-en');
  const spanish = document.querySelector('#lang-es');

  if (lang === 'es') {
    if (!path.startsWith('/es/')) {
      const newPath = '/es' + path;
      window.location.pathname = newPath;
    }
  }

  if (lang === 'en') {
    if (path.startsWith('/es/')) {
      const newPath = path.replace('/es', '');
      window.location.pathname = newPath || '/';
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isSpanish = path.startsWith('/es/');

  document.getElementById('lang-en').classList.toggle('selected', !isSpanish);
  document.getElementById('lang-es').classList.toggle('selected', isSpanish);
});