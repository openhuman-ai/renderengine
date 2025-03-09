import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: "",
	publicDir: "public",
	base: "/",
	server: {
		open: true,
	},
	build: {
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
			},
		},
		assetsDir: "assets",
	},
})
