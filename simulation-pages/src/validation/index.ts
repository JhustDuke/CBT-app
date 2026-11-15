/* -------------------- VALIDATION -------------------- */
// NIN e.g. 12345678901 (exactly 11 digits)
export function isValidNin(nin: string): boolean {
	return /^\d{11}$/.test(nin);
}

// Phone e.g. 08012345678 (11 digits starting with 0)
export function isValidPhone(phone: string): boolean {
	return /^0\d{10}$/.test(phone);
}
