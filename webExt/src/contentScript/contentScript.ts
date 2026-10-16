// ======================================================
// IMPORTS
// External libs, types, utilities, and internal modules
// ======================================================
import { oneTimeMsgFactory } from "xtension-messenger";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";
import {
	FormDataInterface,
	GeneratorResultInterface,
	CsState,
	UpdateEnrolStatusPayloadInterface,
} from "../interfaces";
import { actionButtonMethods } from "./actionBtnAndModal/actionBtn";
import { csDom } from "./csDOM";
import { formMethods } from "./formInsertMethods";
import { setState as stateManager } from "./setState";
import {
	messageType,
	notifyToast,
	cleanupAll,
	emitCustomEvent,
} from "../utils";
import { CustomEvents } from "./customEvents";
import { actionModalStore } from "./actionBtnAndModal/actionModalStore";
import { generateSHA256Hash } from "auxie-shared";

// ======================================================
// CONTENT SCRIPT APP
// Central controller for state, messaging, DOM & cleanup
// ======================================================
const csApp = {
	// ==================================================
	// STATE
	// Holds runtime data and UI flags
	// ==================================================
	state: {
		latestFormData: null as FormDataInterface | null,
		phone: null as string | null,
		payloadHash: null as string | null,
		fileName: null as string | null,

		ui: {
			customMessage: "default message",
			shouldShowError: false,
			isDataAvailable: false,
			shouldShowActionBtn: false,
		},
	} as Partial<CsState>,

	// ==================================================
	// STATE ACTIONS
	// Mutates state through controlled methods
	// ==================================================
	stateAction: {
		// Update only UI portion of state
		updateUI(ui: Partial<CsState["ui"]>): void {
			csApp.setState({ ui });
		},

		// Triggered when any payload data is loaded from the bgscript
		//latests formData contains all loaded payload from history or new data
		onDataLoaded(data: FormDataInterface, uiOverride?: Partial<CsState["ui"]>) {
			csApp.setState({
				latestFormData: data,
				ui: {
					isDataAvailable: true,
					shouldShowActionBtn: true,
					shouldShowError: false,
					customMessage: "New data loaded",
					...uiOverride,
				},
			});
			if (data.imageFileHash) {
				csApp.state.payloadHash = data.imageFileHash;
			}

			// Sync phone and image to modal store if present
			if (data.phoneNumber) {
				actionModalStore.setPhoneNumber(data.phoneNumber, "onDataLoaded");
			}
			if (data.imageFile) {
				actionModalStore.setImageBuffer(data.imageFile, "onDataLoaded");
			}
		},

		// Handles generator iterator result from background
		handleGeneratorResult(
			result: GeneratorResultInterface<FormDataInterface>,
			eventName?: string
		): void {
			if (!result || result.done === true) {
				throw new Error("no data available");
			}

			csApp.stateAction.onDataLoaded(result.value);

			// Optionally emit event for UI navigation
			if (eventName) {
				emitCustomEvent({ eventName, payload: result });
			}
		},

		// ==================================================
		// FORM INTERACTION
		// Routes input/select handling to formMethods
		// ==================================================
		onFormInteraction(e: Event): void {
			const data = csApp.state.latestFormData;
			if (!data) {
				csApp.stateAction.updateUI({
					customMessage: "Start data fetching sequence",
					shouldShowError: true,
				});
				return;
			}

			const target = e.target as HTMLElement;
			if (!target) return;

			if (target.tagName === "INPUT") {
				const input = target as HTMLInputElement;
				input.type === "file"
					? formMethods.handleFileInput(input)
					: formMethods.handleTextInput(input, data);
				return;
			}

			if (target.tagName === "SELECT") {
				formMethods.handleSelect(target as HTMLSelectElement, data.course);
			}
		},
	},

	// ==================================================
	// MESSAGING
	// Background communication + emitted DOM events
	// ==================================================
	messaging: {
		// Background channel
		cs: oneTimeMsgFactory("cs"),

		// ------------------------------
		// Background Handlers
		// ------------------------------
		handleMessage(message: ExtensionMessageInterface): void {
			const result =
				message.payload as GeneratorResultInterface<FormDataInterface>;
			csApp.stateAction.handleGeneratorResult(result);
		},
		//sends message to the bgscript downloadHelper
		//to download an image
		//init by downloadbtn in actionModal
		downloadImage(payload: { imageFile: string; phone: string }): void {
			csApp.messaging.cs.messageBackgroundScript({
				message: { type: messageType.startDownload, payload },
				errorCb(error) {
					csApp.stateAction.updateUI({
						shouldShowError: true,
						customMessage: error.message as string,
					});
				},
				successCb(response) {
					csApp.stateAction.updateUI({
						shouldShowError: false,
						customMessage: `image for ${payload.phone} downloaded successfully`,
					});
				},
			});
		},

		//this receives the next data from the response list,
		// the response list returns a an array
		//and some method uses generators to send it one per time the opp is getPrevious
		//consumed by the actionModal
		//populates the data state
		getNextData(): void {
			csApp.messaging.cs.messageBackgroundScript({
				message: { type: messageType.getNextEnrol },
				errorCb(error) {
					csApp.stateAction.updateUI({
						customMessage: error.message as string,
						shouldShowError: true,
						isDataAvailable: false,
					});
					emitCustomEvent({ eventName: CustomEvents.disableNextBtn });
				},
				successCb(response) {
					const result =
						response.data as GeneratorResultInterface<FormDataInterface>;
					csApp.stateAction.handleGeneratorResult(
						result,
						CustomEvents.onRecieveNextEnrolData
					);
				},
			});
		},

		getPrevData(): void {
			csApp.messaging.cs.messageBackgroundScript({
				message: { type: messageType.getPrevEnrol },
				errorCb(error) {
					csApp.stateAction.updateUI({
						customMessage: error.message as string,
						shouldShowError: true,
						isDataAvailable: false,
					});
					emitCustomEvent({ eventName: CustomEvents.disablePrevBtn });
				},
				successCb(response) {
					const result =
						response.data as GeneratorResultInterface<FormDataInterface>;
					csApp.stateAction.handleGeneratorResult(
						result,
						CustomEvents.onRecievePrevEnrolData
					);
				},
			});
		},

		updateData(payload: UpdateEnrolStatusPayloadInterface) {
			csApp.messaging.cs.messageBackgroundScript({
				message: { type: messageType.updateData, payload },
				errorCb(error) {
					csApp.stateAction.updateUI({
						customMessage: error.message as string,
						shouldShowError: true,
					});
				},
				successCb(response) {
					csApp.stateAction.updateUI({
						customMessage: `status for ${payload.phoneNumber} updated`,
						shouldShowError: false,
					});
				},
			});
		},

		// ------------------------------
		// Emitted Custom Events
		// Pure DOM-based state updates
		// ------------------------------
		emittedMessage: {
			receivePhone(phone: string) {
				if (!phone) return;

				csApp.setState({
					phone,
					ui: { customMessage: "received phone number" },
				});
			},

			//it receives the image uploaded from the input file
			//from formInsertMethods
			//and the filename
			//
			async receiveImageFileName(imageFileName: string, imageFile: Blob) {
				const payloadHash = csApp.state.payloadHash;
				if (!imageFileName) return;

				const localHash: string = await generateSHA256Hash(imageFile);

				if (localHash !== payloadHash) {
					console.log("i ran hash");
					csApp.setState({
						ui: {
							customMessage: "this image is not valid",
							shouldShowError: true,
						},
					});
				} else {
					csApp.setState({
						fileName: imageFileName,
						ui: {
							customMessage: "received image file",
							shouldShowError: false,
						},
					});
				}
			},
		},

		// Register background sync listener
		init(): void {
			csApp.messaging.cs.onMessageSync({
				onSyncCb: csApp.messaging.handleMessage,
			});
		},
	},

	// ==================================================
	// RENDER
	// UI reactions based on state
	// ==================================================
	render(): void {
		const ui = csApp.state.ui || {};
		const appState = csApp.state;

		notifyToast({
			type: ui.shouldShowError ? "error" : "success",
			text: ui.customMessage || "an error occured",
		});

		if (ui.shouldShowActionBtn) actionButtonMethods.initBtn();

		// Validate file name vs phone match
		if (appState.fileName && appState.phone) {
			if (appState.fileName !== appState.phone) {
				notifyToast({
					type: "error",
					text: "filename and phone is not a match",
				});
			}
		}
	},

	// ==================================================
	// STATE SETTER
	// Centralized state mutation
	// ==================================================
	setState(updatedState: Partial<CsState>): void {
		stateManager(csApp.state, updatedState, csApp.render);
	},

	// ==================================================
	// DOM EVENTS
	// Binds form + custom event listeners
	// ==================================================
	initDOMEvents(): void {
		//this auto populates the form field when the target elem
		// is an input or select
		csDom.form?.addEventListener("dblclick", (e) =>
			csApp.stateAction.onFormInteraction(e)
		);

		//this works on inputs file it detects when its value has changed
		csDom.form?.addEventListener("change", (e) =>
			csApp.stateAction.onFormInteraction(e)
		);

		//this is ev is init from actionModal download btn
		//this sends the imageBlob to bg to download it or die trying
		document.addEventListener(CustomEvents.initDownload, (e: Event) => {
			const ev = e as CustomEvent<{ imageFile: string; phone: string }>;
			if (ev.detail) csApp.messaging.downloadImage(ev.detail);
		});

		//this events is init from actionModal
		//the user can traverse forward or backward based on
		//available data which could be served from history
		//or refetched
		document.addEventListener(CustomEvents.getNext, () =>
			csApp.messaging.getNextData()
		);
		document.addEventListener(CustomEvents.getPrev, () =>
			csApp.messaging.getPrevData()
		);

		//this code is emitted from formInsertMethods,
		//helps me in validating user data
		//because the image is saved as phoneNumber.mimetype

		document.addEventListener(CustomEvents.onPhoneNumberEmit, (e: Event) => {
			const ev = e as CustomEvent<{ phone: string }>;
			if (ev.detail)
				csApp.messaging.emittedMessage.receivePhone(ev.detail.phone);
		});

		//the imageFileName is how it was stored in the backend
		//e.g phoneNumber.png
		//so with the listener i can check if it rhymes with the phoneNumber
		//provided making it unique to that user gotten from formInsertMethods
		document.addEventListener(CustomEvents.onImageFileNameEmit, (e: Event) => {
			const ev = e as CustomEvent<{ imageFileName: string; imageFile: any }>;
			if (ev.detail)
				csApp.messaging.emittedMessage.receiveImageFileName(
					ev.detail.imageFileName,
					ev.detail.imageFile
				);
		});

		document.addEventListener(
			CustomEvents.onRegistrationStatusEmit,
			function (e: Event) {
				const ev = e as CustomEvent<UpdateEnrolStatusPayloadInterface>;
				if (ev.detail) {
					csApp.messaging.updateData(ev.detail);
				}
			}
		);
	},

	// ==================================================
	// CLEANUP
	// Resets UI, form, extension elements, and images
	// ==================================================
	cleanup(): void {
		const elems = [csDom.actionBtn, csDom.nextBtn, csDom.actionModal];
		elems.forEach((elem) =>
			document.getElementById(elem?.id as string)?.remove()
		);

		cleanupAll(".ext");

		cleanupAll(".ext-pill", function (pill) {
			const input = pill.previousElementSibling as
				| HTMLInputElement
				| HTMLSelectElement;
			if (input) input.value = "";
		});

		if (csDom.form) csDom.form.reset();

		// Clear passport image preview
		document.querySelectorAll("img").forEach((img) => {
			if ((img.alt || "").toLowerCase().includes("passport")) {
				img.src = "";
				img.removeAttribute("srcset");
			}
		});
	},

	// ==================================================
	// INIT
	// Entry point
	// ==================================================
	init() {
		csApp.cleanup();
		csApp.messaging.init();
		csApp.initDOMEvents();
	},
};

csApp.init();
