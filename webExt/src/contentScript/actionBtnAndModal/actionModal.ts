import modalTemplate from "./modal.html?raw";
import { oneTimeMsgFactory } from "xtension-messenger";
import { actionModalStore } from "./";
import { notifyToast, messageType } from "../../utils";

// every id used by the modal, so none are typed by hand elsewhere
const modalIds = {
	host: "ext-actionModal-host",
	overlay: "ext-actionModal",
	card: "ext-actionModalCard",
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

let isWaitingForBg = false;

// the modal's own line to bg, it lives in the content script
const actionModalInCs = oneTimeMsgFactory("cs");

// reads the store and fills the modal; call after anything that changes the store
const renderCurrentRecord = function (): void {
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
};

// shows the reason input only for error status; submit stays disabled until the reason is long enough
const updateErrorReasonState = function (): void {
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
};

// the one function that refreshes the modal; everything else calls this
const updateModalUi = function (): void {
	renderCurrentRecord();
	updateErrorReasonState();

	// while waiting for bg, the whole card ignores the mouse; removed again when bg replies
	const modalCardElement = document.getElementById(modalIds.host);
	if (modalCardElement) {
		if (isWaitingForBg) {
			modalCardElement.style.setProperty("pointer-events", "none", "important");
			modalCardElement.style.opacity = "0.6";
		} else {
			modalCardElement.style.removeProperty("pointer-events");
			modalCardElement.style.opacity = "1";
		}
	}
};

const closeModal = function (modalElement: HTMLElement): void {
	modalElement.style.display = "none";
};

const navigatePreviousRecord = function (): void {
	actionModalStore.goToPreviousRecord();
	updateModalUi();
};

const navigateNextRecord = function (): void {
	actionModalStore.goToNextRecord();
	updateModalUi();
};

// bg saved the result: drop the candidate and move on
const handleBgSuccess = function (
	modalElement: HTMLElement,
	statusSelectElement: HTMLSelectElement,
	errorReasonInputElement: HTMLInputElement,
	submitStatusButtonElement: HTMLButtonElement,
	originalButtonText: string | null,
	replyTimeoutId: ReturnType<typeof setTimeout>
): void {
	if (!isWaitingForBg) return; // the timeout already released it
	clearTimeout(replyTimeoutId);
	isWaitingForBg = false;
	submitStatusButtonElement.textContent = originalButtonText;

	actionModalStore.removeCurrentRecord();
	if (actionModalStore.getTotalRecords() === 0) {
		// release the freeze before hiding, so the next open isn't stuck
		updateModalUi();
		modalElement.style.display = "none";
		return;
	}

	// next candidate starts clean
	statusSelectElement.value = "success";
	errorReasonInputElement.value = "";
	updateModalUi();
};

// bg failed: the candidate stays so the agent can retry
const handleBgError = function (
	errorMessage: string,
	submitStatusButtonElement: HTMLButtonElement,
	originalButtonText: string | null,
	replyTimeoutId: ReturnType<typeof setTimeout>
): void {
	if (!isWaitingForBg) return;
	clearTimeout(replyTimeoutId);
	isWaitingForBg = false;
	submitStatusButtonElement.textContent = originalButtonText;
	updateModalUi();
	notifyToast({ type: "error", text: errorMessage, timeoutMs: 6000 });
};

const submitCandidateStatus = function (
	modalElement: HTMLElement,
	statusSelectElement: HTMLSelectElement,
	errorReasonInputElement: HTMLInputElement,
	submitStatusButtonElement: HTMLButtonElement
): void {
	if (isWaitingForBg) return;

	const currentRecord = actionModalStore.getCurrentRecord();
	if (currentRecord === null) return;

	// original text e.g. "Submit", put back when bg replies
	const originalButtonText = submitStatusButtonElement.textContent;
	submitStatusButtonElement.textContent = "Please wait...";

	isWaitingForBg = true;
	updateModalUi();

	const BG_REPLY_TIMEOUT_MS = 15000;

	// safety net: if bg never replies, release the pause
	const replyTimeoutId = setTimeout(function () {
		if (!isWaitingForBg) return;
		isWaitingForBg = false;
		submitStatusButtonElement.textContent = originalButtonText;
		updateModalUi();
		notifyToast({
			type: "error",
			text: "no reply from bg, try again",
			timeoutMs: 6000,
		});
	}, BG_REPLY_TIMEOUT_MS);

	const resultToReport = {
		phone: currentRecord.phone,
		status: statusSelectElement.value,
		errorReason: errorReasonInputElement.value.trim(),
	};

	// built before the record is removed
	actionModalInCs.messageBackgroundScript({
		messageToSend: {
			type: messageType.markCandidate,
			payload: resultToReport,
		},
		successCb() {
			handleBgSuccess(
				modalElement,
				statusSelectElement,
				errorReasonInputElement,
				submitStatusButtonElement,
				originalButtonText,
				replyTimeoutId
			);
		},
		errorCb(error) {
			handleBgError(
				error.errorMessage ?? "failed to save the result",
				submitStatusButtonElement,
				originalButtonText,
				replyTimeoutId
			);
		},
	});
};

const registerModalEvents = function (modalElement: HTMLElement): void {
	const closeModalButton = document.getElementById(modalIds.closeModalButton);
	closeModalButton?.addEventListener("click", function () {
		closeModal(modalElement);
	});

	const previousButtonElement = document.getElementById(
		modalIds.previousButton
	);
	previousButtonElement?.addEventListener("click", navigatePreviousRecord);

	const nextButtonElement = document.getElementById(modalIds.nextButton);
	nextButtonElement?.addEventListener("click", navigateNextRecord);

	const statusSelectElement = document.getElementById(
		modalIds.statusSelect
	) as HTMLSelectElement;
	const errorReasonInputElement = document.getElementById(
		modalIds.errorReasonInput
	) as HTMLInputElement;
	const submitStatusButtonElement = document.getElementById(
		modalIds.submitStatusButton
	) as HTMLButtonElement;

	statusSelectElement.addEventListener("change", updateModalUi);
	errorReasonInputElement.addEventListener("input", updateModalUi);

	submitStatusButtonElement.addEventListener("click", function () {
		submitCandidateStatus(
			modalElement,
			statusSelectElement,
			errorReasonInputElement,
			submitStatusButtonElement
		);
	});
};

// adds the modal to the page, or shows it again if already added
export const showModal = function (): void {
	let modalElement = document.getElementById(modalIds.host);

	if (modalElement) {
		modalElement.style.display = "block";
		updateModalUi();
		return;
	}

	modalElement = document.createElement("div");
	modalElement.id = modalIds.host;
	modalElement.innerHTML = modalTemplate;
	document.body.appendChild(modalElement);

	registerModalEvents(modalElement);
	updateModalUi();
};
