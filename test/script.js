// Scene, camera en renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Helperfunctie graden → radialen
function degToRad(deg) { return deg * Math.PI / 180; }

// Maak een canvas texture met meerdere stickers op sferische coördinaten
function createCombinedTexture(files, positions, scale = 1) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Achtergrondkleur instellen
    ctx.fillStyle = '#020914ff'; // kies hier je gewenste kleur
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    const promises = files.map(file => new Promise(resolve => {
        const img = new Image();
        img.src = file;
        img.onload = () => resolve(img);
    }));

    return Promise.all(promises).then(images => {
        images.forEach((img, i) => {
            const pos = positions[i] || { x: 512, y: 512 }; // default midden
            const w = img.width / scale;
            const h = img.height / scale;
            ctx.drawImage(img, pos.x - w/2, pos.y - h/2, w, h);
        });
        return new THREE.CanvasTexture(canvas);
    });
}

// Hier stel je de handmatige posities in op de 1024x1024 canvas
const positions = [
    { x: 512, y: 128 },  // sticker 1 boven
    { x: 768, y: 256 },  // sticker 2 rechtsboven
    { x: 256, y: 256 },  // sticker 3 linksboven
    { x: 512, y: 512 },  // sticker 4 midden
    { x: 768, y: 768 },  // sticker 5 rechtsonder
    { x: 256, y: 768 },  // sticker 6 linksonder
    { x: 512, y: 896 }   // sticker 7 onder
];

// Combineer de stickers in één texture
createCombinedTexture(['1.png','2.png','3.png','4.png','5.png','6.png','7.png'], positions, 1.2)
    .then(texture => {
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true});
        const globe = new THREE.Mesh(geometry, material);
        scene.add(globe);

        // Camera positie
        camera.position.z = 15;

        // Drag variabelen
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        renderer.domElement.addEventListener('mousedown', e => {
            isDragging = true;
            previousMousePosition = { x:e.clientX, y:e.clientY };
        });

        renderer.domElement.addEventListener('mouseup', () => { isDragging = false; });

        renderer.domElement.addEventListener('mousemove', e => {
            if(!isDragging) return;
            const deltaMove = { x:e.clientX - previousMousePosition.x, y:e.clientY - previousMousePosition.y };
            globe.rotation.y += deltaMove.x * 0.005;
            globe.rotation.x += deltaMove.y * 0.005;
            previousMousePosition = { x:e.clientX, y:e.clientY };
        });

        // Window resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth/window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Render loop
        function animate() {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        }
        animate();
    });
