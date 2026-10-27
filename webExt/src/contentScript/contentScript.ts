import { oneTimeMsgFactory } from "xtension-messenger";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";

import {
	FormDataInterface,
	GeneratorResultInterface,
	CsState,
	UpdateEnrolStatusPayloadInterface,
} from "../interfaces";

import {
	messageType,
	notifyToast,
	cleanupAll,
	emitCustomEvent,
} from "../utils";

import { showActionButton } from "./actionBtnAndModal/actionBtn";

const cs = oneTimeMsgFactory("cs");

// Central app

const ContentScript = function () {
	const startListening = function () {
		cs.onMessageSync({
			validateMessage(message) {
				return message.type === messageType.getData;
			},

			onSyncCb(message: ExtensionMessageInterface) {
				console.log("CS: message received", message);

				const receivedRecords = message.payload as Partial<FormDataInterface>[];

				console.log("CS: records received", receivedRecords);

				showActionButton();

				return `received ${receivedRecords.length} records`;
			},
		});

		console.log("CS: listener registered");
	};

	return { startListening };
};

ContentScript().startListening();

function createStateFactory() {
	return {};
}

function createRenderer() {
	return {};
}

function createEventOrchestrator() {
	return {};
}

function createStateActions() {
	return {};
}

function createMessaging() {
	// e.g. expectedMessageType = "exampleType"
	const listenForMsgs = function (listenerOptions: {
		expectedMessageType: string;
		messageHandler: (message: ExtensionMessageInterface) => unknown;
	}) {
		cs.onMessageSync({
			validateMessage(message) {
				return message.type === listenerOptions.expectedMessageType;
			},
			onSyncCb(message) {
				return listenerOptions.messageHandler(message);
			},
		});
	};

	return { listenForMsgs };
}

function createFormController() {
	return {};
}

function createEventController() {
	return {};
}

function createCleanup() {
	return {};
}
