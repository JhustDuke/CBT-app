import { oneTimeMsgFactory } from "xtension-messenger";

import { UpdateEnrolStatusPayloadInterface } from "../interfaces";

const bg = oneTimeMsgFactory("bg");

bg.messageContentScript({
	tabQueryProps: { active: true, currentWindow: true },

	message: { type: "exampleType", payload: {} },
	successCb() {
		console.log("send successfulyl");
	},
	errorCb(error) {
		console.log(error);
		console.log("failed to send");
	},
});
bg.onMessageSync({
	onSyncCb() {
		return "received message from popup";
	},
});
