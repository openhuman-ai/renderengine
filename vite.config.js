import { resolve, dirname } from "path"
import { fileURLToPath } from "url"
import path from 'path';
import { defineConfig } from "vite"

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
	root: "",
	publicDir: "public",
	base: "/",
	server: {
		open: true,
	},
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"),
		},
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
