npm install -g @gltf-transform/cli

gltf-transform inspect facecap.gltf


gltf-pipeline -i facecap.glb -o facecap.gltf --json



./basisu -ktx2 -decode my_texture.ktx2

ktx-uninstall


ktx extract image baseColor.ktx2 baseColorOutput.png



gltf-transform copy facetoy.glb facetoy.gltf --format
gltf-pipeline -i facetoy.glb -o facetoy.gltf

gltf-pipeline -i facetoy.gltf -t
