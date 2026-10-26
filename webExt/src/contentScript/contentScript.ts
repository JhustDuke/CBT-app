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

import {
	messageType,
	notifyToast,
	cleanupAll,
	emitCustomEvent,
} from "../utils";

import { showActionButton } from "./actionBtnAndModal/actionBtn";

const cs = oneTimeMsgFactory("cs");

cs.onMessageSync({
	onSyncCb(message) {
		console.log("message", message);
		return "i received your message ";
	},
});

document.addEventListener("dblclick", function () {
	cs.messageBackgroundScript({
		messageToSend: { type: "UP" },
		errorCb(error) {
			console.log("error", error.errorMessage);
		},
		successCb(response) {
			console.log("response", response);
		},
	});
	showActionButton();
});

///////////
