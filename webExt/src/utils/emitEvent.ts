export function emitCustomEvent({
	elemTarget,
	eventName,
	payload,
}: {
	elemTarget?: HTMLElement;
	eventName: string;
	payload?: Record<string, any>;
}) {
	const target = elemTarget || document;

	if (payload) {
		const event = new CustomEvent(eventName, {
			detail: payload,
			bubbles: true,
		});

		target.dispatchEvent(event);
		return;
	}
	const event = new CustomEvent(eventName);
	target.dispatchEvent(event);
}
