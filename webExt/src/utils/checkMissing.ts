// Universal DOM checker
type ElementCheck = string | HTMLElement | (() => HTMLElement | null);
interface CheckObject {
	[key: string]: ElementCheck;
}

export function checkExistence(elements: CheckObject) {
	const found: Record<string, HTMLElement> = {};
	const missing: string[] = [];

	for (const [name, elOrFn] of Object.entries(elements)) {
		let el: HTMLElement | null;

		if (typeof elOrFn === "string") {
			el = document.querySelector(elOrFn);
		} else if (typeof elOrFn === "function") {
			el = elOrFn();
		} else {
			el = elOrFn;
		}

		if (!el) missing.push(name);
		else found[name] = el;
	}

	if (missing.length) {
		throw new Error(`Required elements missing: ${missing.join(", ")}`);
	}

	return found;
}
