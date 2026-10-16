import { CustomEvents } from "../customEvents";
import { actionModalStore } from "./actionModalStore";
import { FormDataInterface } from "../../interfaces";
import { updateNavButtons, loadImageSafely, bufferToBlob } from "../../utils";

const spinner = `<div class="spinner-border" role="status">
	<span class="visually-hidden">Loading...</span>
</div>`;

export async function updateModalDom(modal_id: string) {
	const modal = document.getElementById(modal_id);
	if (!modal) return;

	const img = modal.querySelector<HTMLImageElement>("img");
	const downloadBtn =
		modal.querySelector<HTMLButtonElement>("#modalDownloadBtn");
	const counter = modal.querySelector<HTMLDivElement>("#ext-enrolCounter");

	if (!img || !downloadBtn || !counter) {
		console.log("updateModal missing required fields");
		return;
	}
	let currentObjectUrl: string | null = null;
	try {
		downloadBtn.disabled = true;
		downloadBtn.innerHTML = spinner;

		//the backend sends a buffer
		// the structure is different from browser blob
		//so it has to be turned into uint8Array
		const blob = bufferToBlob(actionModalStore.getImageBuffer());

		//this part of the code makes the image available
		//for transport to the bg
		//it is init by downloanBtn event in modalEvents file
		actionModalStore.setPreparedDownloadImage(blob, "updateModalDom");

		if (currentObjectUrl) {
			URL.revokeObjectURL(currentObjectUrl);
		}

		// ✅ Await safe image loading of the image to the image preview
		await loadImageSafely(img, blob);

		currentObjectUrl = img.src;

		downloadBtn.disabled = false;
		downloadBtn.innerHTML = "Download";
	} catch (err: any) {
		downloadBtn.disabled = false;
		downloadBtn.innerHTML = "Refetch data";
	}

	counter.textContent = `${actionModalStore.getStepsBackward()} / ${actionModalStore.getStepsForward()}`;
}

/* =========================
   THESE CUSTOM EVENTS ARE PLA
			HERE BECAUSE OF THE LIFECYCLE 
			IT INSTIGATED IN THE MODAL EVENTS
			AND BEING KEPT HERE HELPS UPDATE THE MODAL AS SOON
			THE EVENT IS FIRED
========================= */
document.addEventListener(
	CustomEvents.onRecieveNextEnrolData,
	function (e: Event) {
		const payload = (e as CustomEvent<IteratorResult<FormDataInterface>>)
			.detail;

		actionModalStore.setCanGoBack(true, "onRecievingEnrol");
		updateNavButtons(!payload.done, true);

		if (payload.done) {
			console.log("[onRecieveNextEnrol] no more data");
			return;
		}
	}
);

/* =========================
   Prev enrol data
========================= */
document.addEventListener(
	CustomEvents.onRecievePrevEnrolData,
	function (e: Event) {
		const payload = (e as CustomEvent<IteratorResult<FormDataInterface>>)
			.detail;

		updateNavButtons(true, !payload.done);

		if (payload.done) {
			console.log("[onRecievePrevEnrol] no more previous data");
			return;
		}
	}
);

/* =========================
THESE EVENT WHEN FIRED ENABLES/DISABLE THE NEXT/PREV
BTN ITS INSTIGATED FREOM  CS SCRIPT
========================= */
document.addEventListener(CustomEvents.disableNextBtn, function () {
	updateNavButtons(false, actionModalStore.getCanGoBack());
});

document.addEventListener(CustomEvents.disablePrevBtn, function () {
	updateNavButtons(true, false);
});
