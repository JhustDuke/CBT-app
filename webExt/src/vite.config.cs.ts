import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	root: "src",
	build: {
		outDir: "../dist",
		emptyOutDir: false,
		sourcemap: false,
		rollupOptions: {
			input: {
				contentScript: resolve(__dirname, "src/contentScript/contentScript.ts"),
			},
			output: {
				format: "iife",
				entryFileNames: "contentScript.js",
			},
		},
	},
});
