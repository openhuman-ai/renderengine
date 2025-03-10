import { PerspectiveCamera } from "./cameras/PerspectiveCamera"
import { BoxGeometry } from "./geometries/BoxGeometry"
import { AmbientLight } from "./lights/AmbientLight"
import { PointLight } from "./lights/PointLight"
import { MeshPhongMaterial } from "./materials/MeshPhongMaterial"
import { Mesh } from "./objects/Mesh"
import { WebGLRenderer } from "./renderers/WebGLRenderer"
import { Scene } from "./scenes/Scene"
import { LoadingManager } from "./loaders/LoadingManager"
import PMREMGenerator from "./renderers/common/extras/PMREMGenerator"
import { RoomEnvironment } from "./jsm/environments/RoomEnvironment"
import { DirectionalLight } from "@/lights/DirectionalLight"

import { MeshoptDecoder } from "./jsm/libs/meshopt_decoder.module"
import { AnimationMixer } from "./animation/AnimationMixer"
import { ACESFilmicToneMapping } from "./constants"
import { Clock } from "./core/Clock"
import GUI from "./gui/GUI"
import { OrbitControls } from "./jsm/controls/OrbitControls"
import { KTX2Loader } from "./jsm/loaders/KTX2Loader.js"
import { DRACOLoader } from "./jsm/loaders/DRACOLoader"
import { GLTFLoader } from "./jsm/loaders/GLTFLoader"

const loadingManager = new LoadingManager()
loadingManager.onProgress = (url, loaded, total) => {
	console.log(`Loading file: ${url}.\nLoaded ${loaded} of ${total} files.`)
}

const MODEL_PATH = new URL("/facecap.glb", import.meta.url).href

class App {
	canvas
	renderer
	camera
	scene
	mixer
	controls
	clock
	material
	model
	composer
	effectFXAA
	meshWithMorphTargets
	morphTargetFolder
	gui
	helpers = {
		axes: null,
		box: null,
		mainLight: null,
		frontLight: null,
		backLight: null,
		point1: null,
		point2: null,
	}
	lights = {
		ambient: undefined,
		main: undefined,
		front: undefined,
		back: undefined,
		point1: undefined,
		point2: undefined,
	}

	mouseX = 0
	mouseY = 0
	targetX = 0
	targetY = 0
	windowHalfX = window.innerWidth / 2
	windowHalfY = window.innerHeight / 2

	constructor() {
		this.createRenderer()
		this.setupCamera()
		this.createClock()
		this.createControls()
		// this.setupCube()
		this.setupLights()
		this.loadModel()
		this.createGUI()

		this.setupEventListeners()

		this.renderer.setAnimationLoop(() => {
			this.render()
		})
	}

	createClock() {
		this.clock = new Clock()
	}

	setupCamera() {
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.camera.position.z = 5
		// this.camera.position.set(-1, 0.8, 5)
	}

	createRenderer() {
		const canvas = document.querySelector("#scene")
		if (!canvas) throw new Error("Canvas element not found")
		this.canvas = canvas

		this.scene = new Scene()

		this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderer.toneMapping = ACESFilmicToneMapping
		this.renderer.setClearColor(0xffffff, 1)

		const room = new RoomEnvironment()
		const pmremGenerator = new PMREMGenerator(this.renderer)
		// this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture
	}

	createControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enableDamping = true
		this.controls.minDistance = 2.5
		this.controls.maxDistance = 5
		this.controls.minAzimuthAngle = -Math.PI / 2
		this.controls.maxAzimuthAngle = Math.PI / 2
		this.controls.maxPolarAngle = Math.PI / 1.8
		this.controls.target.set(0, 0.15, -0.2)

		this.controls.enableDamping = true
		this.controls.dampingFactor = 0.05
		this.controls.screenSpacePanning = true
	}

	setupCube() {
		const geometry = new BoxGeometry(1, 1, 1)
		const material = new MeshPhongMaterial({ color: 0x00ff00 })
		this.cube = new Mesh(geometry, material)
		this.scene.add(this.cube)
	}

	setupLights() {
		// const ambientLight = new AmbientLight(0xffffff, 0.5)
		// this.scene.add(ambientLight)

		// const pointLight = new PointLight(0xffffff, 1)
		// pointLight.position.set(5, 5, 5)
		// this.scene.add(pointLight)
		this.lights.main = new DirectionalLight("white", 8)
		this.lights.main.position.set(10, 10, 10)
		this.scene.add(this.lights.main)

		this.lights.ambient = new AmbientLight("white", 2)
		this.scene.add(this.lights.ambient)
	}

	setupEventListeners() {
		window.addEventListener("resize", () => this.onWindowResize())
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}

	createGUI() {
		this.gui = new GUI()

		// Add helper visibility controls
		const helperFolder = this.gui.addFolder("Helpers")
		helperFolder.close() // Close by default
		helperFolder.add({ showAxes: true }, "showAxes").onChange((visible) => {
			if (this.helpers.axes) this.helpers.axes.visible = visible
		})
		helperFolder.add({ showBox: true }, "showBox").onChange((visible) => {
			if (this.helpers.box) this.helpers.box.visible = visible
		})
		helperFolder.add({ showLightHelpers: true }, "showLightHelpers").onChange((visible) => {
			if (this.helpers.mainLight) this.helpers.mainLight.visible = visible
			if (this.helpers.frontLight) this.helpers.frontLight.visible = visible
			if (this.helpers.backLight) this.helpers.backLight.visible = visible
			if (this.helpers.point1) this.helpers.point1.visible = visible
			if (this.helpers.point2) this.helpers.point2.visible = visible
		})

		// Ambient Light controls
		const ambientFolder = this.gui.addFolder("Ambient Light")
		ambientFolder.close() // Close by default
		ambientFolder.add(this.lights.ambient, "intensity", 0, 2).name("Intensity")
		ambientFolder.addColor(this.lights.ambient, "color").name("Color")

		// Main Light controls
		const mainFolder = this.gui.addFolder("Main Light")
		mainFolder.close() // Close by default
		mainFolder.add(this.lights.main, "intensity", 0, 2).name("Intensity")
		mainFolder.addColor(this.lights.main, "color").name("Color")
		mainFolder.add(this.lights.main.position, "x", -10, 10).name("Position X")
		mainFolder.add(this.lights.main.position, "y", -10, 10).name("Position Y")
		mainFolder.add(this.lights.main.position, "z", -10, 10).name("Position Z")

		// // Front Light controls
		// const frontFolder = this.gui.addFolder("Front Light")
		// frontFolder.close() // Close by default
		// frontFolder.add(this.lights.front, "intensity", 0, 2).name("Intensity")
		// frontFolder.addColor(this.lights.front, "color").name("Color")
		// frontFolder.add(this.lights.front.position, "x", -10, 10).name("Position X")
		// frontFolder.add(this.lights.front.position, "y", -10, 10).name("Position Y")
		// frontFolder.add(this.lights.front.position, "z", -10, 10).name("Position Z")

		// // Back Light controls
		// const backFolder = this.gui.addFolder("Back Light")
		// backFolder.close() // Close by default
		// backFolder.add(this.lights.back, "intensity", 0, 2).name("Intensity")
		// backFolder.addColor(this.lights.back, "color").name("Color")
		// backFolder.add(this.lights.back.position, "x", -10, 10).name("Position X")
		// backFolder.add(this.lights.back.position, "y", -10, 10).name("Position Y")
		// backFolder.add(this.lights.back.position, "z", -10, 10).name("Position Z")

		// // // Point Light 1 controls
		// // const point1Folder = this.gui.addFolder('Point Light 1')
		// // point1Folder.close() // Close by default
		// // point1Folder.add(this.lights.point1, 'intensity', 0, 2).name('Intensity')
		// // point1Folder.addColor(this.lights.point1, 'color').name('Color')
		// // point1Folder.add(this.lights.point1.position, 'x', -10, 10).name('Position X')
		// // point1Folder.add(this.lights.point1.position, 'y', -10, 10).name('Position Y')
		// // point1Folder.add(this.lights.point1.position, 'z', -10, 10).name('Position Z')
		// // point1Folder.add(this.lights.point1, 'distance', 0, 2000).name('Distance')

		// // // Point Light 2 controls
		// // const point2Folder = this.gui.addFolder('Point Light 2')
		// // point2Folder.close() // Close by default
		// // point2Folder.add(this.lights.point2, 'intensity', 0, 2).name('Intensity')
		// // point2Folder.addColor(this.lights.point2, 'color').name('Color')
		// // point2Folder.add(this.lights.point2.position, 'x', -10, 10).name('Position X')
		// // point2Folder.add(this.lights.point2.position, 'y', -10, 10).name('Position Y')
		// // point2Folder.add(this.lights.point2.position, 'z', -10, 10).name('Position Z')
		// // point2Folder.add(this.lights.point2, 'distance', 0, 2000).name('Distance')

		// // Add camera controls
		// const cameraFolder = this.gui.addFolder("Camera")
		// cameraFolder.add(this.camera.position, "x", -5, 5, 0.1).name("Position X")
		// cameraFolder.add(this.camera.position, "y", -5, 5, 0.1).name("Position Y")
		// cameraFolder.add(this.camera.position, "z", -5, 5, 0.1).name("Position Z")
		// cameraFolder.close()

		this.morphTargetFolder = this.gui.addFolder("Morph Targets")
		this.morphTargetFolder.close()

		// this.gui.close()
	}

	async loadModel() {
		const ktx2Loader = new KTX2Loader(loadingManager).setTranscoderPath("/").detectSupport(this.renderer)
		const loader = new GLTFLoader(loadingManager)
		loader.setKTX2Loader(ktx2Loader)
		loader.setMeshoptDecoder(MeshoptDecoder)
		console.log("MODEL_PATH", MODEL_PATH)
		loader.load(MODEL_PATH, (gltf) => {
			const mesh = gltf.scene.children[0]
			this.mixer = new AnimationMixer(mesh)
			this.mixer.clipAction(gltf.animations[0]).play()
			const head = mesh.getObjectByName("mesh_2")
			const influences = head.morphTargetInfluences
			//   // Center the model
			//   const box = new THREE.Box3().setFromObject(this.model)
			//   const center = box.getCenter(new THREE.Vector3())
			//   this.model.position.sub(center)
			//   // Setup morph targets
			//   this.model.traverse((node) => {
			//     if (node.isMesh && node.morphTargetDictionary) {
			//       this.meshWithMorphTargets = node
			//     }
			//   })
			// // Handle animations
			// if (gltf.animations?.length) {
			//   this.mixer = new THREE.AnimationMixer(this.model)
			//   this.animations = gltf.animations
			//   this.animations.forEach((clip) => {
			//     this.mixer.clipAction(clip).play()
			//   })
			// }
			for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
				this.morphTargetFolder.add(influences, value, 0, 1, 0.01).name(key.replace("blendShape1.", "")).listen()
			}
			//   this.gui.close()
			this.scene.add(mesh)
			//   this.scene.add(this.model)
			// Update GUI after model is loaded
			if (this.meshWithMorphTargets) {
				this.updateMorphTargetGUI()
			}
		})
	}

	render() {
		const delta = this.clock.getDelta()

		if (this.mixer) {
			this.mixer.update(delta)
		}

		// // Rotate the cube
		// this.cube.rotation.x += 0.01
		// this.cube.rotation.y += 0.01

		if (this.controls) {
			this.controls.update()
		}

		this.renderer.render(this.scene, this.camera)
	}
}

// Initialize the app
const app = new App()
