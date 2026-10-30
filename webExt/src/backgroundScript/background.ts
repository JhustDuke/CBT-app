import { oneTimeMsgFactory } from "xtension-messenger";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";

import { FormDataInterface } from "../interfaces";
import { messageType } from "../utils";

const bg = oneTimeMsgFactory("bg");

// what the modal reports for one candidate
interface ResultToReportInterface {
	phone: string;
	status: string;
	errorReason: string;
}

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

				case messageType.markCandidate: {
					const resultToReport = message.payload as ResultToReportInterface;
					await saveResultToApi(resultToReport);
					return true;
				}

				default:
					throw new Error(
						`bg has no handler for this message type,${message.type}`
					);
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
function requestRecordsFromApi(): Promise<FormDataInterface[]> {
	return new Promise(function (resolve) {
		// 3 second delay mimics the real request
		setTimeout(function () {
			const fakeRecords: FormDataInterface[] = [];

			for (let recordNumber = 1; recordNumber <= 3; recordNumber++) {
				fakeRecords.push({
					fullName: "Test Candidate " + recordNumber,
					email: "candidate" + recordNumber + "@example.com",
					phone: "0900000000" + recordNumber,
					course: "Computer Science",

					imageFileHash: "fakehash" + recordNumber,
					// tiny 1x1 placeholder image as base64
					imageFile:
						"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
				});
			}

			resolve(fakeRecords);
		}, 3000);
	});
}

// fake save until the real api request is wired in; error status mimics a failed save
function saveResultToApi(
	resultToReport: ResultToReportInterface
): Promise<boolean> {
	return new Promise(function (resolve, reject) {
		// 3 second delay mimics the real request
		setTimeout(function () {
			if (resultToReport.status === "error") {
				reject(new Error("mock bg failed to save the result"));
				return;
			}
			resolve(true);
		}, 3000);
	});
}

function sendDataToCS(receivedRecords: FormDataInterface[]) {
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
