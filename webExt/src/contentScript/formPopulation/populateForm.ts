import { actionModalStore } from "../actionBtnAndModal";
import { addElemToDom } from "../../utils";

// Handles the actual form population methods.
const formMethodsFactory = function () {
	const createPill = function (
		elem: HTMLInputElement | HTMLSelectElement,
		value: string,
		pillText: string
	): void {
		if (!value) return;

		// Prevent duplicate pills for this particular element.
		if (elem.nextElementSibling?.classList.contains("ext-pill")) return;

		elem.value = value;

		addElemToDom({
			parentElem: elem.parentElement || document.body,
			typeOfElem: "button",
			textContent: pillText,
			elemAttributes: {
				class: "ext-pill red lighten-3",
				type: "button",
			},
			pluginFunc: function (parent, pill) {
				parent.insertBefore(pill, elem.nextSibling);

				pill.addEventListener("dblclick", function () {
					elem.value = "";
					pill.remove();
				});
			},
		});
	};

	const populateTextInput = function (input: HTMLInputElement): void {
		const activeRecord = actionModalStore.getCurrentRecord();

		if (!activeRecord) return;

		const placeholder = input.placeholder.toLowerCase();

		if (placeholder.includes("full name") && activeRecord.fullName) {
			createPill(input, activeRecord.fullName, "Full Name");
			return;
		}

		if (placeholder.includes("email") && activeRecord.email) {
			createPill(input, activeRecord.email, "Email");
			return;
		}

		if (placeholder.includes("phone") && activeRecord.phone) {
			createPill(input, activeRecord.phone, "Phone");
		}
	};

	const populateSelect = function (select: HTMLSelectElement): void {
		const activeRecord = actionModalStore.getCurrentRecord();

		if (!activeRecord) return;

		const receivedCourse = activeRecord.course?.trim().toLowerCase();

		const matchingOption = Array.from(select.options).find(function (option) {
			return option.value.trim().toLowerCase() === receivedCourse;
		});

		if (!matchingOption) {
			select.style.borderColor = "red";
			return;
		}

		select.value = matchingOption.value;
		select.style.borderColor = "green";
	};

	return {
		populateTextInput,
		populateSelect,
	};
};

// Main form population factory.
export const formPopulationFactory = function () {
	const formMethods = formMethodsFactory();

	const handleDoubleClick = function (event: Event): void {
		const target = event.target as HTMLElement;

		if (!target) return;

		if (target.tagName === "INPUT") {
			const input = target as HTMLInputElement;

			if (input.type === "file") return;

			formMethods.populateTextInput(input);
			return;
		}

		if (target.tagName === "SELECT") {
			formMethods.populateSelect(target as HTMLSelectElement);
		}
	};

	const registerFormPopulationListener = function (): void {
		document.addEventListener("dblclick", handleDoubleClick);
	};

	return {
		registerFormPopulationListener,
	};
};
