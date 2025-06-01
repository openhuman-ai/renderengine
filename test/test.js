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

class CubeRotateSample {
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
			// const material = new RawShaderMaterial({
			// 	map: texture,
			// 	metalness: 0.5,
			// 	roughness: 0.3,
			// 	clearcoat: 0.1,
			// 	reflectivity: 0.5,
			// })
			const geometry = new BoxGeometry(1, 1, 1)
			const material = new RawShaderMaterial({
				vertexShader: this.vertexShader(),
				fragmentShader: this.fragmentShader(),
				uniforms: this.uniforms,
				side: DoubleSide,
			})

			this.cube = new Mesh(geometry, material)
			this.scene.add(this.cube)
		})
	}

	vertexShader() {
		return `
      precision mediump float;

      uniform mat4 modelViewMatrix;
      uniform mat4 projectionMatrix;

      attribute vec3 position;
      attribute vec2 uv;

      varying vec2 vUv;

      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
	}

	fragmentShader() {
		return `
      precision mediump float;

      uniform float uTime;
      uniform sampler2D uTexture;

      varying vec2 vUv;

      void main() {
        vec4 texColor = texture2D(uTexture, vUv);
        gl_FragColor = vec4(texColor.rgb, 1.0);
      }
    `
	}

	animate() {
		requestAnimationFrame(this.animate)

		if (this.cube) {
			this.cube.rotation.x += 0.01
			this.cube.rotation.y += 0.01
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
