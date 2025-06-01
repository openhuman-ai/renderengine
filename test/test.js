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
import { SkeletonHelper } from "../src/helpers/SkeletonHelper"
import { AmbientLight } from "@/lights/AmbientLight"
import { TextureLoader } from "@/loaders/TextureLoader"
import { MeshPhysicalMaterial } from "@/materials/MeshPhysicalMaterial"
import { BoxGeometry } from "@/geometries/BoxGeometry"
import { Mesh } from "@/objects/Mesh"
import { Color } from "@/math/Color"
import { RawShaderMaterial } from "@/materials/RawShaderMaterial"
import { ShaderMaterial } from "@/materials/ShaderMaterial"


// import vertexShader from "./vertex.glsl"
// import fragmentShader from "./fragment.glsl"
import vertexShader from "./vertex_full.glsl"
import fragmentShader from "./fragment_full.glsl"

class CubeRotateSample {
	gui
	cube
	// // uniforms
	// // scene
	// // camera
	// // renderer
	// // light


	constructor() {
		this.scene = new Scene()
		this.scene.background = new Color(0xffffff)
		this.camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
		this.camera.position.z = 3

		this.renderer = new WebGLRenderer({ antialias: true })
		this.renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(this.renderer.domElement)

		this.cube = null
		this.uniforms = {
			uTime: { value: 0 },
			uTexture: { value: null },
			uPosition: 0
		}
		this.animate = this.animate.bind(this)
		window.addEventListener("resize", () => this.onWindowResize())
	}

	init() {
		// this.addLights()
		// this.addCubeWithTexture()
		// this.animate()
		this.loadTexture().then((texture) => {
			this.uniforms.uTexture.value = texture
			this.addCube()
			this.animate()
			this.addGUI()
		})
	}

	loadTexture() {
		return new Promise((resolve) => {
			const loader = new TextureLoader()
			loader.load("https://threejs.org/examples/textures/uv_grid_opengl.jpg", resolve)
		})
	}

	addLights() {
		const directional = new DirectionalLight(0xffffff, 1.2) // brighter directional light
		directional.position.set(5, 5, 5)
		this.scene.add(directional)

		const ambient = new AmbientLight(0xffffff, 0.8) // brighter ambient light
		this.scene.add(ambient)
	}

	addCube() {
		const textureLoader = new TextureLoader()
		textureLoader.load("https://threejs.org/examples/textures/uv_grid_opengl.jpg", (texture) => {
			// const material = new MeshPhysicalMaterial({
			// 	map: texture,
			// 	metalness: 0.5,
			// 	roughness: 0.3,
			// 	clearcoat: 0.1,
			// 	reflectivity: 0.5,
			// })
			const geometry = new BoxGeometry(1, 1, 1)
			const material = new ShaderMaterial({
				vertexShader: vertexShader,
				fragmentShader: fragmentShader,
				uniforms: this.uniforms,
				defines: {
					USE_UV: false,
					USE_MAP: false,
					USE_NORMALMAP: false,
					USE_SKINNING: false, // Enable if using skinned meshes
					USE_MORPHTARGETS: false, // Enable if using morph targets
					USE_BATCHING: false, // Enable if using instanced/batched rendering
					// STANDARD: false,
				},
				side: DoubleSide,
			})

			this.cube = new Mesh(geometry, material)
			this.scene.add(this.cube)
		})
	}

	addGUI() {
		this.gui = new GUI()

		const displaceFolder = this.gui.addFolder("Display")
		displaceFolder.add(this.uniforms, "uPosition", 0, Math.PI * 2, 0.01).name("Position")
		displaceFolder.close()
	}

	animate() {
		requestAnimationFrame(this.animate)

		if (this.cube) {
			this.cube.rotation.x += 0.01
			this.cube.rotation.y += 0.01

			this.cube.updateMatrixWorld()
			// this.uniforms.modelMatrix.value = this.cube.matrixWorld
			// this.uniforms.modelViewMatrix.value = this.cube.modelViewMatrix
			// this.uniforms.normalMatrix.value = this.cube.normalMatrix
			// this.uniforms.projectionMatrix.value = this.camera.projectionMatrix
			// this.uniforms.viewMatrix.value = this.camera.matrixWorldInverse
		}

		this.renderer.render(this.scene, this.camera)
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight
		this.camera.updateProjectionMatrix()
		this.renderer.setSize(window.innerWidth, window.innerHeight)
	}
}

const cube = new CubeRotateSample()
cube.init()
