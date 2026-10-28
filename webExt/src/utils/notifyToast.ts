import { addElemToDom } from ".";

/**
 * Displays a temporary toast notification on the page.
 *
 * @param {Object} options - Configuration options for the toast.
 * @param {string} options.text - The message to display.
 * @param {"success" | "error"} [options.type="success"] - Type of message for styling.
 * @param {number} [options.timeoutMs=5000] - Duration (ms) before the toast disappears.
 * @param {HTMLElement} [options.parentElem=document.body] - Parent element to append the toast to.
 *
 * @example
 * notifyToast({ text: "Data saved", type: "success" });
 * notifyToast({ text: "Failed to save", type: "error", timeout: 3000 });
 */

/**
 * Displays a temporary toast notification on the page.
 */
export function notifyToast({
	text,
	type = "success",
	timeoutMs = 5000,
	parentElem = document.body,
}: {
	text: string;
	type?: "success" | "error";
	timeoutMs?: number;
	parentElem?: HTMLElement;
}) {
	const backgroundColor = {
		success: "#166534",
		error: "#991b1b",
	};

	addElemToDom({
		parentElem,
		typeOfElem: "div",
		textContent: text,
		elemAttributes: {
			class: "auxie-toast",
			role: "status",
		},
		pluginFunc: function (parentElem, newElem) {
			if (!newElem || !parentElem) return;

			newElem.style.position = "fixed";
			newElem.style.top = "20px";
			newElem.style.left = "50%";
			newElem.style.transform = "translateX(-50%)";
			newElem.style.zIndex = "2147483647";
			newElem.style.width = "200px";
			newElem.style.maxWidth = "400px";
			newElem.style.padding = "12px 20px";
			newElem.style.borderRadius = "6px";
			newElem.style.backgroundColor = backgroundColor[type];
			newElem.style.color = "#fff";
			newElem.style.font = "14px sans-serif";
			newElem.style.textAlign = "center";
			newElem.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
			newElem.style.overflowWrap = "anywhere";
			newElem.style.boxSizing = "border-box";

			parentElem.append(newElem);

			setTimeout(function () {
				newElem.remove();
			}, timeoutMs);
		},
	});
}
