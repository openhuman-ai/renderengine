import { PerspectiveCamera } from "@/cameras/PerspectiveCamera"
import { BoxGeometry } from "@/geometries/BoxGeometry"
import { MeshPhongMaterial } from "@/materials/MeshPhongMaterial"
import { Mesh } from "@/objects/Mesh"
import { WebGLRenderer } from "@/renderers/WebGLRenderer"
import { Scene } from "@/scenes/Scene"
import { Clock } from "@/core/Clock"
import { AmbientLight } from "@/lights/AmbientLight"
import { DirectionalLight } from "@/lights/DirectionalLight"
import { Color } from "@/math/Color"

class App {
	canvas
	renderer
	camera
	scene
	model
	clock

	constructor() {
		this.canvas = document.querySelector("#scene")
		if (!this.canvas) {
			console.error("Canvas element #scene not found.")
			return
		}

		this.scene = new Scene()
		this.scene.background = new Color("#fff")
		this.clock = new Clock()

		this.initCamera()
		this.initRenderer()
		this.initLights()
		this.initCube()

		window.addEventListener("resize", this.onResize.bind(this))
		this.renderer.setAnimationLoop(this.render.bind(this))
	}

	initCamera() {
		this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.camera.position.set(0, 0, 5)
	}

	initRenderer() {
		this.renderer = new WebGLRenderer({ antialias: true })
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(window.devicePixelRatio)
		this.canvas.appendChild(this.renderer.domElement)
	}

	initLights() {
		const ambient = new AmbientLight(0xffffff, 0.5)
		const directional = new DirectionalLight(0xffffff, 1)
		directional.position.set(5, 5, 5)

		this.scene.add(ambient, directional)
	}

	initCube() {
		const geometry = new BoxGeometry(1, 1, 1)
		const material = new MeshPhongMaterial({ color: 0xdddddd, shininess: 30 })
		this.model = new Mesh(geometry, material)
		this.scene.add(this.model)
	}

	onResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	render() {
		const delta = this.clock.getDelta()
		if (this.model) {
			this.model.rotation.x += delta * 0.5
			this.model.rotation.y += delta * 0.5
		}
		this.renderer.render(this.scene, this.camera)
	}
}

new App()
