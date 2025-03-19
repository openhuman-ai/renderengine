import { AmbientLight } from "./lights/AmbientLight"
import { AnimationMixer } from "./animation/AnimationMixer"
import { AxesHelper } from "./helpers/AxesHelper"
import { BoxGeometry } from "./geometries/BoxGeometry"
import { Clock } from "./core/Clock"
import { DirectionalLight } from "@/lights/DirectionalLight"
import { GLTFLoader } from "./jsm/loaders/GLTFLoader"
import { LoadingManager } from "./loaders/LoadingManager"
import { Mesh } from "./objects/Mesh"
import { MeshPhongMaterial } from "./materials/MeshPhongMaterial"
import { OrbitControls } from "./jsm/controls/OrbitControls"
import { PerspectiveCamera } from "./cameras/PerspectiveCamera"
import { PointLight } from "./lights/PointLight"
import { RoomEnvironment } from "./jsm/environments/RoomEnvironment"
import { Scene } from "./scenes/Scene"
import { WebGLRenderer } from "./renderers/WebGLRenderer"
import GUI from "./gui/GUI"
import { AnimationClip } from "./animation/AnimationClip"
import { NumberKeyframeTrack } from "./animation/tracks/NumberKeyframeTrack"
import { DoubleSide, EquirectangularReflectionMapping, NormalAnimationBlendMode } from "./constants"
import { aniTime, aniValues } from "./data"
import { RGBELoader } from "./jsm/loaders/RGBELoader"
import { EXRLoader } from "./jsm/loaders/EXRLoader"
import { EffectComposer } from "./jsm/postprocessing/EffectComposer"
import { RenderPass } from "./jsm/postprocessing/RenderPass"
import { ShaderPass } from "./jsm/postprocessing/ShaderPass"
import { HorizontalBlurShader } from "./jsm/shaders/HorizontalBlurShader"
import { CopyShader } from "./jsm/shaders/CopyShader"
import { VerticalBlurShader } from "./jsm/shaders/VerticalBlurShader"
import { BufferGeometry } from "./core/BufferGeometry"
import { MeshStandardMaterial } from "./materials/MeshStandardMaterial"
import { BufferAttribute } from "./core/BufferAttribute"
import { SphereGeometry } from "./geometries/SphereGeometry"
import { MeshPhysicalMaterial } from "./materials/MeshPhysicalMaterial"
import { TextureLoader } from "./loaders/TextureLoader"
import { Color } from "./math/Color"
import { VertexNormalsHelper } from "./jsm/helpers/VertexNormalsHelper"
import { VertexTangentsHelper } from "./jsm/helpers/VertexTangentsHelper"
import { BoxHelper } from "./helpers/BoxHelper"
import { WireframeGeometry } from "./geometries/WireframeGeometry"
import { LineSegments } from "./objects/LineSegments"
import { GridHelper } from "./helpers/GridHelper"
import { PolarGridHelper } from "./helpers/PolarGridHelper"
import { PointLightHelper } from "./helpers/PointLightHelper"

const loadingManager = new LoadingManager()
loadingManager.onProgress = (url, loaded, total) => {
	// console.log(`Loading file: ${url}.\nLoaded ${loaded} of ${total} files.`)
}

const ANIMATION_MODEL_PATH = new URL("/facecap_output.gltf", import.meta.url).href
const MODEL_PATH = new URL("/model/SceneApp.gltf", import.meta.url).href

const ATTRIBUTES = {
	POSITION: "position",
	NORMAL: "normal",
	TANGENT: "tangent",
	TEXCOORD_0: "uv",
	TEXCOORD_1: "uv1",
	TEXCOORD_2: "uv2",
	TEXCOORD_3: "uv3",
	COLOR_0: "color",
	WEIGHTS_0: "skinWeight",
	JOINTS_0: "skinIndex",
}

const WEBGL_COMPONENT_TYPES = {
	5120: Int8Array,
	5121: Uint8Array,
	5122: Int16Array,
	5123: Uint16Array,
	5125: Uint32Array,
	5126: Float32Array,
}

const WEBGL_TYPE_SIZES = {
	SCALAR: 1,
	VEC2: 2,
	VEC3: 3,
	VEC4: 4,
	MAT2: 4,
	MAT3: 9,
	MAT4: 16,
}

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

	gltf
	binaryBuffer
	mesh
	meshFolder

	vnh
	vth

	constructor() {
		this.createRenderer()
		this.setupCamera()
		this.createClock()
		this.createControls()
		this.setupLights()
		// this.setupCube()
		// this.loadModel()
		this.loadJSON()
		// this.loadCustomModel()
		this.createGUI()
		this.createEnvironment()

		this.setupEventListeners()

		this.renderer.setAnimationLoop(() => {
			this.render()
		})
	}

	createEnvironment() {
		// const rgbeLoader = new RGBELoader()
		// rgbeLoader.load("/studio_small_03_1k.hdr", function (texture) {
		// 	texture.mapping = EquirectangularReflectionMapping
		// 	scene.background = texture
		// 	scene.environment = texture
		// })
		const scene = this.scene

		// const hdrEquirect = new RGBELoader().load("/studio_small_03_1k.hdr", function (texture) {
		// 	texture.mapping = EquirectangularReflectionMapping
		// 	// Set the environment map
		// 	scene.environment = texture
		// 	// Optionally, set the background
		// 	scene.background = texture
		// })

		const exrLoader = new EXRLoader()
		exrLoader.load("/forest.exr", function (texture) {
			texture.mapping = EquirectangularReflectionMapping

			// Set the environment map
			scene.environment = texture

			// Optionally, set the background
			scene.background = texture
		})
	}
	createClock() {
		this.clock = new Clock()
	}

	setupCamera() {
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		// this.camera.position.z = 100
		// this.camera.position.y = 20

		this.camera.position.z = 9
		this.camera.position.y = 2
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
		// this.renderer.setClearColor(0xffffff, 1)

		const room = new RoomEnvironment()
		// this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture

		const gridHelper = new GridHelper(400, 40, 0x0000ff, 0x808080)
		gridHelper.position.y = -150
		gridHelper.position.x = -150
		this.scene.add(gridHelper)

		const polarGridHelper = new PolarGridHelper(200, 16, 8, 64, 0x0000ff, 0x808080)
		polarGridHelper.position.y = -150
		polarGridHelper.position.x = 200
		this.scene.add(polarGridHelper)
	}

	createControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		// this.controls.enableDamping = false
		// this.controls.minDistance = 2.5
		// this.controls.maxDistance = 5
		// this.controls.minAzimuthAngle = -Math.PI / 2
		// this.controls.maxAzimuthAngle = Math.PI / 2
		// this.controls.maxPolarAngle = Math.PI / 1.8
		this.controls.target.set(0, 0.15, -0.2)

		// this.controls.enableDamping = true
		// this.controls.dampingFactor = 0.05
		// this.controls.screenSpacePanning = true
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

		this.scene.add(new PointLightHelper(this.lights.main, 15))
		this.scene.add(new PointLightHelper(this.lights.ambient, 15))
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

		// Add camera controls
		const cameraFolder = this.gui.addFolder("Camera")
		cameraFolder.add(this.camera.position, "x", -100, 100, 0.1).name("Position X")
		cameraFolder.add(this.camera.position, "y", -100, 100, 0.1).name("Position Y")
		cameraFolder.add(this.camera.position, "z", -100, 100, 0.1).name("Position Z")
		// cameraFolder.add(this.camera.rotation, "x", -10, 10, 0.1).name("Rotation X")
		// cameraFolder.add(this.camera.rotation, "y", -10, 10, 0.1).name("Rotation Y")
		// cameraFolder.add(this.camera.rotation, "z", -10, 10, 0.1).name("Rotation Z")
		// cameraFolder.close()

		this.morphTargetFolder = this.gui.addFolder("Morph Targets")
		this.morphTargetFolder.close()

		this.meshFolder = this.gui.addFolder("Mesh")

		// this.gui.close()
	}

	loadScene() {
		this.gltf.nodes.forEach((node, index) => {
			if (node.mesh !== undefined) {
				const mesh = this.createMesh(this.gltf.meshes[node.mesh])
				// console.log("mesh", mesh)
				this.scene.add(mesh)
			}
		})
	}

	createMesh(meshDef) {
		// console.log('meshDef', meshDef)
		const geometry = this.createGeometry(meshDef.primitives[0])
		const material = new MeshStandardMaterial({ color: 0xffffff })
		return new Mesh(geometry, material)
	}

	createGeometry(primitive) {
		const geometry = new BufferGeometry()
		// console.log("primitive", primitive)

		if (primitive.attributes.POSITION !== undefined) {
			const positionAccessor = this.gltf.accessors[primitive.attributes.POSITION]
			const positionBuffer = this.getBufferView(positionAccessor)
			// console.log("position", positionBuffer, primitive)
			geometry.setAttribute("position", new BufferAttribute(positionBuffer, 3))
		}

		if (primitive.attributes.NORMAL !== undefined) {
			const normalAccessor = this.gltf.accessors[primitive.attributes.NORMAL]
			const normalBuffer = this.getBufferView(normalAccessor)
			// console.log("normal", normalBuffer, primitive)
			geometry.setAttribute("normal", new BufferAttribute(normalBuffer, 3))
		}

		if (primitive.indices !== undefined) {
			const indexAccessor = this.gltf.accessors[primitive.indices]
			const indexBuffer = this.getBufferView(indexAccessor, true)
			geometry.setIndex(new BufferAttribute(indexBuffer, 1))
		}

		return geometry
	}

	getBufferView(accessor, isIndex = false) {
		const bufferView = this.gltf.bufferViews[accessor.bufferView]
		const buffer = this.binaryBuffer.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)

		const TypedArray = WEBGL_COMPONENT_TYPES[accessor.componentType]

		return new TypedArray(buffer)
	}

	getTypedArray(binaryBuffer, componentType, count, bufferView) {
		const byteOffset = bufferView.byteOffset || 0
		const byteLength = bufferView.byteLength
		const data = new DataView(binaryBuffer, byteOffset, byteLength)

		switch (componentType) {
			case 5126:
				return new Float32Array(data.buffer, byteOffset, count * 3) // FLOAT
			case 5123:
				return new Uint16Array(data.buffer, byteOffset, count) // UNSIGNED_SHORT
			case 5125:
				return new Uint32Array(data.buffer, byteOffset, count) // UNSIGNED_INT
			default:
				throw new Error(`Unsupported componentType: ${componentType}`)
		}
	}

	async loadJSON() {
		// const response = await fetch("/model/Facial.gltf")
		// this.gltf = await response.json()

		// const binResponse = await fetch("/model/Facial.bin")
		// this.binaryBuffer = await binResponse.arrayBuffer()

		// console.log("gltf", this.gltf)
		// this.loadScene()

		// this.addFace()
		// this.addTeeth()
		// this.addTongue()

		// const vertices = new Float32Array([-0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5])
		// const indices = new Uint16Array([0, 1, 2, 2, 3, 0, 1, 5, 6, 6, 2, 1, 5, 4, 7, 7, 6, 5, 4, 0, 3, 3, 7, 4, 3, 2, 6, 6, 7, 3, 4, 5, 1, 1, 0, 4])

		// const geometry = new BufferGeometry()
		// geometry.setAttribute("position", new BufferAttribute(vertices, 3))
		// geometry.setIndex(new BufferAttribute(indices, 1))

		// const material = new MeshStandardMaterial({ color: 0xffffff })
		// const mesh = new Mesh(geometry, material)

		// this.scene.add(mesh)

		const loader = new GLTFLoader(loadingManager)
		loader.load("/model/Facial.gltf", (gltf) => {
			this.mesh = gltf.scene.children[0]
			this.mesh.geometry.computeTangents()
			this.mesh.position.set(0, -4, 0)
			this.mesh.scale.set(20, 20, 20)
			// console.log("mesh", this.mesh)

			this.meshFolder.add(this.mesh.position, "x", -20, 20, 0.01).name("Position X")
			this.meshFolder.add(this.mesh.position, "y", -50, 50, 0.1).name("Position Y")
			this.meshFolder.add(this.mesh.position, "z", -50, 50, 0.1).name("Position Z")

			this.meshFolder.add(this.mesh.scale, "x", -20, 20, 0.01).name("Scale X")
			this.meshFolder.add(this.mesh.scale, "y", -50, 50, 0.1).name("Scale Y")
			this.meshFolder.add(this.mesh.scale, "z", -50, 50, 0.1).name("Scale Z")

			const bufferGeometry = this.mesh.geometry
			// console.log("bufferGeometry", bufferGeometry)
			const positionAttribute = bufferGeometry.attributes.position

			this.vnh = new VertexNormalsHelper(this.mesh, 0.2)
			this.scene.add(this.vnh)

			this.vth = new VertexTangentsHelper(this.mesh, 0.09)
			this.scene.add(this.vth)

			this.scene.add(new BoxHelper(this.mesh))

			// const wireframe = new WireframeGeometry(this.mesh.geometry)
			// let line = new LineSegments(wireframe)
			// line.material.depthTest = false
			// line.material.opacity = 0.25
			// line.material.transparent = true
			// line.position.x = 4
			// this.scene.add(line)
			// this.scene.add(new BoxHelper(line))

			this.scene.add(this.mesh)

			// this.gui.add(params, "showMesh").onChange((value) => (this.mesh.visible = value))
			// gui.add(params, "showPoints").onChange((value) => (points.visible = value))
		})
	}

	addFace() {
		const geometry = new SphereGeometry(1, 320, 320)
		const textureLoader = new TextureLoader()

		const faceNormal = textureLoader.load("/model/Face_Normal.jpg")
		const facemap = textureLoader.load("/model/FaceBaked2.jpg")
		const faceRoughness = textureLoader.load("/model/Face_Roughness.jpg")
		const faceMaterial = new MeshPhysicalMaterial({
			name: "Material.001",
			side: DoubleSide,
			clearcoat: 0.04848484694957733,
			clearcoatRoughness: 0.12393935769796371,
			ior: 1.4500000476837158,
			normalMap: faceNormal,
			map: facemap,
			metalnessMap: faceRoughness,
			metalness: 0,
		})
		const face = new Mesh(geometry, faceMaterial)
		face.position.set(-3, 0, 0)
		this.scene.add(face)
	}

	addTeeth() {
		const geometry = new SphereGeometry(1, 320, 320)
		const textureLoader = new TextureLoader()

		const teethBaseColorTexture = textureLoader.load("/model/Teeth_diffuse.jpg")
		const teethNormalTexture = textureLoader.load("/model/Teeth_Normal.jpg")
		const teethMaterial = new MeshPhysicalMaterial({
			color: new Color(0.6168677806854248, 0.6168677806854248, 0.6168677806854248),
			map: teethBaseColorTexture,
			normalMap: teethNormalTexture,
			metalness: 0,
			roughness: 0.3227272927761078,
			transparent: true,
			side: DoubleSide,
			ior: 1.45,
			specularIntensity: 1.0,
			specularColor: new Color(0.6168677806854248, 0.6168677806854248, 0.6168677806854248),
		})
		const teeth = new Mesh(geometry, teethMaterial)
		this.scene.add(teeth)
	}

	addTongue() {
		const geometry = new SphereGeometry(1, 320, 320)
		const textureLoader = new TextureLoader()

		const tongueBaseColorTexture = textureLoader.load("/model/Tongue_Diffuse.jpg")
		const tongueNormalTexture = textureLoader.load("/model/Tongue_Normal.jpg")
		const tongueMaterial = new MeshPhysicalMaterial({
			color: new Color(1.0, 0.6, 0.6),
			map: tongueBaseColorTexture,
			normalMap: tongueNormalTexture,
			metalness: 0,
			roughness: 0.3,
			transparent: true,
			side: DoubleSide,
			ior: 1.45,
			specularIntensity: 0.6,
		})
		const tongue = new Mesh(geometry, tongueMaterial)
		tongue.position.set(3, 0, 0)
		this.scene.add(tongue)
	}

	async loadCustomModel() {
		const loader = new GLTFLoader(loadingManager)

		loader.load(MODEL_PATH, (gltf) => {
			const mesh = gltf.scene.children[0]
			console.log(mesh)
			this.scene.add(mesh)
		})
	}

	// async loadModel() {
	// 	const aniClipKF = new NumberKeyframeTrack("mesh_2.morphTargetInfluences", aniTime, aniValues)
	// 	const aniClip = new AnimationClip("Key|Take 001|BaseLayer", 11.18083381652832, [aniClipKF], NormalAnimationBlendMode)
	// 	// ~~~~~~~~~~~~~~~

	// 	const loader = new GLTFLoader(loadingManager)
	// 	console.log("MODEL_PATH", MODEL_PATH)
	// 	const axesHelper = new AxesHelper(10)
	// 	this.scene.add(axesHelper)

	// 	const animationKF = new NumberKeyframeTrack(".facialanimation", [0, 1, 2], [1, 0, 1])

	// 	const clip = new AnimationClip("Action", 3, [animationKF])

	// 	loader.load(MODEL_PATH, (gltf) => {
	// 		// console.log("gltf", gltf)
	// 		const mesh = gltf.scene.children[0]
	// 		// console.log("mesh", mesh)
	// 		// console.log("gltf.scene", gltf.scene)
	// 		// console.log("gltf.scene.children", gltf.scene.children[0])
	// 		this.mixer = new AnimationMixer(mesh)
	// 		const facialAnimation = gltf.animations[0]
	// 		// console.log("facialAnimation", facialAnimation)
	// 		// console.log("aniClip", aniClip)

	// 		const animationAction = this.mixer.clipAction(aniClip)
	// 		// console.log("animationAction", animationAction)
	// 		// animationAction.play()
	// 		// const head = mesh.getObjectByName("mesh_2")
	// 		// const influences = head.morphTargetInfluences
	// 		//   // Center the model
	// 		//   const box = new Box3().setFromObject(this.model)
	// 		//   const center = box.getCenter(new Vector3())
	// 		//   this.model.position.sub(center)
	// 		//   // Setup morph targets
	// 		//   this.model.traverse((node) => {
	// 		//     if (node.isMesh && node.morphTargetDictionary) {
	// 		//       this.meshWithMorphTargets = node
	// 		//     }
	// 		//   })
	// 		// // Handle animations
	// 		// if (gltf.animations?.length) {
	// 		//   this.mixer = new AnimationMixer(this.model)
	// 		//   this.animations = gltf.animations
	// 		//   this.animations.forEach((clip) => {
	// 		//     this.mixer.clipAction(clip).play()
	// 		//   })
	// 		// }
	// 		// for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
	// 		// 	this.morphTargetFolder.add(influences, value, 0, 1, 0.01).name(key.replace("blendShape1.", "")).listen()
	// 		// }
	// 		//   this.gui.close()
	// 		this.scene.add(mesh)
	// 		//   this.scene.add(this.model)

	// 		// function printHierarchy(object, depth = 0) {
	// 		// 	console.log(`${' '.repeat(depth * 2)}📦 ${object.type} (${object.name || 'Unnamed'})`);
	// 		// 	object.children.forEach(child => printHierarchy(child, depth + 1));
	// 		// }

	// 		// printHierarchy(this.scene);
	// 	})
	// }

	render() {
		const delta = this.clock.getDelta()

		if (this.mixer) {
			this.mixer.update(delta)
		}

		const time = -this.clock.getElapsedTime() * 0.0003

		// this.camera.position.x = 400 * Math.cos(time)
		// this.camera.position.z = 400 * Math.sin(time)
		// this.camera.lookAt(this.scene.position)

		this.lights.main.position.x = Math.sin(time * 1.7) * 300
		this.lights.main.position.y = Math.cos(time * 1.5) * 400
		this.lights.main.position.z = Math.cos(time * 1.3) * 30

		// if (this.vnh) this.vnh.update()
		// if (this.vth) this.vth.update()

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
