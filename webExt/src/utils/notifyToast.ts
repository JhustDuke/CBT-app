import { addElemToDom } from ".";

/**
 * Displays a temporary toast notification on the page.
 *
 * @param {Object} options - Configuration options for the toast.
 * @param {string} options.text - The message to display.
 * @param {"success" | "error"} [options.type="success"] - Type of message for styling.
 * @param {number} [options.timeout=5000] - Duration (ms) before the toast disappears.
 * @param {HTMLElement} [options.parentElem=document.body] - Parent element to append the toast to.
 *
 * @example
 * notifyToast({ text: "Data saved", type: "success" });
 * notifyToast({ text: "Failed to save", type: "error", timeout: 3000 });
 */
export function notifyToast({
	text,
	type = "success",
	timeout = 5000,
	parentElem = document.body,
}: {
	text: string;
	type?: "success" | "error";
	timeout?: number;
	parentElem?: HTMLElement;
}) {
	const classMap = {
		success: "green green-darken-4 white-text",
		error: "red red-darken-4 white-text",
	};

	addElemToDom({
		parentElem,
		typeOfElem: "div",
		textContent: text,
		elemAttributes: {
			class: `mx-auto p-3 w-50 fixed-top  text-center ${classMap[type]} ext`,
		},
		pluginFunc: function (parentElem, newElem) {
			if (!newElem || !parentElem) return;
			newElem.style.left = "150px";

			parentElem.append(newElem);
			setTimeout(() => newElem.remove(), timeout);
		},
	});
}
