interface ModalInterface {
	imageBuffer: Blob | null;
	preparedDownloadImage: Blob | null;
	phone: string | null;
	isImageAvailable: boolean;
	stepsForward: number;
	stepsBackward: number;
	canGoForward: boolean;
	canGoBack: boolean;
}

const modalState: ModalInterface = {
	imageBuffer: null,
	preparedDownloadImage: null,
	phone: null,
	isImageAvailable: false,
	stepsForward: 0,
	stepsBackward: 0,
	canGoForward: true,
	canGoBack: false,
};

export const actionModalStore = (function modalStore() {
	const stateUpdateHistory: Record<string, string[]> = {};

	function trackUpdate(prop: keyof ModalInterface, updatedBy: string) {
		if (!stateUpdateHistory[prop]) {
			stateUpdateHistory[prop] = [];
		}
		stateUpdateHistory[prop].push(updatedBy);
	}

	return {
		setPhoneNumber(phone: string, updatedBy: string): void {
			modalState.phone = phone;
			trackUpdate("phone", updatedBy);
		},

		getPhoneNumber(): string | null {
			return modalState.phone;
		},

		setImageBuffer(blob: Blob, updatedBy: string): void {
			modalState.imageBuffer = blob;
			trackUpdate("imageBuffer", updatedBy);
		},

		getImageBuffer(): Blob | null {
			return modalState.imageBuffer;
		},

		setPreparedDownloadImage(blob: Blob, updatedBy: string): void {
			modalState.preparedDownloadImage = blob;
			trackUpdate("preparedDownloadImage", updatedBy);
		},

		getPreparedDownloadImage(): Blob | null {
			return modalState.preparedDownloadImage;
		},

		setImageAvailable(val: boolean, updatedBy: string): void {
			modalState.isImageAvailable = val;
			trackUpdate("isImageAvailable", updatedBy);
		},

		getImageAvailable(): boolean {
			return modalState.isImageAvailable;
		},

		setCanGoBack(val: boolean, updatedBy: string): void {
			modalState.canGoBack = val;
			trackUpdate("canGoBack", updatedBy);
		},

		getCanGoBack(): boolean {
			return modalState.canGoBack;
		},

		setCanGoForward(val: boolean, updatedBy: string): void {
			modalState.canGoForward = val;
			trackUpdate("canGoForward", updatedBy);
		},

		getCanGoForward(): boolean {
			return modalState.canGoForward;
		},

		incrementStepsForward(updatedBy: string): void {
			modalState.stepsForward++;
			trackUpdate("stepsForward", updatedBy);
		},

		incrementStepsBackward(updatedBy: string): void {
			modalState.stepsBackward++;
			trackUpdate("stepsBackward", updatedBy);
		},

		reduceStepsForward(updatedBy: string): void {
			modalState.stepsForward--;
			trackUpdate("stepsForward", updatedBy);
		},

		reduceStepsBackward(updatedBy: string): void {
			modalState.stepsBackward--;
			trackUpdate("stepsBackward", updatedBy);
		},

		getStepsForward(): number {
			return modalState.stepsForward;
		},

		getStepsBackward(): number {
			return modalState.stepsBackward;
		},

		getUpdateHistory(prop: keyof ModalInterface): string[] {
			return stateUpdateHistory[prop] || [];
		},
	};
})();
