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
import {
	ACESFilmicToneMapping,
	DoubleSide,
	EquirectangularReflectionMapping,
	FrontSide,
	LinearSRGBColorSpace,
	LinearToneMapping,
	NormalAnimationBlendMode,
	SRGBColorSpace,
} from "./constants"
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
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute } from "./core/BufferAttribute"
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
import { SkeletonHelper } from "./helpers/SkeletonHelper"
import { MathUtils } from "./math/MathUtils"
import { OBJLoader } from "./jsm/loaders/OBJLoader"
import { PMREMGenerator } from "./extras/PMREMGenerator"
import { Vector2 } from "./math/Vector2"
import { DirectionalLightHelper } from "./helpers/DirectionalLightHelper"
import { Box3 } from "./math/Box3"
import { Vector3 } from "./math/Vector3"
import { Object3D } from "./core/Object3D"
import { Group } from "./objects/Group"
import { RectAreaLight } from "./lights/RectAreaLight"

import { environments } from "./environments.js"
import { BokehPass } from "./jsm/postprocessing/BokehPass"
import { MeshBasicMaterial } from "./materials/MeshBasicMaterial"
import { CylinderGeometry } from "./geometries/CylinderGeometry"
import { Bone } from "./objects/Bone"
import { SkinnedMesh } from "./objects/SkinnedMesh"
import { Skeleton } from "./objects/Skeleton"
import { ShaderLib } from "./renderers/shaders/ShaderLib"
import { UniformsUtils } from "./renderers/shaders/UniformsUtils"
import { ShaderMaterial } from "./materials/ShaderMaterial"
import { TransformControls } from "./jsm/controls/TransformControls"

const loadingManager = new LoadingManager()
loadingManager.onProgress = (url, loaded, total) => {
	// console.log(`Loading file: ${url}.\nLoaded ${loaded} of ${total} files.`)
}

const ANIMATION_MODEL_PATH = new URL("/facecap_output.gltf", import.meta.url).href
const MODEL_PATH = new URL("/model/FullRender.glb", import.meta.url).href

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

export class App {
	canvas
	renderer
	camera
	cameraParams = {
		fov: 60,
		aspect: window.innerWidth / window.innerHeight,
		near: 0.1,
		far: 10000,
		rotateX: 0,
		rotateY: 0,
		rotateZ: 0,
	}
	backgroundColor
	state = {
		bgColor: "#191919",
		environment: environments[1].name,
		autoRotate: false,
		background: true,
		focalLength: 60,
		fov: 60,
		toneMapping: ACESFilmicToneMapping,
		exposure: 0.4,
		ambientColor: "#FFFFFF",
		ambientIntensity: 0.84,
		directIntensity: 2.2,
		directColor: "#FFFFFF",
		punctualLights: true,

		postProcessing: false,
		bokeh: false,
		bloom: false,
		film: false,
		dotScreen: false,

		bokehFocus: 10.0,
		bokehAperture: 0.025,
		bokehMaxBlur: 0.01,
		bokehWidth: 0.5,
		bokehHeight: 0.5,
		bokehFocalLength: 0.5,
		bokehFStop: 0.5,
		bokehMaxBlurRadius: 0.5,
		bokehBlur: 0.5,
		bokehAspect: 1.0,
		bokehFocalDistance: 0.5,
	}
	scene
	mixer
	controls
	transformControl
	clock
	material
	model

	composer
	postProcessing = {
		bokehPass: null,
	}

	effectFXAA
	meshWithMorphTargets
	morphTargetFolder
	gui
	guiParams = {
		showAxes: false,
		showBox: false,
		showGrid: false,
		showLightHelpers: false,
		vnh: false,
		vth: false,
	}
	helpers = {
		axes: null,
		box: null,
		grid: null,
		directLight: null,
		// ambient: null,
		// frontLight: null,
		// backLight: null,
		// point1: null,
		// point2: null,
		vnh: null,
		vth: null,
		skeleton: null,
	}
	helperFolder
	lights = {
		ambient: undefined,
		direct: undefined,
		// front: undefined,
		// back: undefined,
		// point1: undefined,
		// point2: undefined,
	}

	// components
	rootGroup = new Group()
	brows = {
		mesh: null,
		material: null,
	}
	face = {
		mesh: null,
		material: null,

		baseColor: null,
		normal: null,
		roughness: null,
		specular: null,
		displacement: null,
	}
	eyewet = {
		meshLeft: null,
		meshRight: null,
		material: null,

		specular: null,
	}
	lens = {
		meshLeft: null,
		meshRight: null,
		material: null,

		specular: null,
		normal: null,
	}
	lashes = {
		mesh: null,
		material: null,
	}
	eyeball = {
		meshLeft: null,
		meshRight: null,
		material: null,

		baseColor: null,
		normal: null,
		roghness: null,
		specular: null,
		displacement: null,
	}

	teeth = {
		upperTeethMesh: null,
		lowerTeethMesh: null,
		material: null,

		baseColor: null,
		normal: null,
		roughness: null,
	}
	tongue = {
		tougueMesh: null,
		material: null,

		baseColor: null,
		normal: null,
		roughness: null,
	}

	pmremGenerator

	mouseX = 0
	mouseY = 0

	targetX = 0
	targetY = 0
	windowHalfX = window.innerWidth / 2
	windowHalfY = window.innerHeight / 2

	meshRoot

	gltf
	binaryBuffer
	mesh
	meshFolder

	vnh
	vth

	sizing = {
		halfHeight: 2.5,
		segmentHeight: 1.0,
		segments: 5,
	}
	skeleton

	constructor() {
		this.createRenderer()
		this.createScene()
		this.createCamera()
		this.createEnvironment()
		this.createClock()
		this.createControls()
		this.createTransformControls()
		this.createLights()
		// this.createCube()
		// this.createCylinder()
		this.loadTexure()
		this.loadMaterial()
		// this.loadGLSLShader()
		this.loadModel()
		// this.loadGLTF()
		// this.loadHair()
		// this.loadJSON()
		// this.loadCustomModel()

		if (this.state.postProcessing) {
			this.createPostProcessing()
		}
		this.addHelpers()
		this.createGUI()

		this.setupEventListeners()

		window.OPENHUMAN = this

		this.renderer.setAnimationLoop(() => {
			this.render()
		})
	}

	createRenderer() {
		const canvas = document.querySelector("#scene")
		if (!canvas) throw new Error("Canvas element not found")
		this.canvas = canvas

		this.renderer = new WebGLRenderer({ canvas: canvas, antialias: true, alpha: true })
		this.renderer.setClearColor(0xcccccc)
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

		// this.renderer.gammaFactor = 2.2
		// this.renderer.gammaOutput = true
		// this.renderer.setClearColor(0xffffff, 1)

		// const room = new RoomEnvironment()
		// this.pmremGenerator = new PMREMGenerator(this.renderer)
		// this.pmremGenerator.compileEquirectangularShader()
		// this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment()).texture
	}

	createScene() {
		this.backgroundColor = new Color(this.state.bgColor)
		this.scene = new Scene()
		this.scene.background = this.backgroundColor
	}

	createEnvironment() {
		// // const rgbeLoader = new RGBELoader()
		// // rgbeLoader.load("/studio_small_03_1k.hdr", function (texture) {
		// // 	texture.mapping = EquirectangularReflectionMapping
		// // 	scene.background = texture
		// // 	scene.environment = texture
		// // })
		// const scene = this.scene
		this.pmremGenerator = new PMREMGenerator(this.renderer)
		this.pmremGenerator.compileEquirectangularShader()

		this.updateEnvironment()

		// // const hdrEquirect = new RGBELoader().load("/studio_small_03_1k.hdr", function (texture) {
		// // 	texture.mapping = EquirectangularReflectionMapping
		// // 	// Set the environment map
		// // 	scene.environment = texture
		// // 	// Optionally, set the background
		// // 	scene.background = texture
		// // })

		// // const pmremGenerator = this.pmremGenerator
		// // const exrLoader = new EXRLoader()
		// // exrLoader.load("/venice_sunset_1k.exr", function (texture) {
		// // 	const envMap = pmremGenerator.fromEquirectangular(texture).texture
		// // 	// texture.mapping = EquirectangularReflectionMapping

		// // 	scene.environment = envMap
		// // 	scene.background = envMap
		// // })
		// const exrLoader = new EXRLoader()
		// exrLoader.load("/HDRI.exr", function (texture) {
		// 	texture.mapping = EquirectangularReflectionMapping

		// 	scene.environment = texture

		// 	scene.background = texture
		// })
	}

	createClock() {
		this.clock = new Clock()
	}

	createCamera() {
		// const focalLength = 20
		const aspect = window.innerWidth / window.innerHeight
		this.camera = new PerspectiveCamera(this.state.fov, aspect, 0.1, 10000)
		this.scene.add(this.camera)
		// this.camera.setFocalLength(this.state.focalLength)
		// this.camera.fov = MathUtils.radToDeg(fovVertical)

		// this.camera.position.set(31.0456, 26.2669, 160.913)
		// this.camera.rotation.set(MathUtils.degToRad(88.9339), MathUtils.degToRad(0), MathUtils.degToRad(13))
		// this.camera.rotation.set(MathUtils.degToRad(90), MathUtils.degToRad(0), MathUtils.degToRad(13))

		// this.camera.rotation.y = MathUtils.degToRad(45)
		// this.camera.updateProjectionMatrix()
	}

	createTransformControls() {
		this.transformControl = new TransformControls(this.camera, this.renderer.domElement)
		// this.tranformControls.addEventListener("change", this.renderer)
		this.transformControl.addEventListener("change", () => {
			this.renderer.render(this.scene, this.camera)
		})
	}

	createControls() {
		this.controls = new OrbitControls(this.camera, this.renderer.domElement)
		this.controls.enableDamping = false
		// this.controls.reset()
		this.controls.autoRotate = this.state.autoRotate
		// this.controls.minDistance = 2.5
		// this.controls.maxDistance = 5
		// this.controls.minAzimuthAngle = -Math.PI / 2
		// this.controls.maxAzimuthAngle = Math.PI / 2
		// this.controls.maxPolarAngle = Math.PI / 1.8
		// this.controls.target.set(0, 0.15, -0.2)

		// this.controls.enableDamping = true
		// this.controls.dampingFactor = 0.05
		this.controls.screenSpacePanning = true
	}

	createCube() {
		const geometry = new BoxGeometry(1, 1, 1)
		const material = new MeshPhongMaterial({ color: 0x00ff00 })
		this.cube = new Mesh(geometry, material)
		this.scene.add(this.cube)
	}

	createCylinder() {
		const geometry = new CylinderGeometry(5, 5, 5, 5, this.sizing.segments, true)
		const material = new MeshBasicMaterial({
			color: 0x156289,
			wireframe: true,
			skinning: true,
		})

		// 3. Tạo xương (bones) theo segment
		const bones = []
		let prevBone = null

		for (let i = 0; i <= this.sizing.segments; i++) {
			const bone = new Bone()
			bone.position.y = i * this.sizing.segmentHeight
			if (prevBone) {
				prevBone.add(bone)
			}
			bones.push(bone)
			prevBone = bone
		}

		// 4. Tạo skin indices và skin weights thủ công
		const position = geometry.attributes.position
		const vertex = new Vector3()

		const skinIndices = []
		const skinWeights = []

		for (let i = 0; i < position.count; i++) {
			vertex.fromBufferAttribute(position, i)

			// Chuyển vertex.y về hệ tọa độ 0 -> chiều cao hình trụ
			const y = vertex.y + this.sizing.halfHeight

			const skinIndex = Math.floor(y / this.sizing.segmentHeight)
			const skinWeight = (y % this.sizing.segmentHeight) / this.sizing.segmentHeight

			// Mỗi vertex chịu ảnh hưởng bởi 2 bone liền kề
			skinIndices.push(skinIndex, skinIndex + 1, 0, 0)
			skinWeights.push(1 - skinWeight, skinWeight, 0, 0)
		}

		geometry.setAttribute("skinIndex", new Uint16BufferAttribute(skinIndices, 4))
		geometry.setAttribute("skinWeight", new Float32BufferAttribute(skinWeights, 4))

		// 5. Tạo SkinnedMesh và Skeleton
		const mesh = new SkinnedMesh(geometry, material)
		this.skeleton = new Skeleton(bones)

		// Thêm xương gốc vào mesh
		mesh.add(bones[0])

		// Gắn skeleton vào mesh
		mesh.bind(this.skeleton)

		this.scene.add(mesh)
	}

	createLights() {
		// const ambientLight = new AmbientLight(0xffffff, 0.63)
		// this.scene.add(ambientLight)
		const state = this.state

		this.lights.ambient = new AmbientLight(state.ambientColor, state.ambientIntensity)
		this.camera.add(this.lights.ambient)
		// this.lights.ambient.position.set(29.490512351215415, 9.542161596494855, 54.84826183924672)
		// this.scene.add(this.lights.ambient)

		this.lights.direct = new DirectionalLight(state.directColor, state.directIntensity)
		this.lights.direct.position.set(0.5, 0, 0.866)
		// this.lights.direct = new RectAreaLight(0xffffff, 2.5, 30, 30)
		// this.lights.direct.position.set(5, 20.5581, 20.5581)
		// this.lights.direct.position.set(30.32054859620017, 9.608268401048035, 55.40199979388174)

		// this.lights.direct.position.set(-75.91937256908001, 109.34746955415513, 107.01013084245002)

		// this.lights.direct.rotation.set(-1.19286, 0.15951, -0.39485)
		// console.log("object.rotation.order", this.lights.direct.rotation.order)
		this.camera.add(this.lights.direct)
		// this.scene.add(this.lights.direct)
		// const helper = new DirectionalLightHelper(this.lights.direct, 5)
		// this.scene.add(helper)
	}

	setupEventListeners() {
		window.addEventListener("resize", () => this.onWindowResize())
		window.addEventListener("mousemove", (event) => {
			this.mouseX = (event.clientX / window.innerWidth) * 2 - 1
			this.mouseY = -(event.clientY / window.innerHeight) * 2 + 1
		})
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
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

	updateEyeRotation(eyeMesh) {
		const maxRotation = 0.35 // radians (~20 degrees)

		const targetX = this.mouseY * maxRotation // vertical movement → rotate eye around X
		const targetY = this.mouseX * maxRotation // horizontal movement → rotate eye around Y

		// Apply smooth rotation (optional)
		eyeMesh.rotation.x += (targetX - eyeMesh.rotation.x) * 0.1
		eyeMesh.rotation.y += (targetY - eyeMesh.rotation.y) * 0.1
	}

	async loadTexure() {
		const textureLoader = new TextureLoader(loadingManager)

		this.eyewet.specular = textureLoader.load("/facetoy/specular/specular_1.png")
		this.face.specular = textureLoader.load("/facetoy/specular/specular_2.png")
		this.eyeball.specular = textureLoader.load("/facetoy/specular/specular_eyeball.png")

		this.face.normal = textureLoader.load("/facetoy/normal/normal_1.png")
		this.lens.normal = textureLoader.load("/facetoy/normal/normal_lens.png")
		this.eyeball.normal = textureLoader.load("/facetoy/normal/normal_eyeball.png")
		this.teeth.normal = textureLoader.load("/facetoy/normal/normal_4.png")
		this.tongue.normal = textureLoader.load("/facetoy/normal/normal_5.png")

		this.face.baseColor = textureLoader.load("/facetoy/baseColor/baseColor_1.png") // baseColor_face.png
		this.face.baseColor.colorSpace = SRGBColorSpace
		this.eyeball.baseColor = textureLoader.load("/facetoy/baseColor/baseColor_eyeball.png")
		this.eyeball.baseColor.colorSpace = SRGBColorSpace
		this.teeth.baseColor = textureLoader.load("/facetoy/baseColor/baseColor_3.png")
		this.teeth.baseColor.colorSpace = SRGBColorSpace
		this.tongue.baseColor = textureLoader.load("/facetoy/baseColor/baseColor_4.png")
		this.tongue.baseColor.colorSpace = SRGBColorSpace

		this.face.roughness = textureLoader.load("/facetoy/roughness/metallicRoughness_1.png")
		this.eyeball.roughness = textureLoader.load("/facetoy/roughness/roughness_eyeball.png")
		this.teeth.roughness = textureLoader.load("/facetoy/roughness/roughness_teeth.png")
		this.tongue.roughness = textureLoader.load("/facetoy/roughness/roughness_tongue.png")

		this.face.displacement = textureLoader.load("/facetoy/displacement/displacement_face.png")
		this.eyeball.displacement = textureLoader.load("/facetoy/displacement/displacement_eyeball.png")
	}

	async loadMaterial() {
		this.face.material = new MeshPhysicalMaterial({
			name: "face",
			side: DoubleSide,

			map: this.face.baseColor,
			normalMap: this.face.normal,
			normalScale: new Vector2(0.7, 0.7), // normalTexture scale
			metalness: 0.0,

			roughnessMap: this.face.roughness,
			metalnessMap: this.face.roughness,

			// Clearcoat extension
			clearcoat: 0.04848499968647957,
			clearcoatRoughness: 0.12393900007009506,
			clearcoatMap: this.face.roughness,
			// clearcoatNormalMap : this.face.normal,
			// clearcoatRoughnessMap: this.face.roughness,

			// Specular extension
			specularColor: new Color(0xffffff),
			specularIntensity: 1, // not directly in GLTF, adjust as needed
			specularIntensityMap: this.face.specular,
			// IOR extension
			ior: 1.45,
			sheenColor: new Color(0, 0, 0),
			sheenRoughness: 1,

			// displacementMap: this.face.displacement,
			// displacementScale: 0.0001,
			// displacementBias: 0.0001,
		})

		this.brows.material = new MeshPhysicalMaterial({
			name: "Brows",
			color: new Color(0.0739023, 0.073903, 0.073903), // baseColorFactor RGB
			opacity: 0.721212, // baseColorFactor Alpha
			transparent: true, // alphaMode: "BLEND"
			side: DoubleSide,
			ior: 1.45, // KHR_materials_ior
			specularColor: new Color(2, 2, 2), // KHR_materials_specular
			transmission: 0, // set explicitly if not used
			metalness: 0, // default if not specified
			roughness: 1, // default if not specified
		})

		this.eyewet.material = new MeshPhysicalMaterial({
			name: "eyewet",
			color: new Color(0, 0, 0), // baseColorFactor RGB
			opacity: 0.1, // baseColorFactor Alpha
			transparent: true, // alphaMode: "BLEND"
			side: DoubleSide,
			roughness: 0.2030302882194519, // from pbrMetallicRoughness
			metalness: 0, // from pbrMetallicRoughness
			ior: 1.45, // KHR_materials_ior
			// Placeholder for specular texture (index 11)
			// You must assign the correct texture loaded from GLTF later:
			// specularMap: textures[11]
		})

		this.lens.material = new MeshPhysicalMaterial({
			name: "lens",

			// PBR
			color: new Color(0.502883, 0.502887, 0.502887), // baseColorFactor RGB
			transparent: true,
			opacity: 0.3,
			roughness: 0.06363636,
			metalness: 1.0,

			// Normals
			normalMap: this.lens.normal,
			normalScale: new Vector2(1, 1), // adjust if needed

			// Double-sided rendering
			side: DoubleSide,

			// Specular Extension
			// specularColor: new Color(2, 2, 2), // KHR_materials_specular.specularColorFactor
			specularIntensity: 1.0, // not directly in GLTF, adjust as needed
			specularIntensityMap: this.lens.specular,
			specularColor: new Color(2, 2, 2),
			specularColorMap: this.lens.specular,

			// IOR Extension
			ior: 1.45, // KHR_materials_ior

			// Emissive (unused)
			emissive: 0x000000,
		})

		this.lashes.material = new MeshPhysicalMaterial({
			name: "lashes",
			color: new Color(0.0739023, 0.073903, 0.073903), // baseColorFactor RGB
			opacity: 0.721212, // baseColorFactor Alpha
			transparent: true, // alphaMode: "BLEND"
			side: DoubleSide,
			metalness: 1, // metallicFactor
			roughness: 1, // roughnessFactor
			ior: 1.45, // KHR_materials_ior
			specularColor: new Color(2, 2, 2), // KHR_materials_specular
			emissive: new Color(0, 0, 0), // emissiveFactor
		})

		this.eyeball.material = new MeshPhysicalMaterial({
			name: "eyeball",
			side: DoubleSide,
			metalness: 0, // metallicFactor: 0
			map: this.eyeball.baseColor, // textures[4], // baseColorTexture index 4
			roughness: 1.0,
			metalnessMap: this.eyeball.roughness, // textures[6], // metallicRoughnessTexture index 6
			roughnessMap: this.eyeball.roughness, // textures[6], // same texture as metalnessMap
			normalMap: this.eyeball.normal, // textures[5], // normalTexture index 5
			// wireframe:true,

			ior: 1.45, // KHR_materials_ior

			specularIntensity: 1.0, // not directly in GLTF, adjust as needed
			specularIntensityMap: this.eyeball.specular,
			specularColor: 0xffffff,
			specularColorMap: this.eyeball.specular,

			displacementMap: this.eyeball.displacement,
			displacementScale: 0.0001,
			displacementBias: 0.0001,
		})

		this.teeth.material = new MeshPhysicalMaterial({
			name: "teeth",
			side: DoubleSide,
			map: this.teeth.baseColor, // baseColorTexture index 1
			color: new Color(1, 1, 1), // baseColorFactor RGB
			opacity: 1, // baseColorFactor Alpha
			transparent: false, // alphaMode: "OPAQUE"
			metalness: 0, // metallicFactor

			roughness: 0.3227272927761078, // roughnessFactor
			roughnessMap: this.teeth.roughness,

			normalMap: this.teeth.normal, // normalTexture index 0
			ior: 1.45, // KHR_materials_ior
			specularColor: new Color(0.6168678, 0.6168678, 0.6168678), // KHR_materials_specular
			emissive: new Color(0, 0, 0), // emissiveFactor
		})

		this.tongue.material = new MeshPhysicalMaterial({
			name: "tongue",
			side: DoubleSide,
			map: this.tongue.baseColor, // baseColorTexture index 1

			metalness: 0, // metallicFactor
			roughness: 0.3, // roughnessFactor
			roughnessMap: this.tongue.roughness,

			color: new Color(1, 1, 1), // baseColorFactor RGB
			opacity: 1, // baseColorFactor Alpha (1.0)
			transparent: false, // alphaMode: "OPAQUE"
			normalMap: this.tongue.normal, // normalTexture index 0
			ior: 1.45, // KHR_materials_ior
			specularIntensity: 0.6, // KHR_materials_specular (specularFactor)
			emissive: new Color(0, 0, 0), // emissiveFactor
		})
	}

	async loadModel() {
		// const loader = new GLTFLoader(loadingManager)
		// loader.load("/hair/hair.glb", (gltf) => {
		// 	window.OPENHUMAN.gltf = gltf
		// 	let scene = gltf.scene || gltf.scenes[0]
		// 	group.add(scene)
		// 	// this.loadContent(scene, clips)
		// })

		this.scene.add(this.rootGroup)
		// const textureLoader = new TextureLoader(loadingManager)

		const models = [
			{
				name: "Head",
				path: "/obj1/Head.obj",
				material: this.face.material,
			},
			{
				name: "Brows",
				path: "/obj1/Brows.obj",
				material: this.brows.material,
			},
			{
				name: "EyeWet",
				path: "/obj1/EyeWet.obj",
				material: this.eyewet.material,
			},
			{
				name: "LensLeft",
				path: "/obj1/LensLeft.obj",
				material: this.lens.material,
			},
			{
				name: "LensRight",
				path: "/obj1/LensRight.obj",
				material: this.lens.material,
			},
			{
				name: "Lashes",
				path: "/obj1/Lashes.obj",
				material: this.lashes.material,
			},
			{
				name: "RealtimeEyeballLeft",
				path: "/obj1/RealtimeEyeballLeft.obj",
				material: this.eyeball.material,
			},
			{
				name: "RealtimeEyeballRight",
				path: "/obj1/RealtimeEyeballRight.obj",
				material: this.eyeball.material,
			},
			{
				name: "UpperTeeth",
				path: "/obj1/UpperTeeth.obj",
				material: this.teeth.material,
			},
			{
				name: "LowerTeeth",
				path: "/obj1/LowerTeeth.obj",
				material: this.teeth.material,
			},
			{
				name: "Tongue",
				path: "/obj1/Tongue.obj",
				material: this.tongue.material,
			},
		]

		const meshMap = new Map()

		const objloader = new OBJLoader(loadingManager)
		Promise.all(models.map((model) => this.loadAndApplyMaterial(objloader, model))).then((meshes) => {
			meshes.forEach(({ name, mesh }) => {
				this.rootGroup.add(mesh)
				meshMap.set(name, mesh)
			})

			this.rootGroup.updateMatrixWorld()
			const box = new Box3().setFromObject(this.rootGroup)
			const size = box.getSize(new Vector3()).length()
			const center = box.getCenter(new Vector3())

			this.controls.reset()

			// this.addMeshHelpers(group)

			this.rootGroup.position.x -= center.x
			this.rootGroup.position.y -= center.y
			this.rootGroup.position.z -= center.z

			this.controls.maxDistance = size * 10

			this.camera.near = size / 100
			this.camera.far = size * 100
			this.camera.setFocalLength(30)
			this.camera.updateProjectionMatrix()

			this.camera.position.copy(center)
			this.camera.position.x += size / 3.0
			this.camera.position.y -= size / 3.0
			this.camera.position.z += size * 2
			this.camera.lookAt(center)

			// this.setCamera(this.camera)

			// this.brows.mesh = meshMap.get("Brows")
			// this.eyewet.mesh = meshMap.get("EyeWet")
			// this.lens.meshLeft = meshMap.get("LensLeft")
			// this.lens.meshRight = meshMap.get("LensRight")
			// this.lashes.mesh = meshMap.get("Lashes")
			// this.eyeball.meshLeft = meshMap.get("RealtimeEyeballLeft")
			// this.eyeball.meshRight = meshMap.get("RealtimeEyeballRight")
			// this.teeth.upperTeethMesh = meshMap.get("UpperTeeth")
			// this.teeth.lowerTeethMesh = meshMap.get("LowerTeeth")
			// this.tongue.tougueMesh = meshMap.get("Tongue")

			this.updateLights()
			// this.updateGUI()
			this.updateEnvironment()
			this.updateDisplay()
		})

		console.log("this.tranformControls", this.transformControl)
		// console.log(object)
		this.transformControl.attach(this.rootGroup)
		if (this.transformControl instanceof Object3D) {
			this.scene.add(this.transformControl)
		} else {
			console.warn("TransformControls is not an Object3D — check import/version.")
		}
		this.scene.add(this.transformControl)
		// this.scene.add(this.tranformControls)

		window.addEventListener("keydown", function (event) {
			switch (event.keyCode) {
				case 81: // Q
					this.transformControls.setSpace(this.transformControls.space === "local" ? "world" : "local")
					break

				case 17: // Ctrl
					this.transformControls.setTranslationSnap(100)
					this.transformControls.setRotationSnap(THREE.Math.degToRad(15))
					break

				case 87: // W
					this.transformControls.setMode("translate")
					break

				case 69: // E
					this.transformControls.setMode("rotate")
					break

				case 82: // R
					this.transformControls.setMode("scale")
					break

				case 187:
				case 107: // +, =, num+
					this.transformControls.setSize(this.transformControls.size + 0.1)
					break

				case 189:
				case 109: // -, _, num-
					this.transformControls.setSize(Math.max(this.transformControls.size - 0.1, 0.1))
					break
			}
		})

		window.addEventListener("keyup", function (event) {
			switch (event.keyCode) {
				case 17: // Ctrl
					this.transformControls.setTranslationSnap(null)
					this.transformControls.setRotationSnap(null)
					break
			}
		})
	}

	loadGLSLShader() {
		// Trigger compilation by rendering once
		console.log("this.face.material", this.face.material)
		this.face.material.onBeforeCompile = (shader) => {
			// Save or log the raw GLSL source
			console.log("Vertex Shader:", shader.vertexShader)
			console.log("Fragment Shader:", shader.fragmentShader)

			// Optionally modify shader code here
			// shader.vertexShader = shader.vertexShader.replace(...);
			// shader.fragmentShader = shader.fragmentShader.replace(...);
		}
		this.camera.position.set(0, 48, 20)

		const objloader = new OBJLoader(loadingManager)
		objloader.load("/obj1/Head.obj", (obj) => {
			let mesh = null
			console.log("obj", obj)

			obj.traverse((child) => {
				if (child.isMesh) {
					child.material = this.face.material
					child.name = name
					mesh = child
				}
			})

			this.scene.add(obj)
			// if (mesh) {
			// 	resolve({ name, mesh })
			// } else {
			// 	reject(new Error(`No mesh found in ${path}`))
			// }
		})

		// const geometry = new BoxGeometry(10, 10, 10)
		// const material = new MeshPhysicalMaterial({ color: 0x00ff00 })
		// const customMaterial = new ShaderMaterial({
		// 	uniforms: UniformsUtils.merge([
		// 		ShaderLib.physical.uniforms,
		// 		{
		// 			// You can add additional custom uniforms here
		// 			time: { value: 0 },
		// 		},
		// 	]),
		// 	vertexShader: ShaderLib.physical.vertexShader,
		// 	fragmentShader: ShaderLib.physical.fragmentShader,

		// 	// Physical material properties
		// 	defines: {
		// 		PHYSICAL: "",
		// 	},
		// 	clearcoat: 0.5,
		// 	clearcoatRoughness: 0.1,
		// 	metalness: 0.8,
		// 	roughness: 0.3,
		// 	color: new Color(0x156289),
		// 	emissive: new Color(0x000000),
		// 	ior: 1.5,
		// 	transmission: 0.0,
		// 	side: FrontSide,
		// 	transparent: false,
		// 	envMapIntensity: 1.0,
		// })
		// this.camera.position.set(0, 48, 1)
		// this.cube = new Mesh(geometry, material)
		// this.scene.add(this.cube)

		// // Force compilation by rendering once
		// this.renderer.render(this.scene, this.camera)

		// // Access the program object after render
		// const program = this.renderer.properties.get(this.cube.material)?.program
		// console.log("program", program)

		// if (program) {
		// 	const vertexShaderFinal = program.vertexShader
		// 	const fragmentShaderFinal = program.fragmentShader
		// 	console.log("Full Vertex Shader:", vertexShaderFinal)
		// 	console.log("Full Fragment Shader:", fragmentShaderFinal)
		// } else {
		// 	console.error("Shader program not compiled yet or material missing.")
		// }

		// material.onBeforeCompile = (shader) => {
		// 	// Save or log the raw GLSL source
		// 	console.log("Vertex Shader:", shader.vertexShader)
		// 	console.log("Fragment Shader:", shader.fragmentShader)

		// 	// Optionally modify shader code here
		// 	// shader.vertexShader = shader.vertexShader.replace(...);
		// 	// shader.fragmentShader = shader.fragmentShader.replace(...);
		// }

		// this.renderer.compile(this.scene, this.camera)
		// console.log("material", material.vertexShader, material.fragmentShader)
		// this.rootGroup.children.forEach((child) => {
		// 	console.log('child', child)
		// 	if (child.isMesh) {
		// 		console.log("Mesh Name:", child.name)
		// 		console.log("Material:", child.material)
		// 		// console.log("Geometry:", child.geometry)
		// 		// console.log("Attributes:", child.geometry.attributes)
		// 	}
		// })
		// const headMesh = this.rootGroup.traverse(function (object) {
		// 	if (object.isMesh && object.name === "Head") {
		// 		return object
		// 	}
		// })
		// // const mesh = meshMap.get("Head")
		// console.log("Mesh:", headMesh)

		// // Get internal compiled program
		// const material = headMesh.material
		// console.log(material)
		// const program = this.renderer.properties.get(material).program
		// console.log("program", program)

		// // const vertexShader = program.vertexShader
		// const fragmentShader = program.fragmentShader

		// // console.log("Vertex Shader:", vertexShader)
		// console.log("Fragment Shader:", fragmentShader)
	}

	loadAndApplyMaterial(objloader, { name, path, material }) {
		return new Promise((resolve, reject) => {
			objloader.load(
				path,
				(obj) => {
					let mesh = null

					obj.traverse((child) => {
						if (child.isMesh) {
							child.material = material
							child.name = name
							mesh = child
						}
					})

					if (mesh) {
						resolve({ name, mesh })
					} else {
						reject(new Error(`No mesh found in ${path}`))
					}
				},
				undefined,
				reject
			)
		})
	}

	async loadHair() {
		const loader = new GLTFLoader(loadingManager)
		loader.load("/hair/hair.glb", (gltf) => {
			window.OPENHUMAN.gltf = gltf
			let scene = gltf.scene || gltf.scenes[0]
			let clips = gltf.animations || []
			this.loadContent(scene, clips)
		})
	}

	async loadGLTF() {
		const loader = new GLTFLoader(loadingManager)
		// /facetoy/facetoy.glb facecap_output.gltf
		loader.load("/facecap_output.gltf", (gltf) => {
			// window.OPENHUMAN.gltf = gltf
			// let scene = gltf.scene || gltf.scenes[0]
			// let clips = gltf.animations || []
			// this.loadContent(scene, clips)
			const mesh = gltf.scene.children[0]
			console.log("gltf", gltf)

			this.scene.add(mesh)

			this.mixer = new AnimationMixer(mesh)
			this.mixer.clipAction(gltf.animations[0]).play()

			// GUI
			// const head = mesh.getObjectByName("mesh_2")
			// const influences = head.morphTargetInfluences

			// const gui = new GUI()
			// gui.close()

			// for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
			// 	gui.add(influences, value, 0, 1, 0.01).name(key.replace("blendShape1.", "")).listen()
			// }
		})
	}

	loadContent(object, clips) {
		this.clear()

		object.updateMatrixWorld()
		const box = new Box3().setFromObject(object)
		const size = box.getSize(new Vector3()).length()
		const center = box.getCenter(new Vector3())

		this.controls.reset()
		console.log("center", center)
		console.log("size", size)

		object.position.x -= center.x
		object.position.y -= center.y
		object.position.z -= center.z

		this.controls.maxDistance = size * 10

		this.camera.near = size / 100
		this.camera.far = size * 100
		this.camera.setFocalLength(30)
		this.camera.updateProjectionMatrix()

		this.camera.position.copy(center)
		this.camera.position.x += size / 3.0
		this.camera.position.y -= size / 3.0
		this.camera.position.z += size * 2
		this.camera.lookAt(center)

		this.setCamera(this.camera)
		this.controls.saveState()

		this.scene.add(object)
		this.meshRoot = object

		this.state.punctualLights = true
		this.meshRoot.traverse((node) => {
			if (node.isLight) {
				this.state.punctualLights = false
			}
		})

		// this.addMeshHelpers(object)

		this.updateLights()
		// this.updateGUI()
		this.updateEnvironment()
		this.updateDisplay()
	}

	createPostProcessing() {
		this.composer = new EffectComposer(this.renderer)
		this.renderPass = new RenderPass(this.scene, this.camera)

		// this.postProcessing.bokehPass = new BokehPass(this.scene, this.camera, {
		// 	focus: this.state.bokehFocalDistance,
		// 	aperture: this.state.bokehAperture,
		// 	maxblur: this.state.bokehMaxBlur,
		// })

		this.composer.addPass(new RenderPass(this.scene, this.camera))
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

	updateBackground() {
		this.backgroundColor.set(this.state.bgColor)
	}

	logGLSL = false

	createGUI() {
		this.gui = new GUI()

		const displaceFolder = this.gui.addFolder("Display")
		displaceFolder
			.add(this, "logGLSL")
			.name("Log GLSL")
			.onChange((value) => {
				this.loadGLSLShader()
			})
		displaceFolder.close()
		const envBackgroundCtrl = displaceFolder.add(this.state, "background")
		envBackgroundCtrl.onChange(() => this.updateEnvironment())
		const autoRotateCtrl = displaceFolder.add(this.state, "autoRotate")
		autoRotateCtrl.onChange(() => this.updateDisplay())
		const bgColorCtrl = displaceFolder.addColor(this.state, "bgColor")
		bgColorCtrl.onChange(() => this.updateBackground())

		const envMapCtrl = displaceFolder
			.add(
				this.state,
				"environment",
				environments.map((env) => env.name)
			)
			.onChange(() => this.updateEnvironment())
		displaceFolder
			.add(this.state, "toneMapping", {
				Linear: LinearToneMapping,
				"ACES Filmic": ACESFilmicToneMapping,
			})
			.onChange(() => this.updateLights())
		displaceFolder
			.add(this.state, "exposure", 0.0, 5.0, 0.001)
			.name("Tone Mapping Exposure")
			.onChange(() => this.updateLights())
		// displaceFolder.add(this.guiParams, "showFace").onChange((visible) => {

		// Add helper visibility controls
		this.helperFolder = this.gui.addFolder("Helpers")
		this.helperFolder.close() // Close by default
		this.helperFolder.add(this.guiParams, "showAxes").onChange((visible) => {
			if (this.helpers.axes) this.helpers.axes.visible = visible
		})
		this.helperFolder.add(this.guiParams, "showBox").onChange((visible) => {
			if (this.helpers.box) this.helpers.box.visible = visible
		})
		this.helperFolder.add(this.guiParams, "showLightHelpers").onChange((visible) => {
			if (this.helpers.directLight) this.helpers.directLight.visible = visible
			if (this.helpers.ambient) this.helpers.ambient.visible = visible
			// if (this.helpers.frontLight) this.helpers.frontLight.visible = visible
			// if (this.helpers.backLight) this.helpers.backLight.visible = visible
			// if (this.helpers.point1) this.helpers.point1.visible = visible
			// if (this.helpers.point2) this.helpers.point2.visible = visible
		})

		// renderFolder.add(this.renderer, "gammaFactor", 0.0, 5.0, 0.01).name("Gamma Factor")
		// renderFolder.add(this.renderer, "gammaOutput").name("Gamma Output")
		// renderFolder.add(this.renderer, "physicallyCorrectLights").name("Physically Correct Lights")
		// renderFolder.add(this.renderer, "outputEncoding", 0, 5, 0.01).name("Output Encoding")
		// renderFolder.add(this.renderer, "premultipliedAlpha").name("Premultiplied Alpha")
		// renderFolder.add(this.renderer, "alpha").name("Alpha")
		// renderFolder.add(this.renderer, "antialias").name("Antialias")
		// renderFolder.add(this.renderer, "shadowMap.enabled").name("Shadow Map Enabled")
		// renderFolder.add(this.renderer, "shadowMap.type", 0, 5, 0.01).name("Shadow Map Type")
		// renderFolder.add(this.renderer, "shadowMap.autoUpdate").name("Shadow Map Auto Update")
		// renderFolder.add(this.renderer, "shadowMap.needsUpdate").name("Shadow Map Needs Update")
		// renderFolder.add(this.renderer, "shadowMap.type").name("Shadow Map Type")

		const loadFace = false
		if (loadFace) {
			const faceFolder = this.gui.addFolder("Face")
			faceFolder.close()
			faceFolder.addColor(this.face.material, "color").name("Color")
			faceFolder.add(this.face.material, "reflectivity", 0.0, 1.0, 0.0001).name("Reflectivity")
			faceFolder.add(this.face.material, "roughness", 0.0, 1.0, 0.0001).name("Roughness")
			faceFolder.add(this.face.material, "metalness", 0.0, 1.0, 0.0001).name("Metalness")
			faceFolder.add(this.face.material, "bumpScale", 0.0, 5.0, 0.01).name("Bump Scale")
			faceFolder.add(this.face.material, "specularIntensity", 0.0, 1.0, 0.0001).name("Specular Intensity")
			faceFolder.addColor(this.face.material, "specularColor", 0.0, 1.0, 0.0001).name("Specular Color")
			faceFolder.add(this.face.material, "displacementScale", 0.0, 5.0, 0.01).name("Displacement Scale")
			faceFolder.add(this.face.material, "displacementBias", -2.0, 2.0, 0.01).name("Displacement Bias")
			faceFolder.add(this.face.material, "envMapIntensity", 0.0, 5.0, 0.01).name("Env Map Intensity")
			faceFolder.add(this.face.material, "aoMapIntensity", 0.0, 5.0, 0.01).name("AO Map Intensity")
			faceFolder.add(this.face.material, "toneMapped").name("Tone Mapped")
			faceFolder.add(this.face.material, "clearcoat", 0.0, 1.0, 0.0001).name("Clearcoat")
			faceFolder.add(this.face.material, "clearcoatRoughness", 0.0, 1.0, 0.0001).name("Clearcoat Roughness")
			faceFolder.add(this.face.material, "ior", 1.0, 2.5, 0.01).name("Index of Refraction")
			faceFolder.add(this.face.material, "sheen", 0.0, 1.0, 0.01).name("Sheen")
			faceFolder.addColor(this.face.material, "sheenColor").name("Sheen Color")
			faceFolder.add(this.face.material, "sheenRoughness", 0.0, 1.0, 0.01).name("Sheen Roughness")
			faceFolder.add(this.face.material, "transmission", 0.0, 1.0, 0.01).name("Transmission")
			faceFolder.add(this.face.material, "thickness", 0.0, 5.0, 0.01).name("Thickness")
			faceFolder
				.add({ clearcoatNormalScale: 1.0 }, "clearcoatNormalScale", 0.0, 5.0, 0.01)
				.name("Clearcoat Normal Scale")
				.onChange((v) => {
					this.face.material.clearcoatNormalScale.set(v, v)
				})

			const eyeballFolder = this.gui.addFolder("Eyeball")
			eyeballFolder.close()
			eyeballFolder.addColor(this.eyeball.material, "color").name("Color")
			eyeballFolder.add(this.eyeball.material, "roughness", 0.0, 1.0, 0.0001).name("Roughness")
			eyeballFolder.add(this.eyeball.material, "metalness", 0.0, 1.0, 0.0001).name("Metalness")
			eyeballFolder.add(this.eyeball.material, "bumpScale", 0.0, 5.0, 0.01).name("Bump Scale")
			eyeballFolder.add(this.eyeball.material, "specularIntensity", 0.0, 1.0, 0.0001).name("Specular Intensity")
			eyeballFolder.addColor(this.eyeball.material, "specularColor", 0.0, 1.0, 0.0001).name("Specular Color")
			eyeballFolder.add(this.eyeball.material, "displacementScale", 0.0, 5.0, 0.01).name("Displacement Scale")
			eyeballFolder.add(this.eyeball.material, "displacementBias", -2.0, 2.0, 0.01).name("Displacement Bias")
			eyeballFolder.add(this.eyeball.material, "envMapIntensity", 0.0, 5.0, 0.01).name("Env Map Intensity")
			eyeballFolder.add(this.eyeball.material, "aoMapIntensity", 0.0, 5.0, 0.01).name("AO Map Intensity")
			eyeballFolder.add(this.eyeball.material, "toneMapped").name("Tone Mapped")
			eyeballFolder.add(this.eyeball.material, "clearcoat", 0.0, 1.0, 0.0001).name("Clearcoat")
			eyeballFolder.add(this.eyeball.material, "clearcoatRoughness", 0.0, 1.0, 0.0001).name("Clearcoat Roughness")
			eyeballFolder.add(this.eyeball.material, "ior", 1.0, 2.5, 0.01).name("Index of Refraction")
			eyeballFolder.add(this.eyeball.material, "sheen", 0.0, 1.0, 0.01).name("Sheen")
			eyeballFolder.addColor(this.eyeball.material, "sheenColor").name("Sheen Color")
			eyeballFolder.add(this.eyeball.material, "sheenRoughness", 0.0, 1.0, 0.01).name("Sheen Roughness")
			eyeballFolder.add(this.eyeball.material, "transmission", 0.0, 1.0, 0.01).name("Transmission")
			eyeballFolder.add(this.eyeball.material, "thickness", 0.0, 5.0, 0.01).name("Thickness")
			eyeballFolder
				.add({ clearcoatNormalScale: 1.0 }, "clearcoatNormalScale", 0.0, 5.0, 0.01)
				.name("Clearcoat Normal Scale")
				.onChange((v) => {
					this.eyeball.material.clearcoatNormalScale.set(v, v)
				})

			const lensFolder = this.gui.addFolder("Lens")
			lensFolder.close()
			lensFolder.addColor(this.lens.material, "color").name("Color")
			lensFolder.add(this.lens.material, "opacity", 0.0, 1.0, 0.0001).name("Opacity")
			lensFolder.add(this.lens.material, "roughness", 0.0, 1.0, 0.0001).name("Roughness")
			lensFolder.add(this.lens.material, "metalness", 0.0, 1.0, 0.0001).name("Metalness")
			lensFolder.add(this.lens.material, "bumpScale", 0.0, 5.0, 0.01).name("Bump Scale")
			lensFolder.add(this.lens.material, "specularIntensity", 0.0, 1.0, 0.0001).name("Specular Intensity")
			lensFolder.addColor(this.lens.material, "specularColor", 0.0, 1.0, 0.0001).name("Specular Color")
			lensFolder.add(this.lens.material, "displacementScale", 0.0, 5.0, 0.01).name("Displacement Scale")
			lensFolder.add(this.lens.material, "displacementBias", -2.0, 2.0, 0.01).name("Displacement Bias")
			lensFolder.add(this.lens.material, "envMapIntensity", 0.0, 5.0, 0.01).name("Env Map Intensity")
			lensFolder.add(this.lens.material, "aoMapIntensity", 0.0, 5.0, 0.01).name("AO Map Intensity")
			lensFolder.add(this.lens.material, "toneMapped").name("Tone Mapped")
			lensFolder.add(this.lens.material, "clearcoat", 0.0, 1.0, 0.0001).name("Clearcoat")
			lensFolder.add(this.lens.material, "clearcoatRoughness", 0.0, 1.0, 0.0001).name("Clearcoat Roughness")
			lensFolder.add(this.lens.material, "ior", 1.0, 2.5, 0.01).name("Index of Refraction")
			lensFolder.add(this.lens.material, "sheen", 0.0, 1.0, 0.01).name("Sheen")
			lensFolder.addColor(this.lens.material, "sheenColor").name("Sheen Color")
			lensFolder.add(this.lens.material, "sheenRoughness", 0.0, 1.0, 0.01).name("Sheen Roughness")
			lensFolder.add(this.lens.material, "transmission", 0.0, 1.0, 0.01).name("Transmission")
			lensFolder.add(this.lens.material, "thickness", 0.0, 5.0, 0.01).name("Thickness")
			lensFolder
				.add({ clearcoatNormalScale: 1.0 }, "clearcoatNormalScale", 0.0, 5.0, 0.01)
				.name("Clearcoat Normal Scale")
				.onChange((v) => {
					this.lens.material.clearcoatNormalScale.set(v, v)
				})
		}

		// Ambient Light controls
		const ambientFolder = this.gui.addFolder("Ambient Light")
		ambientFolder.close() // Close by default
		ambientFolder.add(this.lights.ambient, "intensity", 0, 2).name("Intensity")
		ambientFolder.addColor(this.lights.ambient, "color").name("Color")
		ambientFolder.add(this.lights.ambient.position, "x", -100, 100).name("Position X")
		ambientFolder.add(this.lights.ambient.position, "y", -100, 100).name("Position Y")
		ambientFolder.add(this.lights.ambient.position, "z", -100, 100).name("Position Z")

		// Direct Light controls
		const directLightFolder = this.gui.addFolder("Direct Light")
		directLightFolder.close() // Close by default
		directLightFolder.add(this.lights.direct, "intensity", 0, 100, 0.01).name("Intensity")
		directLightFolder.addColor(this.lights.direct, "color").name("Color")
		directLightFolder.add(this.lights.direct.position, "x", -100, 100, 0.01).name("Position X")
		directLightFolder.add(this.lights.direct.position, "y", -100, 100, 0.01).name("Position Y")
		directLightFolder.add(this.lights.direct.position, "z", -100, 100, 0.01).name("Position Z")

		directLightFolder.add(this.lights.direct.rotation, "x", -Math.PI, Math.PI, 0.01).name("Rotation X")
		directLightFolder.add(this.lights.direct.rotation, "y", -Math.PI, Math.PI, 0.01).name("Rotation Y")
		directLightFolder.add(this.lights.direct.rotation, "z", -Math.PI, Math.PI, 0.01).name("Rotation Z")

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
		cameraFolder.add(this.camera.position, "x", -300, 300, 0.1).name("Position X")
		cameraFolder.add(this.camera.position, "y", -300, 300, 0.1).name("Position Y")
		cameraFolder.add(this.camera.position, "z", -300, 300, 0.1).name("Position Z")

		// const cameraParams = {
		// 	x:
		// }
		// console.log("object", this.camera.rotation)
		cameraFolder
			.add(this.camera.rotation, "_x", -Math.PI, Math.PI, 0.01)
			.name("Rotate X")
			.onChange((value) => {
				// this.controls.enabled = false
				console.log("object", this.camera.rotation, this.camera.rotation._x, value)
				this.camera.rotation.x = value
				// this.controls.enabled = true
				// this.controls.update()
				// console.log("this.controls.target", this.controls.target)
				// this.controls.target.x = value
				// this.controls.target.set(10, 20, 0)
			})

		cameraFolder
			.add(this.camera.rotation, "y", -Math.PI, Math.PI, 0.01)
			.name("Rotate Y")
			.onChange((value) => {
				this.controls.enabled = false
				this.camera.rotation.y = value
				this.camera.updateProjectionMatrix()
				this.controls.enabled = true
			})

		cameraFolder
			.add(this.camera.rotation, "z", -Math.PI, Math.PI, 0.01)
			.name("Rotate Z")
			.onChange((value) => {
				this.controls.enabled = false
				this.camera.rotation.z = value
				this.camera.updateProjectionMatrix()
				this.controls.enabled = true
			})

		cameraFolder
			.add(this.camera, "fov", 10, 120)
			.name("FOV")
			.onChange(() => {
				this.camera.updateProjectionMatrix()
			})
		const focalLengthController = cameraFolder
			.add(this.state, "focalLength", 5, 100)
			.name("Focal Length (mm)")
			.onChange((value) => {
				this.camera.setFocalLength(value)
				this.camera.updateProjectionMatrix()
			})
		// cameraFolder
		// 	.add(this.camera, "fov", 10, 120)
		// 	.name("FOV")
		// 	.onChange(() => {
		// 		focalLengthController.setValue(camera.getFocalLength())
		// 	})
		// cameraFolder.add(this.cameraParams.focalLength, "focalLength", -100, 100, 0.01).name("focalLength")
		cameraFolder.close()

		const postprocessFolder = this.gui.addFolder("PostProcessing")
		postprocessFolder.close()
		postprocessFolder
			.add(this.state, "bokeh")
			.name("Enable Bokeh")
			.onChange((enabled) => {
				if (enabled) {
					this.composer.addPass(this.postProcessing.bokehPass)
				} else {
					this.composer.removePass(this.postProcessing.bokehPass)
				}
			})
		// console.log("this.postProcessing.bokehPass", this.postProcessing.bokehPass)
		postprocessFolder
			.add(this.state, "bokehFocalLength", 0.0, 100.0, 0.01)
			.name("Bokeh Focal Distance")
			.onChange((value) => {
				this.postProcessing.bokehPass.materialBokeh.uniforms["focus"].value = value
			})
		// postprocessFolder
		// 	.add(this.state, "bokehFocalDistance", 0.0, 100.0, 0.01)
		// 	.name("Bokeh Focal Distance")
		// 	.onChange((value) => {
		// 		this.state.bokehFocalDistance = value
		// 	})
		postprocessFolder
			.add(this.state, "bokehAperture", 0.0, 100.0, 0.01)
			.name("Bokeh Aperture")
			.onChange((value) => {
				this.state.bokehAperture = value
			})
		postprocessFolder
			.add(this.state, "bokehMaxBlur", 0.0, 100.0, 0.01)
			.name("Bokeh Max Blur")
			.onChange((value) => {
				this.state.bokehMaxBlur = value
			})
		// maxblur: this.state.bokehMaxBlur,
		// postprocessFolder
		// 	.add(this.state, "bloom")
		// 	.name("Bloom")
		// 	.onChange(() => {
		// 		if (this.state.bloom) {
		// 			this.composer.addPass(bloomPass)
		// 		} else {
		// 			this.composer.removePass(bloomPass)
		// 		}
		// 	})
		// postprocessFolder
		// 	.add(this.state, "film")
		// 	.name("Film")
		// 	.onChange(() => {
		// 		if (this.state.film) {
		// 			this.composer.addPass(filmPass)
		// 		} else {
		// 			this.composer.removePass(filmPass)
		// 		}
		// 	})
		// postprocessFolder
		// 	.add(this.state, "dotScreen")
		// 	.name("Dot Screen")
		// 	.onChange(() => {
		// 		if (this.state.dotScreen) {
		// 			this.composer.addPass(dotScreenPass)
		// 		} else {
		// 			this.composer.removePass(dotScreenPass)
		// 		}
		// 	})

		// this.morphTargetFolder = this.gui.addFolder("Morph Targets")
		// this.morphTargetFolder.close()

		this.meshFolder = this.gui.addFolder("Mesh")
		this.meshFolder.close()
		// this.gui.close()

		const skeletonFolder = this.gui.addFolder("Skeleton")
		skeletonFolder.close()
		skeletonFolder.add(this.sizing, "halfHeight", -10, 10, 0.01).name("halfHeight")
		skeletonFolder.add(this.sizing, "segmentHeight", -10, 10, 0.01).name("segmentHeight")
		skeletonFolder.add(this.sizing, "segments", -10, 10, 0.01).name("segments")
	}

	addHelpers() {
		// this.helpers.directLight = new PointLightHelper(this.lights.direct, 15)
		// this.scene.add(this.helpers.directLight)
		// this.helpers.directLight.visible = false
		// this.helpers.ambient = new PointLightHelper(this.lights.ambient, 15)
		// this.scene.add(this.helpers.ambient)
		// this.helpers.ambient.visible = false
		this.helpers.directLight = new DirectionalLightHelper(this.lights.direct, 5)
		this.scene.add(this.helpers.directLight)
		this.helpers.directLight.visible = true

		this.helpers.grid = new GridHelper(400, 40, 0x0000ff, 0x808080)
		this.helpers.grid.position.y = -150
		this.helpers.grid.position.x = -150
		this.helpers.grid.visible = false
		this.scene.add(this.helpers.grid)
		// this.helperFolder.add(this.guiParams, "showGrid").onChange((visible) => {
		// 	if (this.helpers.grid) this.helpers.grid.visible = visible
		// })

		// const polarGridHelper = new PolarGridHelper(200, 16, 8, 64, 0x0000ff, 0x808080)
		// polarGridHelper.position.y = -150
		// polarGridHelper.position.x = 200
		// this.scene.add(polarGridHelper)
	}

	addMeshHelpers(target) {
		target.traverse((node) => {
			if (node.isMesh && node.name === "Head") {
				// console.log("node", node, node.geometry)
				const mesh = node
				this.helpers.box = new BoxHelper(mesh)
				this.scene.add(this.helpers.box)
				this.helpers.box.visible = true

				this.helpers.axes = new AxesHelper(10)
				this.scene.add(this.helpers.axes)
				this.helpers.axes.visible = true

				node.geometry.computeTangents()
				this.helpers.vnh = new VertexNormalsHelper(mesh, 0.2)
				this.scene.add(this.helpers.vnh)
				this.helpers.vnh.visible = false

				this.helpers.vth = new VertexTangentsHelper(mesh, 0.09)
				this.scene.add(this.helpers.vth)
				this.helpers.vth.visible = false

				this.guiParams = {
					vnh: false,
					vth: false,
				}

				this.helperFolder
					.add(this.guiParams, "vnh")
					.name("Vertex Normals Helper")
					.onChange((visible) => {
						if (this.helpers.vnh) this.helpers.vnh.visible = visible
					})
				this.helperFolder
					.add(this.guiParams, "vth")
					.name("Vertex Normals Helper")
					.onChange((visible) => {
						if (this.helpers.vth) this.helpers.vth.visible = visible
					})

				this.helpers.skeleton = new SkeletonHelper(mesh)
				this.scene.add(this.helpers.skeleton)

				// const newMesh = mesh.geometry.clone()
				// const wireframe = new WireframeGeometry(newMesh)
				// let line = new LineSegments(wireframe)
				// line.material.depthTest = false
				// line.material.opacity = 0.25
				// line.material.transparent = true
				// line.position.x = 4
				// this.scene.add(line)
				// this.scene.add(new BoxHelper(line))

				this.meshFolder.add(target.position, "x", -20, 20, 0.01).name("Position X")
				this.meshFolder.add(target.position, "y", -50, 50, 0.1).name("Position Y")
				this.meshFolder.add(target.position, "z", -50, 50, 0.1).name("Position Z")

				this.meshFolder.add(target.scale, "x", -20, 20, 0.01).name("Scale X")
				this.meshFolder.add(target.scale, "y", -50, 50, 0.1).name("Scale Y")
				this.meshFolder.add(target.scale, "z", -50, 50, 0.1).name("Scale Z")
			}
		})
	}

	updateDisplay() {
		this.controls.autoRotate = this.state.autoRotate
	}

	updateEnvironment() {
		const environment = environments.filter((entry) => entry.name === this.state.environment)[0]
		// console.log("updateEnvironment", environment)
		this.getEnvironmentTexture(environment).then(({ envMap }) => {
			this.scene.environment = envMap
			this.scene.background = this.state.background ? envMap : this.backgroundColor
		})
	}

	getEnvironmentTexture(environment) {
		const { id, path } = environment
		// neutral (RoomEnvironment)
		// if (id === "neutral") {
		// 	return Promise.resolve({ envMap: this.neutralEnvironment })
		// }
		// console.log("getEnvironmentTexture", environment)
		// none
		if (id === "") {
			return Promise.resolve({ envMap: null })
		}

		return new Promise((resolve, reject) => {
			new EXRLoader().load(
				path,
				(texture) => {
					const envMap = this.pmremGenerator.fromEquirectangular(texture).texture
					this.pmremGenerator.dispose()

					resolve({ envMap })
				},
				undefined,
				reject
			)
		})
	}

	updateLights() {
		const state = this.state
		this.renderer.toneMapping = Number(state.toneMapping)
		// console.log("exposure", state.exposure)
		this.renderer.toneMappingExposure = Math.pow(2, state.exposure)

		// this.renderer.toneMapping = Number(ACESFilmicToneMapping)
		// this.renderer.toneMappingExposure = Math.pow(2, 0.23)

		this.lights.ambient.intensity = state.ambientIntensity
		this.lights.ambient.color.set(state.ambientColor)

		this.lights.direct.intensity = state.directIntensity
		this.lights.direct.color.set(state.directColor)
	}

	setCamera(name) {
		this.controls.enabled = true
		this.activeCamera = this.defaultCamera
	}

	clear() {
		if (!this.meshRoot) return

		this.scene.remove(this.meshRoot)

		// dispose geometry
		this.meshRoot.traverse((node) => {
			if (!node.geometry) return

			node.geometry.dispose()
		})

		// dispose textures
		this.traverseMaterials(this.content, (material) => {
			for (const key in material) {
				if (key !== "envMap" && material[key] && material[key].isTexture) {
					material[key].dispose()
				}
			}
		})
	}

	traverseMaterials(object, callback) {
		object.traverse((node) => {
			if (!node.geometry) return
			const materials = Array.isArray(node.material) ? node.material : [node.material]
			materials.forEach(callback)
		})
	}

	render() {
		const delta = this.clock.getDelta()

		this.transformControl.update()

		if (this.mixer) {
			this.mixer.update(delta)
		}

		const time = -this.clock.getElapsedTime() * 0.0003

		// if (this.vnh) this.vnh.update()
		// if (this.vth) this.vth.update()
		// console.log(this.mouseX, this.mouseY)

		// // Rotate the cube
		// this.cube.rotation.x += 0.01
		// this.cube.rotation.y += 0.01
		if (this.skeleton) {
			this.skeleton.bones[0].rotation.x = Math.sin(Date.now() * 0.001) * 0.3
			this.skeleton.bones[1].rotation.x = Math.sin(Date.now() * 0.001 + 1) * 0.5
		}

		this.controls.update()
		if (this.controls) {
		}

		// if (this.state.postProcessing) {
		// 	this.composer.render()
		// } else {
		// }
		this.renderer.render(this.scene, this.camera)
	}
}

// Initialize the app
const app = new App()
