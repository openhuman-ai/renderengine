
# RenderEngine — Project Context & Migration Roadmap

This document summarizes the current repository, goals, and a concrete incremental plan to migrate from the embedded Three-like code to a purpose-built, pure WebGL renderer while keeping the existing ThreeJS-style interface during the transition.

**Project Goal**:
- **Primary:** Build an interactive digital human (face) using pure WebGL (no runtime ThreeJS dependency).
- **Staging approach:** Start with the current ThreeJS-style interface and structure, then progressively replace modules with custom implementations until ThreeJS-style code is no longer required.

**Current State (high level)**:
- **No external build-time or runtime dependency on ThreeJS**: the project contains Three-like source files in `src/` (many modules mirror ThreeJS APIs) so the codebase imports local modules such as `./core/BufferGeometry` and `./renderers/WebGLRenderer`.
- **Dev toolchain:** `vite` for `dev`/`build` (`package.json` scripts: `dev`, `build`, `preview`, `sitemap`).
- **Key entry points & assets:**
	- App entry: [src/main.js](src/main.js#L1)
	- Blendshape metadata: [blendshape.csv](blendshape.csv) and [blendshape.json](blendshape.json)
	- Models & textures: `/model/`, `public/` (HDRIs, exr, etc.)
	- Examples/tests: `test/`, `public/facetoy/`, `facetoy/`.

**Why keep Three-style imports during migration**:
- The codebase already uses a Three-like API shape (Scene, Camera, Mesh, Material, BufferGeometry, BufferAttribute, WebGLRenderer, AnimationMixer, etc.). By keeping the same module paths and method signatures while re-implementing internals, you can swap internal implementations incrementally with minimal changes to the app code.

**Target capabilities for the digital human**:
- Full FACS / ARKit-compatible blendshape mapping.
- Runtime morph animations with multiple blendshape mixing (simultaneous targets + keyframed animation + runtime blending from detection or capture).
- GPU-accelerated morphing and skinning for interactive performance.
- Support for GLTF/GLB models (loader or converter) and custom streaming of blendshape data.

**High-level migration roadmap (incremental, test-driven)**:

1) Stabilize surface API & abstraction layer (short-term)
- Create a minimal abstraction layer that exposes the subset of Three-like classes your app uses: `Scene`, `WebGLRenderer`, `PerspectiveCamera`, `Mesh`, `BufferGeometry`, `BufferAttribute`, `Material`, `AnimationMixer`.
- Keep current import paths (e.g., `src/core/BufferGeometry`) but implement the new, minimal internal code. This allows the app to continue importing the same modules.

2) Implement a custom `WebGLRenderer` (core rendering loop)
- Implement a small, robust WebGL2 renderer that handles program creation, attributes, uniforms, VAOs, draw calls, and framebuffer management.
- Provide the minimal hooks the app uses (setSize, setPixelRatio, setClearColor, setAnimationLoop, render, etc.).

3) Replace geometry & attribute implementations
- Implement `BufferAttribute`, `BufferGeometry`, typed-array management and upload to GPU.
- Keep the same API shape as the current modules so swapping is transparent.

4) Replace material & shader mapping
- Implement a `ShaderMaterial` and a small set of materials needed for the project (`MeshBasicMaterial`, `MeshStandardMaterial` or a simplified PBR).
- Provide a small shader library for physical-based shading and the custom skinning/morph pipelines.

5) Migrate loaders & textures
- Either adapt the existing local loader modules to produce geometry/attributes compatible with the new renderer or keep the working loaders and convert their output to the new internal geometry representation.

6) Implement morph/blendshape system (core feature)
- Support multiple blendshape targets and runtime mixing.
- Two approaches depending on scale:
	- Attribute morphs (GPU vertex attributes): good when the number of active morph targets per mesh is small (<= 8) and when meshes are not extremely large.
	- Texture-driven morphs: encode per-vertex deltas into RGBA float textures and sample in vertex shader. This scales to many blendshapes and reduces attribute count at the cost of setup complexity.
- Provide utilities to load blendshape delta data from `blendshape.json`/`blendshape.csv` or exported GLTF morph targets.
- Combine morph deltas with skinning: compute morphed positions first (or last depending on target pipeline) and then apply skinning matrices in the shader.

7) Implement animation system & FACS mapping
- Re-implement `AnimationMixer`, `AnimationClip`, and keyframe tracks as needed to drive morph weights and transforms.
- Create a mapping layer from ARKit/FACS indices to your blendshape target names (the repo already contains a mapping snippet in `README.md`).

8) Performance and correctness validation
- Port existing scenes to the new renderer and compare visuals and behaviour.
- Validate blendshape responses for a canonical set of expressions (smiles, brow raises, blinks, etc.). Use reference mappings in `blendshape.csv`/`blendshape.json`.

9) Remove Three-like compatibility shims
- Once every module in `src/` has a native implementation and tests are green, remove compatibility code and simplify the API to the pure-WebGL surface you want.

**Implementation notes & recommendations**:
- Use WebGL2 (float textures, VAOs, transform feedback if needed) — the project already targets modern browsers (Vite dev server).
- Prefer uploading morph deltas to textures if you have large numbers of blendshapes; use a small set of attribute morphs when targets are few.
- Keep the same import paths during migration: implement the new modules under the same filenames (e.g., `src/renderers/WebGLRenderer.js`) so the rest of the app keeps working.
- Reuse existing shader code where suitable (repo contains shader snippets under `src/jsm/shaders` and `src/test`), then refactor and centralize.
- Add unit/integration scenes in `test/` that exercise: morph mixing, skinning+morph interplay, and GLTF model rendering.

**Blendshape & FACS specifics**:
- The repo contains `blendshape.csv` and `blendshape.json`. Use these as canonical names and mapping guides for ARKit/FACS indices.
- For runtime mapping: create an object/map { arkitIndex: blendshapeName } and a function that applies an array of ARKit weights into the morph uniforms/attributes.

**Where to look in the repo**:
- App bootstrap: [src/main.js](src/main.js#L1)
- Blendshape tables: [blendshape.csv](blendshape.csv) and [blendshape.json](blendshape.json)
- Test shaders and GLSL helpers: [test/](test/)
- Public assets (HDRIs, EXR): [public/](public/)
- Vite config & scripts: [package.json](package.json#L1)

**Quick next steps I can do for you**:
- Produce a concrete incremental plan that lists exact small PR-sized tasks to replace modules one-by-one.
- Implement a minimal `WebGLRenderer` shim that matches the currently used subset of `WebGLRenderer` API so you can start swapping immediately.
- Implement a reference morph shader that demonstrates mixing N blendshapes using both attribute and texture approaches.

If you'd like, I can now generate the first concrete patch: a tiny `WebGLRenderer` shim (minimal features: `setSize`, `setPixelRatio`, `setClearColor`, `setAnimationLoop`, `render`) that you can progressively expand. Which next step should I take?

