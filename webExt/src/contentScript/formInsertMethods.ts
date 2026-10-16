import { addElemToDom, emitCustomEvent } from "../utils";
import { FormDataInterface } from "../interfaces";
import { CustomEvents as customEventsNames } from "./customEvents";

export const formMethods = (function () {
	// ===============================
	// INTERNAL HELPER
	// ===============================
	const createPill = function (
		elem: HTMLInputElement | HTMLSelectElement,
		value: string,
		pillText: string
	): void {
		if (!value) return;
		if (elem.parentElement?.querySelector(".ext-pill")) return;

		elem.value = value;

		addElemToDom({
			parentElem: elem.parentElement || document.body,
			typeOfElem: "button",
			textContent: pillText,
			elemAttributes: { class: "ext-pill red lighten-3", type: "button" },
			pluginFunc: function (parent, pill) {
				parent.insertBefore(pill, elem.nextSibling);
				pill.addEventListener("dblclick", function () {
					elem.value = "";
					pill.remove();
				});
			},
		});
	};

	// ===============================
	// PUBLIC API
	// ===============================
	return {
		// Handle name, email, phone
		handleTextInput: function (
			input: HTMLInputElement,
			formData: FormDataInterface
		): void {
			if (!formData) return;

			const placeholder = input.placeholder?.toLowerCase() || "";

			if (placeholder.includes("full name") && formData.fullName) {
				createPill(input, formData.fullName, "Full Name");
				return;
			}

			if (placeholder.includes("email") && formData.email) {
				createPill(input, formData.email, "Email");
				return;
			}

			if (placeholder.includes("phone") && (formData.phoneNumber as any)) {
				createPill(input, formData.phoneNumber, "Phone");
				emitCustomEvent({
					eventName: customEventsNames.onPhoneNumberEmit,
					payload: { phone: formData.phone },
				});
			}
		},

		// Handle file inputs (image files)
		//this is consumed by the onreceived custom event in cs script
		handleFileInput: function (input: HTMLInputElement): void {
			const imageFileName = extractFilename(input);
			emitCustomEvent({
				eventName: customEventsNames.onImageFileNameEmit,
				payload: { imageFileName, imageFile: input.files?.[0] },
			});
			console.log("image emitted");
		},

		// Handle select elements
		handleSelect: function (select: HTMLSelectElement, course?: string): void {
			const courses = Array.from(select.options);
			const payloadCourse = courses.find(function (entry) {
				return entry.value.toLowerCase() === course?.toLowerCase();
			});
			if (!payloadCourse) {
				createPill(select, "null", `${course} not found`);
				return;
			}
			select.value = payloadCourse.value;
			createPill(select, payloadCourse.value, "Course");
		},

		// Delegate input/select events
		handleEvent: function (e: Event, formData: FormDataInterface): void {
			const target = e.target as HTMLElement;
			if (!target) return;

			if (target.tagName === "INPUT") {
				const input = target as HTMLInputElement;
				if (input.type === "file") {
					this.handleFileInput(input);
				} else {
					this.handleTextInput(input, formData);
				}
				return;
			}

			if (target.tagName === "SELECT") {
				this.handleSelect(target as HTMLSelectElement, formData.course);
			}
		},
	};
})();

// Extract filename from file input
function extractFilename(input: HTMLInputElement): string | null {
	if (!input.files || input.files.length === 0) {
		console.log("No file selected");
		return null;
	}
	const file = input.files[0];
	const nameParts = file.name.split(".");
	if (nameParts.length === 1) return file.name; // no extension
	nameParts.pop(); // remove extension
	return nameParts.join(".");
}
