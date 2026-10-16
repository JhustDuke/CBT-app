export function showActiveTab(tabId: string) {
	const $tab = $("#" + tabId);
	if ($tab.length === 0) {
		console.error(`Error: Element with id "${tabId}" does not exist.`);
		return;
	}
}

export function checkDomElems(btnMap: Record<string, JQuery<HTMLElement>>) {
	Object.entries(btnMap).forEach(function ([name, $btn]) {
		if ($btn.length === 0) {
			throw new Error(`elem "${name}" does not have a valid id`);
		}
	});
}
