// Website Made by Bence (All rights reserved © 2018 Bence Barens)

const tooltip      = document.getElementById('tooltip');
const hoverTargets = document.querySelectorAll('.hover-target');
const popups       = document.querySelectorAll('.popup');
const container    = document.getElementById('universe');

const idMap = {
  map1: 'sytre',
  map2: 'united-republic-of-ember',
  map3: 'citle',
  map4: 'citle',
  map5: 'yabude',
  map6: 'dragons-tail',
  map7: 'dragons-tail',
  map8: 'southern-jaw',
  map9: 'barren-lands'
};

hoverTargets.forEach(el => {
  el.addEventListener('mousemove', e => {
    tooltip.textContent = el.dataset.tooltip;
    tooltip.style.opacity = '1';

    const rect    = container.getBoundingClientRect();
    const padding = 20;
    const tw      = tooltip.offsetWidth;
    const th      = tooltip.offsetHeight;

    let x = e.clientX - rect.left + padding;
    let y = e.clientY - rect.top  + padding;

    if (x + tw > rect.width)   x = rect.width  - tw - padding;
    if (y + th > rect.height)  y = rect.height - th - padding;

    tooltip.style.left = `${x}px`;
    tooltip.style.top  = `${y}px`;
  });

  el.addEventListener('mouseenter', () => {
    tooltip.style.opacity = '1';
    popups.forEach(p => p.classList.add('hidden'));
    const popup = document.getElementById(idMap[el.id]);
    if (popup) popup.classList.remove('hidden');
  });

  el.addEventListener('mouseleave', () => {
    tooltip.style.opacity = '0';
    const popup = document.getElementById(idMap[el.id]);
    if (popup) popup.classList.add('hidden');
  });

  el.addEventListener('focus', () => {
    tooltip.textContent = el.dataset.tooltip;
    tooltip.style.opacity = '1';
    popups.forEach(p => p.classList.add('hidden'));
    const popup = document.getElementById(idMap[el.id]);
    if (popup) popup.classList.remove('hidden');
  });
  el.addEventListener('blur', () => {
    tooltip.style.opacity = '0';
    const popup = document.getElementById(idMap[el.id]);
    if (popup) popup.classList.add('hidden');
  });
});
