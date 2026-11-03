import { actionModalStore } from "../actionBtnAndModal";
import { addElemToDom } from "../../utils";

interface PillConfigInterface {
	elem: HTMLInputElement | HTMLSelectElement;
	value: string;
	text: string;
	className?: string;
	setElementValue?: boolean;
}

// Handles the actual form population methods.
const formMethodsFactory = function () {
	const createPill = function (config: PillConfigInterface): void {
		const {
			elem,
			value,
			text,
			className = "ext-pill red lighten-3",
			setElementValue = true,
		} = config;

		if (!value) return;

		// Prevent duplicate pills for this particular element.
		if (elem.nextElementSibling?.classList.contains("ext-pill")) return;

		if (setElementValue) {
			elem.value = value;
		}

		addElemToDom({
			parentElem: elem.parentElement || document.body,
			typeOfElem: "button",
			textContent: text,
			elemAttributes: {
				class: className,
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
			createPill({
				elem: input,
				value: activeRecord.fullName,
				text: "Full Name",
			});
			return;
		}

		if (placeholder.includes("email") && activeRecord.email) {
			createPill({
				elem: input,
				value: activeRecord.email,
				text: "Email",
			});
			return;
		}

		if (placeholder.includes("phone") && activeRecord.phone) {
			createPill({
				elem: input,
				value: activeRecord.phone,
				text: "Phone",
			});
		}
	};

	const populateSelect = function (select: HTMLSelectElement): void {
		const activeRecord = actionModalStore.getCurrentRecord();

		if (!activeRecord) return;

		const receivedCourse = activeRecord.course?.trim().toLowerCase();

		if (!receivedCourse) return;

		const matchingOption = Array.from(select.options).find(function (option) {
			return option.value.trim().toLowerCase() === receivedCourse;
		});

		if (!matchingOption) {
			select.style.borderColor = "red";
			select.classList.add("ext-pill-err");

			createPill({
				elem: select,
				value: receivedCourse,
				text: `Not matched: ${activeRecord.course}`,
				className: "ext-pill-err ext-pill",
				setElementValue: false,
			});

			return;
		}

		select.style.borderColor = "green";
		select.classList.remove("ext-pill-err");

		createPill({
			elem: select,
			value: matchingOption.value,
			text: "Course",
			className: "ext-pill green lighten-3",
		});
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
