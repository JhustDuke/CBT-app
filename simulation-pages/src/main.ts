/* -------------------- LOCAL STORAGE HELPERS -------------------- */
const PHONE_STORAGE_KEY = "enrolledPhones";

function getStoredPhones(): string[] {
	const rawStoredPhones = localStorage.getItem(PHONE_STORAGE_KEY);

	if (!rawStoredPhones) return [];

	try {
		const parsedPhones: unknown = JSON.parse(rawStoredPhones);

		return Array.isArray(parsedPhones) &&
			parsedPhones.every(function (phone) {
				return typeof phone === "string";
			})
			? parsedPhones
			: [];
	} catch {
		return [];
	}
}

function storePhone(phone: string): void {
	const storedPhones = getStoredPhones();

	if (!storedPhones.includes(phone)) {
		storedPhones.push(phone);
		localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(storedPhones));
	}
}

function clearStoredPhones(): void {
	localStorage.removeItem(PHONE_STORAGE_KEY);
}

/* -------------------- VALIDATION -------------------- */
// NIN e.g. 12345678901 (exactly 11 digits)
function isValidNin(nin: string): boolean {
	return /^\d{11}$/.test(nin);
}

// Phone e.g. 08012345678 (11 digits starting with 0)
function isValidPhone(phone: string): boolean {
	return /^0\d{10}$/.test(phone);
}

/* -------------------- STATUS MODAL ELEMENTS -------------------- */
const statusModalElements = {
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
function renderStoredPhones(): void {
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
function openStatusModal(): void {
	statusModalElements.modal.classList.remove("hidden");
	statusModalElements.modal.classList.add("flex");
	renderStoredPhones();
}

function closeStatusModal(): void {
	statusModalElements.modal.classList.add("hidden");
	statusModalElements.modal.classList.remove("flex");
}

statusModalElements.openButton.addEventListener("click", openStatusModal);
statusModalElements.closeButton.addEventListener("click", closeStatusModal);

/* -------------------- CHECK STATUS -------------------- */
// FAKE: swap this body for the real fetch later, resolve with the status string
function checkStatusRequest(phone: string): Promise<string> {
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve("pending");
		}, 800);
	});
}

function showStatusMessage(message: string, color: string): void {
	statusModalElements.statusMessage.textContent = message;
	statusModalElements.statusMessage.style.color = color;
}

statusModalElements.checkStatusButton.addEventListener(
	"click",
	async function () {
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
	}
);

// Reset the message when the phone changes.
statusModalElements.candidatePhoneInput.addEventListener("input", function () {
	showStatusMessage("Click the button to check", "black");
});

/* -------------------- ENROLMENT FORM ELEMENTS -------------------- */
const formElements = {
	form: document.getElementById("form") as HTMLFormElement,
	nin: document.getElementById("nin") as HTMLInputElement,
	fullName: document.getElementById("fullName") as HTMLInputElement,
	email: document.getElementById("email") as HTMLInputElement,
	phone: document.getElementById("phone") as HTMLInputElement,
	course: document.getElementById("course") as HTMLSelectElement,
	submitButton: document.querySelector(
		"button[type='submit']"
	) as HTMLButtonElement,
};

/* -------------------- ENROLMENT FORM VALUES -------------------- */
interface EnrolmentData {
	nin: string;
	fullName: string;
	email: string;
	phone: string;
	course: string;
}

function readEnrolmentData(): EnrolmentData {
	return {
		nin: formElements.nin.value.trim(),
		fullName: formElements.fullName.value.trim(),
		email: formElements.email.value.trim(),
		phone: formElements.phone.value.trim(),
		course: formElements.course.value.trim(),
	};
}

// Returns the first error message, or "" when everything is valid.
function getEnrolmentError(enrolmentData: EnrolmentData): string {
	if (!isValidNin(enrolmentData.nin)) {
		return "NIN must be exactly 11 digits.";
	}

	if (!enrolmentData.fullName) {
		return "Full name is required.";
	}

	if (!enrolmentData.email) {
		return "Email is required.";
	}

	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enrolmentData.email)) {
		return "Enter a valid email address.";
	}

	if (!isValidPhone(enrolmentData.phone)) {
		return "Phone number must be 11 digits starting with 0.";
	}

	if (!enrolmentData.course) {
		return "Please select a course.";
	}

	return "";
}

/* -------------------- FORM SUBMIT -------------------- */
interface Candidate extends EnrolmentData {
	registrationStatus: string;
}

// FAKE: swap this body for the real fetch later, resolve with the new candidate.
function enrolCandidateRequest(
	enrolmentData: EnrolmentData
): Promise<Candidate> {
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve({ ...enrolmentData, registrationStatus: "pending" });
		}, 800);
	});
}

formElements.form.addEventListener("submit", async function (event) {
	event.preventDefault();

	const enrolmentData = readEnrolmentData();
	const enrolmentError = getEnrolmentError(enrolmentData);

	if (enrolmentError) {
		alert(enrolmentError);
		return;
	}

	formElements.submitButton.disabled = true;
	formElements.submitButton.textContent = "Processing...";

	try {
		const newCandidate = await enrolCandidateRequest(enrolmentData);

		storePhone(enrolmentData.phone);
		renderStoredPhones();

		alert(JSON.stringify(newCandidate, null, 2));

		formElements.form.reset();
	} catch (error) {
		alert(error instanceof Error ? error.message : "Unknown error");
	} finally {
		formElements.submitButton.disabled = false;
		formElements.submitButton.textContent = "Submit";
	}
});
