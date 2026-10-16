import { UpdateEnrolStatusPayloadInterface } from "../../interfaces";
import { emitCustomEvent } from "../../utils";
import { CustomEvents } from "../customEvents";
import { actionModalStore } from "./actionModalStore";
import { modal_ids } from "./modal_ids";

export function wireModalEvents(
	modal: HTMLElement,
	updateCallback?: () => void
): void {
	const elems = modal_ids(modal);

	const missingElems: string[] = [];
	for (const key in elems) {
		if (!elems[key as keyof typeof elems]) missingElems.push(key);
	}
	if (missingElems.length > 0) {
		console.warn(
			"[wireModalEvents] missing required elements:",
			missingElems.join(", ")
		);
		return;
	}

	const submitBtn = elems.submitBtn as HTMLButtonElement;
	const closeBtn = elems.closeBtn as HTMLButtonElement;
	const selectEl = elems.selectEl as HTMLSelectElement;
	const errorReasonInput = elems.errorReasonInput as HTMLInputElement;
	const errorText = elems.errorText as HTMLElement;
	const downloadBtn = elems.downloadBtn as HTMLButtonElement;
	const prevBtn = elems.prevBtn as HTMLButtonElement;
	const nextBtn = elems.nextBtn as HTMLButtonElement;

	// Submit btn
	submitBtn.addEventListener("click", function () {
		const selectedValue = selectEl.value; // "error" | "success"

		//backend expects completed or error so
		//this changes the value to correspond to that
		const registrationStatus =
			selectedValue === "success" ? "completed" : "error";

		const registrationMessage =
			registrationStatus === "error"
				? errorReasonInput.value.trim()
				: "success";

		//the phoneNumber is the active payload number set by the cs
		//at dataLoaded
		const phoneNumber = actionModalStore.getPhoneNumber();

		//this is consume by the cs script
		emitCustomEvent({
			eventName: CustomEvents.onRegistrationStatusEmit,
			payload: {
				phoneNumber,
				registrationStatus,
				registrationMessage,
			},
		});
		modal.style.display = "none";
	});

	//close btn
	closeBtn.addEventListener("click", function () {
		modal.style.display = "none";
	});

	// Status select
	selectEl.addEventListener("change", function () {
		const isError = selectEl.value === "error";
		errorReasonInput.classList.toggle("d-none", !isError);
		errorText.classList.toggle("d-none", !isError);
		submitBtn.disabled = isError;
	});

	// Error reason input
	errorReasonInput.addEventListener("input", function () {
		const isValid = errorReasonInput.value.trim().length >= 5;
		submitBtn.disabled = !isValid;
		errorText.classList.toggle("d-none", isValid);
	});

	//Download button
	downloadBtn.addEventListener("click", function () {
		if (
			!actionModalStore.getPreparedDownloadImage() ||
			!actionModalStore.getPhoneNumber()
		) {
			console.error("[downloadBtn] blocked: state incomplete");
			return;
		}
		emitCustomEvent({
			eventName: CustomEvents.initDownload,
			payload: {
				imageFile: actionModalStore.getPreparedDownloadImage(),
				phone: actionModalStore.getPhoneNumber(),
			},
		});
		console.log("[downloadBtn] download event emitted");

		//updateCallBack here and in other places simply forces the updateModalDom to rerender
		if (updateCallback) updateCallback();
	});

	// Prev & Next buttons
	prevBtn.addEventListener("click", function () {
		emitCustomEvent({ eventName: CustomEvents.getPrev });
		console.log("[prevBtn] prev event emitted");
		handlePrevCounter();
		updateCallback?.();
	});
	nextBtn.addEventListener("click", function () {
		emitCustomEvent({ eventName: CustomEvents.getNext });
		console.log("[nextBtn] next event emitted");
		handleNextCounter();
		updateCallback?.();
	});
}

function handleNextCounter() {
	actionModalStore.incrementStepsBackward("handleNextCounter");
	console.log("stepsFF", actionModalStore.getStepsForward());

	if (actionModalStore.getStepsForward() > 0) {
		actionModalStore.reduceStepsForward("handleNext");
	}
}

function handlePrevCounter() {
	actionModalStore.incrementStepsForward("handlePrevCounter");
	console.log("stepsBB", actionModalStore.getStepsBackward());

	if (actionModalStore.getStepsBackward() > 0)
		actionModalStore.reduceStepsBackward("handlePrev");
}
