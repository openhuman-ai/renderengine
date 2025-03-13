npm install -g @gltf-transform/cli

gltf-transform uncompress facecap.glb facecap.gltf

gltf-transform inspect facecap.gltf


gltf-pipeline -i facecap.glb -o facecap.gltf --json


gltf-transform cp facecap.gltf facecap_output.gltf
