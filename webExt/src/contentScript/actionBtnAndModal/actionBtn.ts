import { showModal } from "./actionModal";

const ACTION_BUTTON_ID = "ext-actionBtn";

//adds the floating button, does nothing if already there
export function showActionButton(): void {
	if (document.getElementById(ACTION_BUTTON_ID)) {
		return;
	}

	const actionButton = document.createElement("button");
	actionButton.id = ACTION_BUTTON_ID;
	actionButton.className = "auxie-btn auxie-float-btn";
	actionButton.textContent = "Run Auxie";
	actionButton.addEventListener("click", showModal);
	document.body.appendChild(actionButton);
	console.log("showActionBtn ran");
}
