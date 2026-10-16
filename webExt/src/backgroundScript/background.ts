import { oneTimeMsgFactory } from "xtension-messenger";
import { bgFetchMethods } from "./bgFetchMethods";
import { messageType as defaultMessageType, messageType } from "../utils";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";
import { downloadImage } from "./downloadHelper";
import { UpdateEnrolStatusPayloadInterface } from "../interfaces";

const bg = oneTimeMsgFactory("bg");

export const bgMessaging = {
	initMsg: function (): void {
		bg.onMessageAsync({
			onAsyncCb: bgMessaging.handleFetch,
		});
	},
	handleFetch: async function (message: ExtensionMessageInterface) {
		console.log("MESSAGE HIT", message);
		try {
			let data;

			switch (message.type) {
				case messageType.startCrawler:
					data = await bgFetchMethods.start();
					await bgMessaging.sendToContent(data);
					return data;

				case messageType.getNextEnrol:
					data = await bgFetchMethods.next();
					await bgMessaging.sendToContent(data);
					return data;

				case messageType.getPrevEnrol:
					data = bgFetchMethods.prev();
					await bgMessaging.sendToContent(data);
					return data;

				case messageType.startDownload: {
					const payload = message.payload as any;
					const result = await downloadImage(payload.imageFile, payload.phone);
					return result;
				}
				case messageType.updateData: {
					const payload = message.payload as UpdateEnrolStatusPayloadInterface;
					const result = await bgFetchMethods.updateBackendData({
						...payload,
					});
					return result;
				}

				default:
					throw new Error("no handler found for this message type");
			}
		} catch (err: any) {
			console.error(err.message);
			throw err;
		}
	},
	sendToContent: function <T>(
		payload: T,
		type: string = defaultMessageType.getBackendData,
		tabQueryProps = { active: true }
	) {
		return new Promise(function (resolve) {
			bg.messageContentScript({
				message: { type, payload },
				tabQueryProps,
				successCb: function (msg) {
					resolve(msg);
				},
				errorCb: function (err: unknown) {
					resolve(err);
				},
			});
		});
	},
};

bgMessaging.initMsg();
