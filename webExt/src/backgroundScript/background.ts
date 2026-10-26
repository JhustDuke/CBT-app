import { oneTimeMsgFactory } from "xtension-messenger";

import { UpdateEnrolStatusPayloadInterface } from "../interfaces";

const bg = oneTimeMsgFactory("bg");
console.log("helloddd ....");

bg.onMessageSync({
	validateMessage(message) {
		return message.type === "UP";
	},
	onSyncCb() {
		bg.messageContentScript({
			tabQueryProps: {
				url: "https://cbt-app-fu42.onrender.com/consumption.html*",
			},

			messageToSend: { type: "exampleType", payload: {} },
			successCb(success) {
				success.data?.map(function (item) {});
				console.log("send successfulyl");
			},
			errorCb(error) {
				console.log(error.errorMessage);
				console.log("failed to send");
			},
		});
		return "this is the data";
	},
});
