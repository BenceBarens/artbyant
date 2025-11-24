const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function degToRad(deg) { return deg * Math.PI / 180; }

function createCombinedTexture(files, positions, scales) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#010408ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const promises = files.map(file => new Promise(resolve => {
        const img = new Image();
        img.src = file;
        img.onload = () => resolve(img);
    }));

    return Promise.all(promises).then(images => {
        images.forEach((img, i) => {
            const pos = positions[i] || { x: 512, y: 512 };
            const scale = scales[i] || 1;

            const w = img.width * scale;
            const h = img.height * scale;

            ctx.drawImage(img, pos.x - w/2, pos.y - h/2, w, h);
        });

        return new THREE.CanvasTexture(canvas);
    });
}

const positions = [
    { x: 500, y: 40 }, //1
    { x: 950, y: 500 }, //2
    { x: 256, y: 500 }, //3
    { x: 300, y: 650 }, //4
    { x: 600, y: 400 }, //5
    { x: 650, y: 650 }, //6
    { x: 700, y: 900 }  //7
];

const scales = [
    2.5,  //1
    1.0,  //2
    0.9,  //3
    0.8,  //4
    1.2,  //5
    1.0,  //6
    2.2   //7
];

createCombinedTexture(
    ['1.png','2.png','3.png','4.png','5.png','6.png','7.png'],
    positions,
    scales
).then(texture => {

    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    camera.position.z = 15;

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

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth/window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();
});
