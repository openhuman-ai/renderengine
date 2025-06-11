import { Scene } from "@/scenes/Scene"
import { PerspectiveCamera } from "@/cameras/PerspectiveCamera"
import { WebGLRenderer } from "@/renderers/WebGLRenderer"
import { DirectionalLight } from "@/lights/DirectionalLight"
import { SphereGeometry } from "@/geometries/SphereGeometry"
import { MeshStandardMaterial } from "@/materials/MeshStandardMaterial"
import { Mesh } from "@/objects/Mesh"
import { Bone } from "@/objects/Bone"
import { SkeletonHelper } from "@/helpers/SkeletonHelper"
import { MathUtils } from "@/math/MathUtils"
import { OrbitControls } from "@/jsm/controls/OrbitControls"
import { BoxGeometry } from "@/geometries/BoxGeometry"

export class EyeRig {
	canvas
	scene
	camera
	renderer
	mouseX
	mouseY

	cube

	rootBone
	leftEye
	rightEye

	controls
	helper

	isMouseDown = false
	lastX = 0
	lastY = 0
	sensitivity = 0.005

	constructor(canvas) {
		this.canvas = canvas
		this.scene = new Scene()

		this.camera = new PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.camera.position.z = 5

		this.renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true })
		this.renderer.setClearColor(0xcccccc)
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		this.mouseX = 0
		this.mouseY = 0

		this.initLights()
		this.initEyes()
		this.createCube()
		this.addListeners()
		// this.addControls()
		this.animate()
		this.addEvent()
	}

	initLights() {
		const light = new DirectionalLight(0xffffff, 1)
		light.position.set(0, 1, 2)
		this.scene.add(light)
	}

	createEye(positionX) {
		const material = new MeshStandardMaterial({ color: 0xffffff })
		// const material = new MeshStandardMaterial({ color: 0x00ff00 })
		const geometry = new SphereGeometry(0.2, 32, 32)
		console.log("geometry", geometry.attributes)
		const eyeMesh = new Mesh(geometry, material)

		const bone = new Bone()
		bone.position.set(positionX, 0, 0)
		bone.add(eyeMesh)

		return { bone, eyeMesh }
	}

	initEyes() {
		this.leftEye = this.createEye(-0.4)
		this.rightEye = this.createEye(0.4)

		this.rootBone = new Bone()
		this.rootBone.add(this.leftEye.bone)
		this.rootBone.add(this.rightEye.bone)

		this.helper = new SkeletonHelper(this.rootBone)
		this.scene.add(this.helper)
		this.scene.add(this.rootBone)
	}

	createCube() {
		const geometry = new BoxGeometry()
		// console.log("geometry", geometry.attributes)
		const material = new MeshStandardMaterial({ color: 0x00ff00 })
		this.cube = new Mesh(geometry, material)
		this.scene.add(this.cube)
		this.cube.position.set(0, -0.5, 0)
		this.cube.scale.set(0.5, 0.5, 0.5)
		this.cube.castShadow = true
		this.cube.receiveShadow = true
	}

	addListeners() {
		window.addEventListener("resize", () => this.onResize())
		document.addEventListener("mousemove", (event) => this.onMouseMove(event))
	}

	addControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
	}

	onResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	onMouseMove(event) {
		this.mouseX = (event.clientX / window.innerWidth) * 2 - 1
		this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1
	}

	addEvent() {
		// Event listeners
		window.addEventListener("mousedown", (e) => {
			this.isMouseDown = true
			this.lastX = e.clientX
			this.lastY = e.clientY

			console.log("this.lastX, this.lastY", this.lastX, this.lastY)
		})

		window.addEventListener("mouseup", () => {
			this.isMouseDown = false
		})

		window.addEventListener("mousemove", (e) => {
			console.log("mousemove")
			// if (!this.isMouseDown) return

			const dx = e.clientX - this.lastX
			const dy = e.clientY - this.lastY
			this.lastX = e.clientX
			this.lastY = e.clientY

			this.leftEye.bone.rotation._y += dx * this.sensitivity
			this.leftEye.bone.rotation._x += dy * this.sensitivity

			this.rightEye.bone.rotation._y += dx * this.sensitivity
			this.rightEye.bone.rotation._x += dy * this.sensitivity

			this.cube.rotation.y += dx * this.sensitivity
			this.cube.rotation.x += dy * this.sensitivity

			// dx * this.sensitivity
			// dy * this.sensitivity
		})
	}

	animate() {
		requestAnimationFrame(() => this.animate())

		// const maxRotation = 0.5
		// const rotX = MathUtils.clamp(this.mouseY, -maxRotation, maxRotation)
		// const rotY = MathUtils.clamp(this.mouseX, -maxRotation, maxRotation)

		// this.leftEye.bone.rotation.set(rotX, rotY, 0)
		// this.rightEye.bone.rotation.set(rotX, rotY, 0)

		this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
		this.leftEye.eyeMesh.rotation.y += 0.01;
		this.leftEye.eyeMesh.rotation.x += 0.01;

		this.rightEye.eyeMesh.rotation.y += 0.01;
		this.rightEye.eyeMesh.rotation.x += 0.01;


		// this.leftEye.bone.lookAt(this.camera.position)
		// this.rightEye.bone.lookAt(this.camera.position)

		this.renderer.render(this.scene, this.camera)
	}
}

const canvas = document.getElementById("webgl-canvas")
new EyeRig(canvas)
