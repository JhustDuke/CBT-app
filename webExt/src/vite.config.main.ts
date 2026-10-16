import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
	root: "src",
	publicDir: resolve(__dirname, "public"),

	build: {
		outDir: "../dist",
		emptyOutDir: false,
		sourcemap: false,
		rollupOptions: {
			input: {
				background: resolve(__dirname, "src/backgroundScript/background.ts"),

				popup: resolve(__dirname, "src/popupScript/popup.ts"),
			},
			output: {
				entryFileNames: "[name].js",
			},
		},
	},
});
