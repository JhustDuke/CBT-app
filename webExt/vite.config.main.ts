import { defineConfig } from "vite";
import type { Plugin } from "vite";
import { resolve, join } from "path";
import { readdirSync } from "fs";

function collectFilePathsRecursively(folderPath: string): string[] {
	const collectedFilePaths: string[] = [];
	const folderEntries = readdirSync(folderPath, { withFileTypes: true });

	for (let entryIndex = 0; entryIndex < folderEntries.length; entryIndex++) {
		const currentEntry = folderEntries[entryIndex];
		const entryFullPath = join(folderPath, currentEntry.name);

		if (currentEntry.isDirectory()) {
			const nestedFilePaths = collectFilePathsRecursively(entryFullPath);
			for (
				let nestedIndex = 0;
				nestedIndex < nestedFilePaths.length;
				nestedIndex++
			) {
				collectedFilePaths.push(nestedFilePaths[nestedIndex]);
			}
		} else {
			collectedFilePaths.push(entryFullPath);
		}
	}

	return collectedFilePaths;
}

function watchPublicFolderPlugin(publicFolderPath: string): Plugin {
	return {
		name: "watch-public-folder",
		buildStart: function () {
			//publicFilePaths e.g. c://.../public/popup.html
			const publicFilePaths = collectFilePathsRecursively(publicFolderPath);
			for (let fileIndex = 0; fileIndex < publicFilePaths.length; fileIndex++) {
				this.addWatchFile(publicFilePaths[fileIndex]);
			}
		},
	};
}

export default defineConfig({
	root: "src",
	publicDir: resolve(__dirname, "public"),
	plugins: [watchPublicFolderPlugin(resolve(__dirname, "public"))],

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
