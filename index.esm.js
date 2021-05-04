import * as THREE from 'https://cdn.skypack.dev/three';
const dpr = () => Math.min(window.devicePixelRatio, 2);
let frame = -1;
let videoInterval = -1;
let currentDpr = 1;
const videoUrls = [
  'Burning-Charcoal-Fire.mp4',
  'Pexels-1181911.mp4',
  'Pexels-2638063.mp4',
  'Pexels-2832316.mp4',
  'Pexels-3436.mp4',
  'pexels-anete-lusina-6353224.mp4',
];
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
const scene = new THREE.Scene();
const Z = 50;
const fieldOfView = 2 * Math.atan(window.innerHeight / 2 / Z) * (180 / Math.PI);
const aspectRatio = window.innerWidth / window.innerHeight;
const camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, 0.01, 100);
camera.position.z = Z;

const videos = [...document.querySelectorAll('video')].map(
  (video) => new THREE.Texture(video)
);

function onResize() {
  camera.fieldOfView =
    2 * Math.atan(window.innerHeight / 2 / Z) * (180 / Math.PI);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  currentDpr = dpr();
  renderer.setPixelRatio(currentDpr);
  renderer.setSize(window.innerWidth, window.innerHeight);
  for (const mesh of scene.children) {
    mesh.position.set(
      Math.floor(-innerWidth / 2 + Math.random() * innerWidth),
      -innerHeight / 2 + Math.floor(Math.random() * innerHeight),
      0
    );
  }
}

function videoUpdate() {
  for (const video of videos) {
    video.needsUpdate = true;
  }
}

function renderLoop() {
  renderer.render(scene, camera);
  if (currentDpr !== dpr()) {
    currentDpr = dpr();
    renderer.setPixelRatio(currentDpr);
  }
  frame = requestAnimationFrame(renderLoop);
}

async function initScene() {
  console.log(videos);
  for (const video of videos) {
    video.image.src = video.image.getAttribute('data-src');
    video.image.onloadeddata = () => {
      console.log(
        'Loaded:',
        video.image.src,
        video.image.videoWidth,
        video.image.videoHeight
      );
      try {
        video.image.play();
      } catch (ex) {
        console.info(ex);
      }

      const width = (300 * video.image.videoWidth) / video.image.videoHeight;
      const height = 300;
      const geometry = new THREE.PlaneGeometry(width, height, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: video });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      mesh.position.set(
        Math.floor(-innerWidth / 2 + Math.random() * innerWidth),
        -innerHeight / 2 + Math.floor(Math.random() * innerHeight),
        0
      );
    };
  }
  onResize();
  window.addEventListener('resize', onResize, false);
  videoInterval = window.setInterval(videoUpdate, 50);
  frame = requestAnimationFrame(renderLoop);
}

function cleanup() {
  window.removeEventListener('resize', onResize, false);
  window.cancelInterval(videoInterval);
  window.cancelAnimationFrame(frame);
  for (const mesh of scene.children) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  for (const texture of videos) {
    texture.dispose();
  }
}

initScene();
