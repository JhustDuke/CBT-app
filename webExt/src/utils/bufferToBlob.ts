export function bufferToBlob(bufferObj: any): Blob {
	const uint8Array: Uint8Array = new Uint8Array(bufferObj.data);
	const blob: Blob = new Blob([uint8Array], { type: "image/png" });
	return blob;
}
