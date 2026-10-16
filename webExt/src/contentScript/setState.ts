// NEW CHANGE: extracted, decoupled setState utility
import { CsState } from "../interfaces";

export const setState = function (
	state: Partial<CsState>,
	updatedState: Partial<CsState>,
	render: () => void
): void {
	console.info("csApp before update:", JSON.parse(JSON.stringify(state)));

	const mergeDeep = function (target: any, source: any): void {
		for (const key in source) {
			if (
				source[key] &&
				typeof source[key] === "object" &&
				!Array.isArray(source[key])
			) {
				if (!target[key]) target[key] = {};
				mergeDeep(target[key], source[key]);
			} else {
				target[key] = source[key];
			}
		}
	};

	mergeDeep(state, updatedState);

	console.info("csApp after update:", JSON.parse(JSON.stringify(state)));

	render();
};
