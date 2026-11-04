import modalTemplate from "./modal.html?raw";
import { oneTimeMsgFactory } from "xtension-messenger";
import { actionModalStore } from "./";
import { notifyToast, messageType } from "../../utils";

// every id used by the modal, so none are typed by hand elsewhere
const modalIds = {
	host: "ext-actionModal-host",
	overlay: "ext-actionModal",
	card: "ext-actionModalCard",
	candidateName: "ext-candidateName",
	candidatePhone: "ext-candidatePhone",
	candidateNin: "ext-candidateNin",
	enrolCounter: "ext-enrolCounter",
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

	const candidateNameElement = document.getElementById(modalIds.candidateName);
	const candidatePhoneElement = document.getElementById(
		modalIds.candidatePhone
	);
	const candidateNinElement = document.getElementById(modalIds.candidateNin);
	const enrolCounterElement = document.getElementById(modalIds.enrolCounter);

	const previousButton = document.getElementById(
		modalIds.previousButton
	) as HTMLButtonElement | null;
	const nextButton = document.getElementById(
		modalIds.nextButton
	) as HTMLButtonElement | null;

	// candidate information
	if (candidateNameElement) {
		candidateNameElement.textContent = "Name: " + currentRecord.fullName;
	}

	if (candidatePhoneElement) {
		candidatePhoneElement.textContent = "Phone Number: " + currentRecord.phone;
	}

	if (candidateNinElement) {
		candidateNinElement.textContent = "NIN: " + currentRecord.nin;
	}

	// counter e.g. "2 of 3"
	if (enrolCounterElement) {
		enrolCounterElement.textContent =
			actionModalStore.getCurrentRecordNumber() +
			" of " +
			actionModalStore.getTotalRecords();
	}

	if (previousButton)
		previousButton.disabled = !actionModalStore.hasPreviousRecord();
	if (nextButton) nextButton.disabled = !actionModalStore.hasNextRecord();
};

// removes all form population pills
const removePills = function (): void {
	document.querySelectorAll(".ext-pill").forEach(function (pill) {
		const boundElement = pill.previousElementSibling as
			| HTMLInputElement
			| HTMLSelectElement
			| null;

		if (boundElement) {
			boundElement.value = "";
		}

		pill.remove();
	});

	document.querySelectorAll(".ext-pill-err").forEach(function (elem) {
		elem.classList.remove("ext-pill-err");
	});
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
	removePills();
	actionModalStore.goToPreviousRecord();
	updateModalUi();
};

const navigateNextRecord = function (): void {
	removePills();
	actionModalStore.goToNextRecord();
	updateModalUi();
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
		// ignore clicks while a request is already running
		if (isWaitingForBg) return;

		const currentRecord = actionModalStore.getCurrentRecord();
		if (currentRecord === null) return;

		// original text e.g. "Submit", put back when the request ends
		const originalButtonText = submitStatusButtonElement.textContent;

		// start waiting: change the text and freeze the modal
		submitStatusButtonElement.textContent = "Please wait...";
		isWaitingForBg = true;
		updateModalUi();

		// built before the record is removed
		const resultToReport = {
			phone: currentRecord.phone,
			status: statusSelectElement.value,
			errorReason: errorReasonInputElement.value.trim(),
		};

		const BG_REPLY_TIMEOUT_MS = 15000;

		// safety net: if bg never replies, end the wait the same way an error does
		const replyTimeoutId = setTimeout(function () {
			// 1. stop waiting and put the button text back
			isWaitingForBg = false;
			submitStatusButtonElement.textContent = originalButtonText;

			// 2. the candidate stays so the agent can retry; refresh to unfreeze
			updateModalUi();

			// 3. tell the agent bg is silent
			notifyToast({
				type: "error",
				text: "no reply from bg, try again",
				timeoutMs: 6000,
			});
		}, BG_REPLY_TIMEOUT_MS);

		actionModalInCs.messageBackgroundScript({
			messageToSend: {
				type: messageType.markCandidate,
				payload: resultToReport,
			},
			successCb() {
				// 1. the timeout already ended this request, so ignore the late reply
				if (!isWaitingForBg) return;

				// 2. bg replied in time, so cancel the timeout
				clearTimeout(replyTimeoutId);

				// 3. stop waiting and put the button text back
				isWaitingForBg = false;
				submitStatusButtonElement.textContent = originalButtonText;

				// 4. bg saved the result, so drop this candidate from the list
				actionModalStore.removeCurrentRecord();

				// 5. next candidate starts clean
				statusSelectElement.value = "success";
				errorReasonInputElement.value = "";

				// 6. refresh the modal, this also unfreezes it
				updateModalUi();

				//clear the pills from the ui
				removePills();

				// 7. that was the last candidate, so hide the modal
				if (actionModalStore.getTotalRecords() === 0) {
					modalElement.style.display = "none";
				}
			},
			errorCb(error) {
				// 1. the timeout already ended this request, so ignore the late reply
				if (!isWaitingForBg) return;

				// 2. bg replied in time, so cancel the timeout
				clearTimeout(replyTimeoutId);

				// 3. stop waiting and put the button text back
				isWaitingForBg = false;
				submitStatusButtonElement.textContent = originalButtonText;

				// 4. the candidate stays so the agent can retry; refresh to unfreeze
				updateModalUi();

				// 5. tell the agent why it failed
				notifyToast({
					type: "error",
					text: error.errorMessage ?? "failed to save the result",
					timeoutMs: 6000,
				});
			},
		});
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
