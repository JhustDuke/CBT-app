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

const MINIMUM_ERROR_REASON_LENGTH = 5;

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

let isWaitingForBg = false;

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

// the modal's own line to bg, it lives in the content script
const actionModalInCs = oneTimeMsgFactory("cs");

//adds the modal to the page, or shows it again if already added
export const showModal = function (): void {
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

	const statusSelectElement = document.getElementById(
		modalIds.statusSelect
	) as HTMLSelectElement;
	statusSelectElement.addEventListener("change", updateModalUi);

	const errorReasonInputElement = document.getElementById(
		modalIds.errorReasonInput
	) as HTMLInputElement;
	errorReasonInputElement.addEventListener("input", updateModalUi);

	const submitStatusButtonElement = document.getElementById(
		modalIds.submitStatusButton
	) as HTMLButtonElement;
	submitStatusButtonElement.addEventListener("click", function () {
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

		// bg saved the result: drop the candidate and move on
		const handleBgSuccess = function (): void {
			if (!isWaitingForBg) return; // the timeout already released it
			clearTimeout(replyTimeoutId);
			isWaitingForBg = false;
			submitStatusButtonElement.textContent = originalButtonText;

			actionModalStore.removeCurrentRecord();
			if (actionModalStore.getTotalRecords() === 0) {
				// release the freeze before hiding, so the next open isn't stuck
				updateModalUi();
				newModal.style.display = "none";
				return;
			}

			// next candidate starts clean
			statusSelectElement.value = "success";
			errorReasonInputElement.value = "";
			updateModalUi();
		};

		// bg failed: the candidate stays so the agent can retry
		const handleBgError = function (errorMessage: string): void {
			if (!isWaitingForBg) return;
			clearTimeout(replyTimeoutId);
			isWaitingForBg = false;
			submitStatusButtonElement.textContent = originalButtonText;
			updateModalUi();
			notifyToast({ type: "error", text: errorMessage, timeoutMs: 6000 });
		};

		// built before the record is removed
		const resultToReport = {
			phone: currentRecord.phone,
			status: statusSelectElement.value,
			errorReason: errorReasonInputElement.value.trim(),
		};

		actionModalInCs.messageBackgroundScript({
			messageToSend: {
				type: messageType.markCandidate,
				payload: resultToReport,
			},
			successCb() {
				handleBgSuccess();
			},
			errorCb(error) {
				handleBgError(error.errorMessage ?? "failed to save the result");
			},
		});
	});
};
