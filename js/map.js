const container = document.getElementById('globe-container');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

function degToRad(deg) { return deg * Math.PI / 180; }

function createCombinedTexture(files, positions, scales) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
        canvas.width/2, canvas.height/2, 0,
        canvas.width/2, canvas.height/2, canvas.width/2
    );
    gradient.addColorStop(0, '#0e141fff'); 
    gradient.addColorStop(1, '#010408');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const promises = files.map(file => new Promise(resolve => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
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
        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        return texture;
    });
}

const positions = [
    { x: 500, y: 40 },
    { x: 950, y: 500 },
    { x: 250, y: 550 },
    { x: 280, y: 680 },
    { x: 550, y: 350 },
    { x: 680, y: 600 },
    { x: 700, y: 900 }
];

const scales = [0.55, 0.25, 0.18, 0.18, 0.25, 0.2, 0.4];

createCombinedTexture(
    ['../img/map/1.webp','../img/map/2.webp','../img/map/3.webp','../img/map/4.webp','../img/map/5.webp','../img/map/6.webp','../img/map/7.webp'],
    positions,
    scales
).then(texture => {
    const geometry = new THREE.SphereGeometry(5, 64, 64);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    camera.position.z = 15;

    const textureWidth = 1024;
    const textureHeight = 1024;

    function rotationForSticker(pos) {
        const u = pos.x / textureWidth;
        const v = pos.y / textureHeight;
        const lambda = u * Math.PI * 2;
        const phi = v * Math.PI;
        const rotY = Math.PI / 2 - lambda;
        const rotX = Math.PI / 2 - phi;
        return { x: rotX, y: rotY };
    }

    const angles = positions.map(p => rotationForSticker(p));
    let currentIndex = 0;
    let target = { x: angles[0].x, y: angles[0].y };

    function normAngle(a) {
        a = ((a + Math.PI) % (Math.PI * 2) + (Math.PI * 2)) % (Math.PI * 2) - Math.PI;
        return a;
    }

    function lerpAngle(current, target, t) {
        const diff = normAngle(target - current);
        return current + diff * t;
    }

    function updateTargets(index) {
        target.x = angles[index].x;
        target.y = angles[index].y;
    }

    function smoothRotate() {
        const t = 0.12;
        globe.rotation.y = lerpAngle(globe.rotation.y, target.y, t);
        globe.rotation.x = lerpAngle(globe.rotation.x, target.x, t);
        requestAnimationFrame(smoothRotate);
        renderer.render(scene, camera);
    }
    smoothRotate();

    function showPopup(currentIndex){
        const items = document.querySelectorAll('.popup')
        items.forEach((el, i) => {
            const hidden = i !== currentIndex
            el.setAttribute('aria-hidden', hidden)
        })
    }

    function updateProgress() {
        const progress = document.getElementById('carouselProgress');
        progress.value = currentIndex + 1;
    }

    document.getElementById('next').addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % angles.length
        updateTargets(currentIndex)
        showPopup(currentIndex)
        updateProgress()
    })

    document.getElementById('prev').addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + angles.length) % angles.length
        updateTargets(currentIndex)
        showPopup(currentIndex)
        updateProgress()
    })

    function fitGlobeToCanvas() {
        const radius = 5;
        const fov = camera.fov * Math.PI / 180;
        const height = container.clientHeight;
        const dist = radius / Math.sin(fov / 2);
        camera.position.z = dist;
    }

    fitGlobeToCanvas();

    window.addEventListener('resize', () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        fitGlobeToCanvas();
    });

    showPopup(currentIndex);
    updateProgress();
});
