import $ from "jquery";

import { oneTimeMsgFactory } from "xtension-messenger";

const popup = oneTimeMsgFactory("popup");

$("button").click(function () {
	popup.messageBackgroundScript({
		message: { type: "wake-up" },
		errorCb(error) {
			console.log(error);
		},
		successCb(response) {
			console.log(response);
		},
	});
});
