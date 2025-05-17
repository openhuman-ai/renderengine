
	async loadBrows(objloader, textureLoader) {
		objloader.load("/obj1/Brows.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = new MeshPhysicalMaterial({
				name: "Brows",
				color: new Color(0.0739023, 0.073903, 0.073903), // baseColorFactor RGB
				opacity: 0.721212, // baseColorFactor Alpha
				transparent: true, // alphaMode: "BLEND"
				side: DoubleSide, // doubleSided: true
				ior: 1.45, // KHR_materials_ior
				specularColor: new Color(2, 2, 2), // KHR_materials_specular
				transmission: 0, // set explicitly if not used
				metalness: 0, // default if not specified
				roughness: 1, // default if not specified
			})
			this.scene.add(mesh)
		})
	}

	async loadEyeWet(objloader, textureLoader) {
		objloader.load("/obj1/EyeWet.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = new MeshPhysicalMaterial({
				name: "Eye_Wet",
				color: new Color(0, 0, 0), // baseColorFactor RGB
				opacity: 0.1, // baseColorFactor Alpha
				transparent: true, // alphaMode: "BLEND"
				side: DoubleSide, // doubleSided: true
				roughness: 0.2030302882194519, // from pbrMetallicRoughness
				metalness: 0, // from pbrMetallicRoughness
				ior: 1.45, // KHR_materials_ior
				// Placeholder for specular texture (index 11)
				// You must assign the correct texture loaded from GLTF later:
				// specularMap: textures[11]
			})
			this.scene.add(mesh)
		})
	}

	async loadFace(objloader, textureLoader) {
		objloader.load("/obj1/Head.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			// mesh.castShadow = true
			// mesh.receiveShadow = true
			mesh.geometry.computeBoundingBox()
			const box = new Box3().setFromObject(mesh)
			const size = box.getSize(new Vector3()).length()
			const center = box.getCenter(new Vector3())

			mesh.position.x -= center.x
			mesh.position.y -= center.y
			mesh.position.z -= center.z

			mesh.material = new MeshPhysicalMaterial({
				name: "FaceMaterial",
				side: DoubleSide, // doubleSided: true
				metalness: 0, // from metallicFactor
				map: this.face.baseColor, // baseColorTexture (index 0)

				metalnessMap: this.face.roughness, // textures[2], // metallicRoughnessTexture (index 2)
				roughnessMap: this.face.roughness, // textures[2], // same texture as metalnessMap

				normalMap: this.face.normal, // textures[1], // normalTexture (index 1)
				normalScale: new Vector2(0.7, 0.7), // normalTexture scale

				// displacementMap: this.face.displacement,
				// displacementScale: 0.0001,
				// displacementBias: 0.0001,

				// Clearcoat extension
				clearcoat: 0.04848499968647957,
				clearcoatRoughness: 0.12393900007009506,
				clearcoatMap: this.face.roughness,

				// Specular extension
				specularIntensity: 1.0, // not directly in GLTF, adjust as needed
				specularIntensityMap: this.face.specular,
				specularColor: 0xffffff,
				specularColorMap: this.face.specular,
				// IOR extension
				ior: 1.45,
			})

			this.scene.add(mesh)
		})
	}

	async loadLashes(objloader, textureLoader) {
		objloader.load("/obj1/Lashes.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = new MeshPhysicalMaterial({
				name: "Lashes",
				color: new Color(0.0739023, 0.073903, 0.073903), // baseColorFactor RGB
				opacity: 0.721212, // baseColorFactor Alpha
				transparent: true, // alphaMode: "BLEND"
				side: DoubleSide, // doubleSided: true
				metalness: 1, // metallicFactor
				roughness: 1, // roughnessFactor
				ior: 1.45, // KHR_materials_ior
				specularColor: new Color(2, 2, 2), // KHR_materials_specular
				emissive: new Color(0, 0, 0), // emissiveFactor
			})
			this.scene.add(mesh)
		})
	}

	async loadLens(objloader, textureLoader) {
		let lenMaterial = new MeshPhysicalMaterial({
			name: "Lens",

			// PBR
			color: new Color(0.502883, 0.502887, 0.502887), // baseColorFactor RGB
			transparent: true, // because alphaMode: BLEND
			opacity: 0.1, // baseColorFactor Alpha
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
			// emissive: 0x000000,
		})

		objloader.load("/obj1/LensLeft.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)

			mesh.material = lenMaterial

			this.scene.add(mesh)
		})
		objloader.load("/obj1/LensRight.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = lenMaterial

			this.scene.add(mesh)
		})
	}
	async loadEyeball(objloader, textureLoader) {
		const eyeBallMaterial = new MeshPhysicalMaterial({
			name: "Realtime_Eyeball_Left",
			side: DoubleSide, // doubleSided: true
			metalness: 0, // metallicFactor: 0
			map: this.eyeball.baseColor, // textures[4], // baseColorTexture index 4
			metalnessMap: this.eyeball.roughness, // textures[6], // metallicRoughnessTexture index 6
			roughnessMap: this.eyeball.roughness, // textures[6], // same texture as metalnessMap
			normalMap: this.eyeball.normal, // textures[5], // normalTexture index 5
			// wireframe:true,

			displacementMap: this.eyeball.displacement,
			displacementScale: 0.0001,
			displacementBias: 0.0001,

			ior: 1.45, // KHR_materials_ior

			specularIntensity: 1.0, // not directly in GLTF, adjust as needed
			specularIntensityMap: this.eyeball.specular,
			specularColor: 0xffffff,
			specularColorMap: this.eyeball.specular,
		})
		objloader.load("/obj1/RealtimeEyeballLeft.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			mesh.castShadow = true
			mesh.receiveShadow = true
			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = eyeBallMaterial

			this.scene.add(mesh)
		})
		objloader.load("/obj1/RealtimeEyeballRight.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			mesh.castShadow = true
			mesh.receiveShadow = true
			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			// mesh.position.set(0, -0.24, 0)
			mesh.material = eyeBallMaterial

			this.scene.add(mesh)
		})
	}

	async loadTongue(objloader, textureLoader) {
		const eyeBallMaterial = new MeshPhysicalMaterial({
			name: "Tongue",
			side: DoubleSide, // doubleSided: true
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

		objloader.load("/obj1/Tongue.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			mesh.castShadow = true
			mesh.receiveShadow = true
			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = eyeBallMaterial

			this.scene.add(mesh)
		})
	}

	async loadTeeth(objloader, textureLoader) {
		const eyeBallMaterial = new MeshPhysicalMaterial({
			name: "Teeth",
			side: DoubleSide, // doubleSided: true
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
		objloader.load("/obj1/UpperTeeth.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			mesh.castShadow = true
			mesh.receiveShadow = true
			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = eyeBallMaterial

			this.scene.add(mesh)
		})
		objloader.load("/obj1/LowerTeeth.obj", (obj) => {
			const mesh = obj.children.find((child) => child.isMesh)
			if (!mesh) return

			mesh.castShadow = true
			mesh.receiveShadow = true
			// mesh.scale.set(1.5, 1.5, 1.5)
			mesh.position.set(0, -0.25, 0)
			mesh.material = eyeBallMaterial

			this.scene.add(mesh)
		})
	}
