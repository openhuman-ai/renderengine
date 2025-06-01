import { PerspectiveCamera } from "../src/cameras/PerspectiveCamera"
import { DoubleSide } from "../src/constants"
import { Float32BufferAttribute, Uint16BufferAttribute } from "../src/core/BufferAttribute"
import { CylinderGeometry } from "../src/geometries/CylinderGeometry"
import GUI from "../src/gui/GUI"
import { DirectionalLight } from "../src/lights/DirectionalLight"
import { MeshPhongMaterial } from "../src/materials/MeshPhongMaterial"
import { Bone } from "../src/objects/Bone"
import { Skeleton } from "../src/objects/Skeleton"
import { SkinnedMesh } from "../src/objects/SkinnedMesh"
import { WebGLRenderer } from "../src/renderers/WebGLRenderer"
import { Scene } from "../src/scenes/Scene"
import { SkeletonHelper } from "../src/helpers/SkeletonHelper";


// Setup scene
const scene = new Scene();
const camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.set(0, 5, 20);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff);
document.body.appendChild(renderer.domElement);

// Add light
const light = new DirectionalLight(0xffffff, 10);
light.position.set(10, 10, 10);
scene.add(light);

// Create geometry
const geometry = new CylinderGeometry(1, 1, 10, 8, 10, true);
geometry.rotateX(Math.PI / 2);

// Create bones
const bone1 = new Bone();
bone1.name = 'Bone1';
bone1.position.y = 0;

const bone2 = new Bone();
bone2.name = 'Bone2';
bone2.position.y = 5;

bone1.add(bone2);
const skeleton = new Skeleton([bone1, bone2]);

// Skinning
const material = new MeshPhongMaterial({
  color: 0x44aa88,
  skinning: true,
  side: DoubleSide,
});

const mesh = new SkinnedMesh(geometry, material);
mesh.add(bone1);
mesh.bind(skeleton);

// Skin weights
const position = geometry.attributes.position;
const vertexCount = position.count;
const skinIndices = [];
const skinWeights = [];

for (let i = 0; i < vertexCount; i++) {
  const y = position.getY(i) + 5;
  const weight = y / 10;
  skinIndices.push(0, 1, 0, 0);
  skinWeights.push(1 - weight, weight, 0, 0);
}

geometry.setAttribute('skinIndex', new Uint16BufferAttribute(skinIndices, 4));
geometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4));

scene.add(mesh);

const helper = new SkeletonHelper(mesh);
scene.add(helper);


// GUI controls
const gui = new GUI();
const controls = {
  bone1: { x: 0, y: 0, z: 0 },
  bone2: { x: 0, y: 0, z: 0 },
};

const bone1Folder = gui.addFolder('Bone1 Rotation');
bone1Folder.add(controls.bone1, 'x', -Math.PI, Math.PI).name('Rotate X');
bone1Folder.add(controls.bone1, 'y', -Math.PI, Math.PI).name('Rotate Y');
bone1Folder.add(controls.bone1, 'z', -Math.PI, Math.PI).name('Rotate Z');

const bone2Folder = gui.addFolder('Bone2 Rotation');
bone2Folder.add(controls.bone2, 'x', -Math.PI, Math.PI).name('Rotate X');
bone2Folder.add(controls.bone2, 'y', -Math.PI, Math.PI).name('Rotate Y');
bone2Folder.add(controls.bone2, 'z', -Math.PI, Math.PI).name('Rotate Z');

bone1Folder.open();
bone2Folder.open();

// Animate
function animate() {
  requestAnimationFrame(animate);

  // GUI-based bone control
  bone1.rotation.set(controls.bone1.x, controls.bone1.y, controls.bone1.z);
  bone2.rotation.set(controls.bone2.x, controls.bone2.y, controls.bone2.z);

  // Sample animation (optional)
  const t = Date.now() * 0.002;
  bone2.rotation.z += Math.sin(t) * 0.002; // slight wave

  renderer.render(scene, camera);
}

animate();
