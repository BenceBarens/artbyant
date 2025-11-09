const markers = document.querySelectorAll('.marker');
const globe = document.querySelector('.globe');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');

let currentIndex = 0;

function rotateToMarker(index) {
  const marker = markers[index];
  const lat = parseFloat(marker.style.getPropertyValue('--lat'));
  const lon = parseFloat(marker.style.getPropertyValue('--lon'));
  globe.style.transform = `rotateX(${-lat}deg) rotateY(${-lon}deg)`;
}

nextBtn.addEventListener('click', () => {
  currentIndex = (currentIndex + 1) % markers.length;
  rotateToMarker(currentIndex);
});

prevBtn.addEventListener('click', () => {
  currentIndex = (currentIndex - 1 + markers.length) % markers.length;
  rotateToMarker(currentIndex);
});

// startpositie
rotateToMarker(0);