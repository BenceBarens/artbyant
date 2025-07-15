const tooltip = document.getElementById('tooltip');

document.querySelectorAll('.hover-target').forEach(el => {
  el.addEventListener('mousemove', e => {
    tooltip.textContent = el.dataset.tooltip;
    tooltip.style.top = `${e.pageY - 100}px`;
    tooltip.style.left = `${e.pageX - 750}px`;
    tooltip.style.opacity = 1;
  });

  el.addEventListener('mouseleave', () => {
    tooltip.style.opacity = 0;
  });
});