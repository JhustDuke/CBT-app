import {
	statusModalElements,
	openStatusModal,
	closeStatusModal,
	handleCheckStatusClick,
	resetStatusMessage,
} from "./features/statusModal";
import { formElements, handleEnrolSubmit } from "./features/enrolmentForm";

statusModalElements.openButton.addEventListener("click", openStatusModal);
statusModalElements.closeButton.addEventListener("click", closeStatusModal);
statusModalElements.checkStatusButton.addEventListener(
	"click",
	handleCheckStatusClick
);
statusModalElements.candidatePhoneInput.addEventListener(
	"input",
	resetStatusMessage
);

formElements.form.addEventListener("submit", handleEnrolSubmit);
