const tooltip = document.getElementById('tooltip');
const hoverTargets = document.querySelectorAll('.hover-target');
const popups = document.querySelectorAll('.popup');

const idMap = {
  map1: 'sytre',
  map2: 'united-republic-of-ember',
  map3: 'citle',
  map4: 'citle',
  map5: 'yabude',
  map6: "dragons-tail",
  map7: "dragons-tail",
  map8: "southern-jaw",
  map9: "barren-lands"
};

hoverTargets.forEach(el => {
  el.addEventListener('mousemove', e => {
    tooltip.textContent = el.dataset.tooltip;
    tooltip.style.top = `${e.pageY - 110}px`;
    tooltip.style.left = `${e.pageX - 770}px`;
    tooltip.style.transform = 'translate(10px, 10px)';
    tooltip.style.opacity = 1;
  });

  el.addEventListener('mouseenter', () => {
    popups.forEach(p => p.classList.add('hidden'));
    const targetPopupId = idMap[el.id];
    const popup = document.getElementById(targetPopupId);
    if (popup) popup.classList.remove('hidden');
  });

  el.addEventListener('mouseleave', () => {
    tooltip.style.opacity = 0;
    const targetPopupId = idMap[el.id];
    const popup = document.getElementById(targetPopupId);
    if (popup) popup.classList.add('hidden');
  });
});
