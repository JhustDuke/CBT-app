// export const downloadImage = async function (
// 	imageFile: string,
// 	phone?: string
// ) {
// 	if (!imageFile) {
// 		console.log("[downloadImage] imageFile not provided, returning early");
// 		throw new Error("imageFile not found or given");
// 	}

// 	const byteString = atob(imageFile);
// 	const byteArray = new Uint8Array(byteString.length);

// 	for (let i = 0; i < byteString.length; i++) {
// 		byteArray[i] = byteString.charCodeAt(i);
// 	}

// 	const blob = new Blob([byteArray], { type: "image/png" });
// 	const blobUrl = URL.createObjectURL(blob);

// 	let fileName = "image";
// 	if (phone && phone.trim().length > 0) {
// 		fileName = phone;
// 	}

// 	try {
// 		// Start the download
// 		const downloadId = await browser.downloads.download({
// 			url: blobUrl,
// 			filename: fileName + ".png",
// 			saveAs: true,
// 			conflictAction: "uniquify",
// 		});

// 		// Listen for completion or cancellation
// 		const handleChanged = function (
// 			delta: Partial<browser.downloads.DownloadItem>
// 		) {
// 			if (delta.id !== downloadId) return;

// 			if (delta.state === "complete") {
// 				console.log(`[downloadListener] download ${downloadId} completed`);
// 				browser.downloads.onChanged.removeListener(handleChanged as any);
// 				URL.revokeObjectURL(blobUrl); // safe to revoke here
// 			} else if (delta.state === "interrupted") {
// 				console.log(`[downloadListener] download ${downloadId} cancelled`);
// 				browser.downloads.onChanged.removeListener(handleChanged as any);
// 				URL.revokeObjectURL(blobUrl);
// 				throw new Error("Download cancelled");
// 			}
// 		};

// 		browser.downloads.onChanged.addListener(handleChanged as any);

// 		return { status: true };
// 	} catch (err: any) {
// 		console.error(`[downloadImage] error: ${err.message || "Download failed"}`);
// 		throw new Error(err.message || "Download failed");
// 	}
// };

export const downloadImage = async function (blob: Blob, phone?: string) {
	if (!blob) {
		console.log("[downloadImage] blob not provided, returning early");
		throw new Error("Blob not found or given");
	}

	const blobUrl = URL.createObjectURL(blob);

	let fileName = "image";
	if (phone && phone.trim().length > 0) {
		fileName = phone;
	}

	try {
		const downloadId = await browser.downloads.download({
			url: blobUrl,
			filename: fileName + ".png",
			saveAs: true,
			conflictAction: "uniquify",
		});

		const handleChanged = function (
			delta: Partial<browser.downloads.DownloadItem>
		) {
			if (delta.id !== downloadId) return;

			if (delta.state === "complete") {
				console.log(`[downloadListener] download ${downloadId} completed`);
				browser.downloads.onChanged.removeListener(handleChanged as any);
				URL.revokeObjectURL(blobUrl); // safe to revoke here
			} else if (delta.state === "interrupted") {
				console.log(`[downloadListener] download ${downloadId} cancelled`);
				browser.downloads.onChanged.removeListener(handleChanged as any);
				URL.revokeObjectURL(blobUrl);
				throw new Error("Download cancelled");
			}
		};

		browser.downloads.onChanged.addListener(handleChanged as any);

		return { status: true };
	} catch (err: any) {
		console.error(`[downloadImage] error: ${err.message || "Download failed"}`);
		URL.revokeObjectURL(blobUrl);
		throw new Error(err.message || "Download failed");
	}
};
