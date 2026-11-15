/* -------------------- LOCAL STORAGE HELPERS -------------------- */
const PHONE_STORAGE_KEY = "enrolledPhones";

export function getStoredPhones(): string[] {
	const rawStoredPhones = localStorage.getItem(PHONE_STORAGE_KEY);

	if (!rawStoredPhones) return [];

	try {
		const parsedPhones: unknown = JSON.parse(rawStoredPhones);

		return Array.isArray(parsedPhones) &&
			parsedPhones.every(function (phone) {
				return typeof phone === "string";
			})
			? parsedPhones
			: [];
	} catch {
		return [];
	}
}

export function storePhone(phone: string): void {
	const storedPhones = getStoredPhones();

	if (!storedPhones.includes(phone)) {
		storedPhones.push(phone);
		localStorage.setItem(PHONE_STORAGE_KEY, JSON.stringify(storedPhones));
	}
}

export function clearStoredPhones(): void {
	localStorage.removeItem(PHONE_STORAGE_KEY);
}
