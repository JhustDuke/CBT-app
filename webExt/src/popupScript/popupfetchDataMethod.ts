import { oneTimeMsgFactory } from "xtension-messenger";
import { messageType } from "../utils";
import { domElems } from "./domElems";

const popup = oneTimeMsgFactory("popup");

export const fetchBtnMethods = {
	// --- EVENTS ---
	initEvent: function (): void {
		domElems.fetchBtn.on("click", fetchBtnMethods.sendMessage);
	},

	// --- METHODS ---
	showLoading: function () {
		domElems.fetchBtn
			.prop("disabled", true)
			.html('<span class="spinner-border spinner-border-sm me-2"></span>');
	},

	reset: function () {
		domElems.fetchBtn
			.prop("disabled", false)
			.addClass("green")
			.text("fetch data");
	},

	showSuccess: function () {
		console.log("fe");
		domElems.fetchOutComeDiv.text("data fetched").addClass("green-text");
	},

	sendMessage: function () {
		fetchBtnMethods.showLoading();

		popup.messageBackgroundScript({
			message: {
				type: messageType.startCrawler,
				payload: {
					fetchSize: Number(domElems.fetchSize.val()) || messageType.fetchSize,
				},
			},
			successCb: fetchBtnMethods.onSuccess,
			errorCb: fetchBtnMethods.onError,
		});
	},

	onSuccess: function (msg: unknown) {
		fetchBtnMethods.reset();
		fetchBtnMethods.showSuccess();
		console.log((msg as Record<string, any>).data);
	},

	onError: function (err: any) {
		domElems.fetchOutComeDiv.text(err.message).addClass("red-text");
		console.error(err);
		fetchBtnMethods.reset();
	},
};
