import { PerspectiveCamera } from "./cameras/PerspectiveCamera"
import { BoxGeometry } from "./geometries/BoxGeometry"
import { AmbientLight } from "./lights/AmbientLight"
import { PointLight } from "./lights/PointLight"
import { MeshPhongMaterial } from "./materials/MeshPhongMaterial"
import { Mesh } from "./objects/Mesh"
import { WebGLRenderer } from "./renderers/WebGLRenderer"
import { Scene } from "./scenes/Scene"

// Create scene
const scene = new Scene()

// Create camera
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 5

// Create renderer
const canvas = document.querySelector("#scene")
if (!canvas) throw new Error("Canvas element not found")
const renderer = new WebGLRenderer({ canvas: canvas, antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Create a cube
const geometry = new BoxGeometry(1, 1, 1)
const material = new MeshPhongMaterial({ color: 0x00ff00 })
const cube = new Mesh(geometry, material)
scene.add(cube)

// Add lights
const ambientLight = new AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new PointLight(0xffffff, 1)
pointLight.position.set(5, 5, 5)
scene.add(pointLight)

// Handle window resize
window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()
	renderer.setSize(window.innerWidth, window.innerHeight)
})

// Animation loop
function animate() {
	requestAnimationFrame(animate)

	// Rotate the cube
	cube.rotation.x += 0.01
	cube.rotation.y += 0.01

	renderer.render(scene, camera)
}

animate()
