import { oneTimeMsgFactory } from "xtension-messenger";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";

import { FormDataInterface } from "../interfaces";
import { messageType } from "../utils";

const bg = oneTimeMsgFactory("bg");

// Central app
const bgScript = function () {
	const handleMessage = async function (message: ExtensionMessageInterface) {
		try {
			switch (message.type) {
				case messageType.getData: {
					const receivedRecords = await requestRecordsFromApi();
					await sendDataToCS(receivedRecords);
					return receivedRecords;
				}

				default:
					throw new Error("no handler found for this message type");
			}
		} catch (err: any) {
			console.error(err.message);
			throw err;
		}
	};

	const startListening = function () {
		bg.onMessageAsync({
			onAsyncCb: handleMessage,
		});
	};

	return { startListening };
};

bgScript().startListening();

// fake records until the real api request is wired in
function requestRecordsFromApi(): Promise<Partial<FormDataInterface>[]> {
	return new Promise(function (resolve) {
		// 3 second delay mimics the real request
		setTimeout(function () {
			const fakeRecords: Partial<FormDataInterface>[] = [];

			for (let recordNumber = 1; recordNumber <= 3; recordNumber++) {
				fakeRecords.push({ phoneNumber: "080000000" + recordNumber });
			}

			resolve(fakeRecords);
		}, 3000);
	});
}

function sendDataToCS(receivedRecords: Partial<FormDataInterface>[]) {
	return new Promise(function (resolve) {
		bg.messageContentScript({
			tabQueryProps: {
				url: "https://cbt-app-fu42.onrender.com/consumption.html*",
			},

			messageToSend: { type: messageType.getData, payload: receivedRecords },
			successCb(success) {
				console.log("data successfully sent to cs ");
				resolve(success);
			},
			errorCb(error) {
				console.log(error.errorMessage);
				console.log("failed to send");
				resolve(error);
			},
		});
	});
}
