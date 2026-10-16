import { addElemToDom } from "../../utils";
import { csColors } from "../csDOM";

const NEXT_BTN_ID = "nextBtn";

export const NextButtonMethods = {
	initNextBtn: function (): void {
		if (!document.getElementById(NEXT_BTN_ID)) {
			NextButtonMethods.createNextButton();
		}
	},
	createNextButton: function (): void {
		addElemToDom({
			parentElem: document.getElementById("app"),
			typeOfElem: "button",
			textContent: "Next",
			elemAttributes: {
				id: NEXT_BTN_ID,
				type: "button",
				class: `ext-pill ${csColors.nextBtnColor} mt-2 rounded-3 position-fixed ext`,
			},
			pluginFunc: function (_, nxtBtn) {
				nxtBtn.style.right = "26px";
				nxtBtn.style.bottom = "47.5vh";

				nxtBtn.addEventListener("click", function () {
					console.log("Next clicked");
				});
			},
		});
	},
};
