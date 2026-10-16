interface AddElemToDomOptions {
	parentElem?: HTMLElement | null;
	// Parent container where the element will be inserted

	typeOfElem: keyof HTMLElementTagNameMap;
	// Valid HTML tag only (compile-time safety against typos)

	textContent?: string;
	// Text content for the element

	elemAttributes?: { [key: string]: any };
	// Attributes / properties to apply to the element

	beforeElem?: HTMLElement | null;
	// Optional child of parentElem to insert before

	pluginFunc?: (parentElem: HTMLElement, newElem: HTMLElement) => void;
	// Optional hook to enhance the element after insertion
}

/**
 * Creates an HTML element of a valid tag type.
 */
function createElem(typeOfElem: keyof HTMLElementTagNameMap): HTMLElement {
	return document.createElement(typeOfElem);
}

/**
 * Applies attributes safely to an element.
 * if an array is provided it spreads all its entries into the elements class
 * Boolean values are assigned as properties.
 */
function applyAttributes(
	elem: HTMLElement,
	attributes: { [key: string]: any } | string[]
): void {
	if (!attributes) return;

	if (Array.isArray(attributes)) {
		elem.classList.add(...attributes); // empty array is fine
		return;
	}

	if (Object.keys(attributes).length === 0) return;

	for (const [key, value] of Object.entries(attributes)) {
		if (typeof value === "boolean") {
			(elem as any)[key] = value;
		} else {
			elem.setAttribute(key, value);
		}
	}
}

/**
 * Creates and inserts an element into the DOM with strict validation.
 * - Always inserts the element
 * - Throws if beforeElem is invalid or not a child of parentElem
 * - Runs pluginFunc after insertion
 */
export function addElemToDom({
	parentElem = document.body,
	typeOfElem,
	textContent = "placeholder",
	elemAttributes = {},
	beforeElem = null,
	pluginFunc,
}: AddElemToDomOptions): void {
	if (!(parentElem instanceof HTMLElement)) {
		throw new Error("parentElem is not a valid HTMLElement");
	}

	const createdElem = createElem(typeOfElem);
	createdElem.textContent = textContent;

	applyAttributes(createdElem, elemAttributes);

	if (beforeElem !== null) {
		if (!(beforeElem instanceof HTMLElement)) {
			throw new Error("beforeElem must be an HTMLElement");
		}
		if (!parentElem.contains(beforeElem)) {
			throw new Error("beforeElem is not a child of parentElem");
		}
		parentElem.insertBefore(createdElem, beforeElem);
	} else {
		parentElem.appendChild(createdElem);
	}

	if (typeof pluginFunc === "function") {
		pluginFunc(parentElem, createdElem);
	}
}
