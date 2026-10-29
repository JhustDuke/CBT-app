import modalTemplate from "./modal.html?raw";
import { actionModalStore } from "./";

// every id used by the modal, so none are typed by hand elsewhere
const modalIds = {
	host: "ext-actionModal-host",
	overlay: "ext-actionModal",
	passportImage: "ext-passportImage",
	enrolCounter: "ext-enrolCounter",
	downloadImageButton: "modalDownloadBtn",
	statusSelect: "ext-statusSelect",
	errorReasonInput: "ext-errorReason",
	errorReasonText: "errorText",
	submitStatusButton: "ext-submitStatusBtn",
	closeModalButton: "ext-closeModalBtn",
	previousButton: "ext-prevBtn",
	nextButton: "ext-nextBtn",
} as const;

const MINIMUM_ERROR_REASON_LENGTH = 5;

// reads the store and fills the modal; call after anything that changes the store
function renderCurrentRecord(): void {
	const currentRecord = actionModalStore.getCurrentRecord();
	if (currentRecord === null) return;

	const enrolCounterElement = document.getElementById(modalIds.enrolCounter);
	const passportImageElement = document.getElementById(
		modalIds.passportImage
	) as HTMLImageElement | null;
	const previousButton = document.getElementById(
		modalIds.previousButton
	) as HTMLButtonElement | null;
	const nextButton = document.getElementById(
		modalIds.nextButton
	) as HTMLButtonElement | null;

	// counter e.g. "2 of 3"
	if (enrolCounterElement) {
		enrolCounterElement.textContent =
			actionModalStore.getCurrentRecordNumber() +
			" of " +
			actionModalStore.getTotalRecords();
	}

	// placeholder image for now, seeded by phone so each candidate gets a different one
	if (passportImageElement) {
		passportImageElement.src =
			"https://picsum.photos/seed/" + currentRecord.phone + "/200/250";
	}

	if (previousButton)
		previousButton.disabled = !actionModalStore.hasPreviousRecord();
	if (nextButton) nextButton.disabled = !actionModalStore.hasNextRecord();
}

// shows the reason input only for error status; submit stays disabled until the reason is long enough
// shows the reason input only for error status; submit stays disabled until the reason is long enough
function updateErrorReasonState(): void {
	const statusSelectElement = document.getElementById(
		modalIds.statusSelect
	) as HTMLSelectElement | null;
	const errorReasonInputElement = document.getElementById(
		modalIds.errorReasonInput
	) as HTMLInputElement | null;
	const errorReasonTextElement = document.getElementById(
		modalIds.errorReasonText
	);
	const submitStatusButtonElement = document.getElementById(
		modalIds.submitStatusButton
	) as HTMLButtonElement | null;

	if (
		!statusSelectElement ||
		!errorReasonInputElement ||
		!errorReasonTextElement ||
		!submitStatusButtonElement
	)
		return;

	const isErrorStatus = statusSelectElement.value === "error";
	errorReasonInputElement.style.display = isErrorStatus ? "block" : "none";

	// trim so spaces alone don't count
	const hasEnoughCharacters =
		errorReasonInputElement.value.trim().length >= MINIMUM_ERROR_REASON_LENGTH;

	if (isErrorStatus && !hasEnoughCharacters) {
		submitStatusButtonElement.disabled = true;
		submitStatusButtonElement.style.opacity = "0.5";
		submitStatusButtonElement.style.pointerEvents = "none";
		errorReasonTextElement.style.display = "block";
	} else {
		submitStatusButtonElement.disabled = false;
		submitStatusButtonElement.style.opacity = "1";
		submitStatusButtonElement.style.pointerEvents = "auto";
		errorReasonTextElement.style.display = "none";
	}
}

// the one function that refreshes the modal; everything else calls this
function updateModalUi(): void {
	renderCurrentRecord();
	updateErrorReasonState();
}

//adds the modal to the page, or shows it again if already added
export function showModal(): void {
	const modalContainer = document.getElementById(modalIds.host);

	if (modalContainer) {
		modalContainer.style.display = "block";
		updateModalUi();
		return;
	}

	const newModal = document.createElement("div");
	newModal.id = modalIds.host;
	newModal.innerHTML = modalTemplate;
	document.body.appendChild(newModal);

	updateModalUi();

	const closeModalButton = document.getElementById(modalIds.closeModalButton);
	closeModalButton?.addEventListener("click", function () {
		newModal.style.display = "none";
	});

	const previousButtonElement = document.getElementById(
		modalIds.previousButton
	);
	previousButtonElement?.addEventListener("click", function () {
		actionModalStore.goToPreviousRecord();
		updateModalUi();
	});

	const nextButtonElement = document.getElementById(modalIds.nextButton);
	nextButtonElement?.addEventListener("click", function () {
		actionModalStore.goToNextRecord();
		updateModalUi();
	});

	const statusSelectElement = document.getElementById(modalIds.statusSelect);
	statusSelectElement?.addEventListener("change", updateModalUi);

	const errorReasonInputElement = document.getElementById(
		modalIds.errorReasonInput
	);
	errorReasonInputElement?.addEventListener("input", updateModalUi);
}
