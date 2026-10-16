function getNextBtn(): HTMLButtonElement | null {
	return document.getElementById("ext-nextBtn") as HTMLButtonElement;
}

function getPrevBtn(): HTMLButtonElement | null {
	return document.getElementById("ext-prevBtn") as HTMLButtonElement;
}

export function updateNavButtons(canNext: boolean, canPrev: boolean): void {
	const nextBtn = getNextBtn();
	const prevBtn = getPrevBtn();

	if (nextBtn) nextBtn.disabled = !canNext;
	if (prevBtn) prevBtn.disabled = !canPrev;
}
