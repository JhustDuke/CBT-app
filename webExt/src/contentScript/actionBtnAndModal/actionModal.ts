import modalTemplate from "./modal.html?raw";

const MODAL_HOST_ID = "ext-actionModal-host";

//adds the modal to the page, or shows it again if already added
export function showModal(): void {
	const existingModalHost = document.getElementById(MODAL_HOST_ID);

	if (existingModalHost) {
		existingModalHost.style.display = "block";
		return;
	}

	const modalHost = document.createElement("div");
	modalHost.id = MODAL_HOST_ID;
	modalHost.innerHTML = modalTemplate;
	document.body.appendChild(modalHost);

	const closeModalButton = modalHost.querySelector("#ext-closeModalBtn");
	closeModalButton?.addEventListener("click", function () {
		modalHost.style.display = "none";
	});
}
