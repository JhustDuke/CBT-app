export const modal_ids = function (modal: HTMLElement) {
	return {
		submitBtn: modal.querySelector<HTMLButtonElement>("#ext-submitStatusBtn"),
		closeBtn: modal.querySelector<HTMLButtonElement>("#ext-closeModalBtn"),
		selectEl: modal.querySelector<HTMLSelectElement>("#ext-statusSelect"),
		errorReasonInput: modal.querySelector<HTMLInputElement>("#ext-errorReason"),
		errorText: modal.querySelector<HTMLElement>("#errorText"),
		downloadBtn: modal.querySelector<HTMLButtonElement>("#modalDownloadBtn"),
		img: modal.querySelector<HTMLImageElement>("img"),
		prevBtn: modal.querySelector<HTMLButtonElement>("#ext-prevBtn"),
		nextBtn: modal.querySelector<HTMLButtonElement>("#ext-nextBtn"),
		enrolCounter: modal.querySelector<HTMLElement>("#ext-enrolCounter"),
	};
};
