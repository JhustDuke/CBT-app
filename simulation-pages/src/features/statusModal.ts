import { BASE_URL, ENROLMENT_STATUS_PATH } from "../../endpoints";
import { getStoredPhones, clearStoredPhones } from "../localStorage";
import { isValidPhone } from "../validation";

/* -------------------- STATUS MODAL ELEMENTS -------------------- */
export const statusModalElements = {
	modal: document.getElementById("statusModal") as HTMLDivElement,
	openButton: document.getElementById("toggleModalBtn") as HTMLButtonElement,
	closeButton: document.getElementById("closeModalBtn") as HTMLButtonElement,
	candidatePhoneInput: document.getElementById(
		"candidatePhone"
	) as HTMLInputElement,
	checkStatusButton: document.getElementById(
		"checkStatusBtn"
	) as HTMLButtonElement,
	statusMessage: document.getElementById(
		"statusPlaceholder"
	) as HTMLParagraphElement,
	storedPhonesContainer: document.getElementById(
		"storedPhones"
	) as HTMLDivElement,
};

/* -------------------- RENDER STORED PHONES IN MODAL -------------------- */
export function renderStoredPhones(): void {
	statusModalElements.storedPhonesContainer.replaceChildren();

	const heading = document.createElement("div");
	heading.className = "mb-2 font-bold";
	heading.textContent = "Recent registrations";
	statusModalElements.storedPhonesContainer.append(heading);

	const storedPhones = getStoredPhones();

	for (let phoneIndex = 0; phoneIndex < storedPhones.length; phoneIndex++) {
		const phone = storedPhones[phoneIndex];

		const phoneButton = document.createElement("button");
		phoneButton.type = "button";
		phoneButton.textContent = phone;
		phoneButton.className =
			"mb-2 w-full rounded border border-gray-900 p-1 text-sm hover:bg-gray-100";
		phoneButton.addEventListener("dblclick", function () {
			statusModalElements.candidatePhoneInput.value = phone;
		});

		statusModalElements.storedPhonesContainer.append(phoneButton);
	}

	if (storedPhones.length > 0) {
		const clearButton = document.createElement("button");
		clearButton.type = "button";
		clearButton.textContent = "Clear Recent";
		clearButton.className =
			"mt-2 w-full rounded bg-red-500 p-1 text-sm text-white hover:bg-red-600";
		clearButton.addEventListener("click", function () {
			clearStoredPhones();
			renderStoredPhones();
		});

		statusModalElements.storedPhonesContainer.append(clearButton);
	}
}

/* -------------------- MODAL OPEN / CLOSE -------------------- */
export function openStatusModal(): void {
	statusModalElements.modal.classList.remove("hidden");
	statusModalElements.modal.classList.add("flex");
	renderStoredPhones();
}

export function closeStatusModal(): void {
	statusModalElements.modal.classList.add("hidden");
	statusModalElements.modal.classList.remove("flex");
}

/* -------------------- CHECK STATUS -------------------- */
const checkStatusRequest = async function (phone: string): Promise<string> {
	//query param name must match the route e.g. ?candidatePhoneNumber=08012345678
	const response = await fetch(
		BASE_URL +
			ENROLMENT_STATUS_PATH +
			"?candidatePhoneNumber=" +
			encodeURIComponent(phone)
	);

	const responseBody = await response.json();

	if (!response.ok) {
		throw new Error(responseBody.message);
	}

	return responseBody.registrationStatus;
};

function showStatusMessage(message: string, color: string): void {
	statusModalElements.statusMessage.textContent = message;
	statusModalElements.statusMessage.style.color = color;
}

export const handleCheckStatusClick = async function (): Promise<void> {
	const phone = statusModalElements.candidatePhoneInput.value.trim();

	if (!isValidPhone(phone)) {
		showStatusMessage(
			"Enter a valid phone number (11 digits starting with 0).",
			"red"
		);
		return;
	}

	showStatusMessage("Checking...", "orange");

	try {
		const registrationStatus = await checkStatusRequest(phone);
		showStatusMessage(`Status for ${phone}: ${registrationStatus}`, "green");
	} catch (error) {
		showStatusMessage(
			error instanceof Error ? error.message : "Failed to check status.",
			"red"
		);
	}
};

// Reset the message when the phone changes.
export const resetStatusMessage = function (): void {
	showStatusMessage("Click the button to check", "black");
};
