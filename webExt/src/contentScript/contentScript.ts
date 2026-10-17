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

const cs = oneTimeMsgFactory("cs");

cs.onMessageSync({
	onSyncCb(message) {
		console.log(message);

		return "i received your message ";
	},
});
