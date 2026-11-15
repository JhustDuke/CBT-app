import { BASE_URL, ENROL_CANDIDATE_PATH } from "../../endpoints";
import { storePhone } from "../localStorage";
import { isValidNin, isValidPhone } from "../validation";
import { renderStoredPhones } from "./statusModal";

/* -------------------- ENROLMENT FORM ELEMENTS -------------------- */
export const formElements = {
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

const enrolCandidateRequest = async function (
	enrolmentData: EnrolmentData
): Promise<Candidate> {
	const response = await fetch(BASE_URL + ENROL_CANDIDATE_PATH, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		//backend expects phoneNumber, the form uses phone
		body: JSON.stringify({
			course: enrolmentData.course,
			fullName: enrolmentData.fullName,
			phoneNumber: enrolmentData.phone,
			nin: enrolmentData.nin,
			email: enrolmentData.email,
		}),
	});

	const responseBody = await response.json();

	if (!response.ok) {
		throw new Error(responseBody.message);
	}

	return responseBody.newCandidate;
};

export const handleEnrolSubmit = async function (
	event: SubmitEvent
): Promise<void> {
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
};
