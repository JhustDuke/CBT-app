// actionButtonModule.ts
import { addElemToDom } from "../../utils";
import { csColors } from "../csDOM";

import { showModal } from "./modal";

const ACTION_BTN_ID = "actionBtn";

export const actionButtonMethods = {
	initBtn: function (): void {
		if (!document.getElementById(ACTION_BTN_ID)) {
			actionButtonMethods.createButton();
		}
	},

	createButton: function (): void {
		addElemToDom({
			parentElem: document.getElementById("app"),
			typeOfElem: "button",
			textContent: "Action",
			elemAttributes: {
				id: ACTION_BTN_ID,
				type: "button",
				class: `ext-pill ${csColors.actionBtnColor} rounded-circle p-2 position-fixed bottom-50 end-0 m-3 ext`,
			},
			pluginFunc: function (_, btn) {
				const actionBtn = document.getElementById(btn.id);
				actionBtn?.addEventListener("click", showModal);
			},
		});
	},
};
