/**
 * Safe image loader using await so image rendering does not fail.
 */
export function loadImageSafely(
	img: HTMLImageElement,
	blob: Blob
): Promise<void> {
	return new Promise((resolve, reject) => {
		const objectUrl: string = URL.createObjectURL(blob);

		img.onload = () => {
			URL.revokeObjectURL(objectUrl);
			resolve();
		};

		img.onerror = () => {
			URL.revokeObjectURL(objectUrl);
			reject(new Error("image failed to load"));
		};

		img.src = objectUrl;
	});
}
