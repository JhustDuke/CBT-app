export function cleanupAll(selector: string, callback?: (el: Element) => void) {
	document.querySelectorAll(selector).forEach(function (el) {
		if (callback) callback(el);
		el.remove();
	});
}
