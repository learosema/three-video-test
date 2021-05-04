import * as THREE from 'https://cdn.skypack.dev/three';
import Stats from 'https://cdn.skypack.dev/stats.js';

var stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

const dpr = () => Math.min(window.devicePixelRatio, 2);
let frame = -1;
let videoInterval = -1;
let currentDpr = 1;

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
  let idx = 0;
  for (const mesh of scene.children) {
    const video = mesh.material.map.image;
    const videoAspect = video.videoWidth / video.videoHeight;

    const width = innerWidth / 2;
    const height = width / videoAspect;
    mesh.scale.set(width, height, 1);
    mesh.position.set(
      -window.innerWidth / 2 + width / 2 + (idx % 2) * (innerWidth - width),
      window.innerHeight / 2 - Math.floor(idx / 2) * height - height / 2,
      0
    );
    idx++;
  }
}

function videoUpdate() {
  for (const video of videos) {
    video.needsUpdate = true;
  }
}

function renderLoop() {
  stats.begin();
  renderer.render(scene, camera);
  if (currentDpr !== dpr()) {
    currentDpr = dpr();
    renderer.setPixelRatio(currentDpr);
  }
  stats.end();
  frame = requestAnimationFrame(renderLoop);
}

async function initScene() {
  let idx = 0;
  const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

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
      const videoAspect = video.image.videoWidth / video.image.videoHeight;
      const width = innerWidth / 2;
      const height = width / videoAspect;
      const material = new THREE.MeshBasicMaterial({ map: video });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(width, height, 1);
      scene.add(mesh);
      onResize();
    };
    idx++;
  }

  window.addEventListener('resize', onResize, false);
  videoInterval = window.setInterval(videoUpdate, 100);
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
