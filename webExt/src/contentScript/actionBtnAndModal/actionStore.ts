import { FormDataInterface } from "../../interfaces";

function createActionModalStore() {
	let records: FormDataInterface[] = [];
	let currentRecordIndex = 0;

	// ---- write side: only the cs calls these ----

	// a new batch replaces the old one and goes back to the first candidate
	function setRecords(newRecords: FormDataInterface[]): void {
		// frozen so the modal can't change a record by accident
		for (const record of newRecords) {
			Object.freeze(record);
		}
		records = newRecords;
		currentRecordIndex = 0;
	}

	// stays on the last candidate when there is no next one
	function goToNextRecord(): void {
		if (currentRecordIndex < records.length - 1) {
			currentRecordIndex++;
		}
	}

	// stays on the first candidate when there is no previous one
	function goToPreviousRecord(): void {
		if (currentRecordIndex > 0) {
			currentRecordIndex--;
		}
	}

	// ---- read side: the modal uses these ----

	function getCurrentRecord(): FormDataInterface | null {
		if (records.length === 0) return null;
		return records[currentRecordIndex];
	}

	// e.g. "2 of 3" -> getCurrentRecordNumber() is 2, getTotalRecords() is 3
	function getCurrentRecordNumber(): number {
		return currentRecordIndex + 1;
	}

	function getTotalRecords(): number {
		return records.length;
	}

	function hasNextRecord(): boolean {
		return currentRecordIndex < records.length - 1;
	}

	function hasPreviousRecord(): boolean {
		return currentRecordIndex > 0;
	}

	return {
		setRecords,
		goToNextRecord,
		goToPreviousRecord,
		getCurrentRecord,
		getCurrentRecordNumber,
		getTotalRecords,
		hasNextRecord,
		hasPreviousRecord,
	};
}

export const actionModalStore = createActionModalStore();
