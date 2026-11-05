import { defineConfig } from "vite";

export default defineConfig({
	root: ".",
	base: "./",
	build: {
		outDir: "dist",
		emptyOutDir: true,
		rollupOptions: {
			input: {
				main: "index.html",
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
});
