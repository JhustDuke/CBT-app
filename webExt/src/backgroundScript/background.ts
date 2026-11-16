import { oneTimeMsgFactory } from "xtension-messenger";
import { ExtensionMessageInterface } from "xtension-messenger/dist/types/interfaces";
import {
	BASE_URL,
	GET_PROCESSING_PATH,
	UPDATE_STATUS_PATH,
} from "../../../endpoints";

import { FormDataInterface } from "../interfaces";
import { messageType } from "../utils";

const bg = oneTimeMsgFactory("bg");

// what the modal reports for one candidate
interface ResultToReportInterface {
	phone: string;
	status: string;
	errorReason: string;
}

// one row as the backend sends it
interface BackendCandidateRowInterface {
	fullName: string;
	email: string;
	phoneNumber: string;
	course: string;
	nin: string;
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

// backend row e.g. { phoneNumber: "08012345678" } becomes the cs record shape { phone: "08012345678" }
const convertBackendRowsToFormRecords = function (
	backendRows: BackendCandidateRowInterface[]
): FormDataInterface[] {
	const formRecords: FormDataInterface[] = [];

	for (let rowIndex = 0; rowIndex < backendRows.length; rowIndex++) {
		const backendRow = backendRows[rowIndex];

		formRecords.push({
			fullName: backendRow.fullName,
			email: backendRow.email,
			phone: backendRow.phoneNumber,
			course: backendRow.course,
			nin: backendRow.nin,
		});
	}

	return formRecords;
};

const requestRecordsFromApi = async function (): Promise<FormDataInterface[]> {
	const response = await fetch(BASE_URL + GET_PROCESSING_PATH);
	const responseBody = await response.json();

	if (!response.ok) {
		throw new Error(responseBody.message);
	}

	return convertBackendRowsToFormRecords(responseBody);
};

const saveResultToApi = async function (
	resultToReport: ResultToReportInterface
): Promise<boolean> {
	//modal status e.g. "error" becomes the backend's ERROR, anything else becomes COMPLETED
	const registrationStatus =
		resultToReport.status.toLowerCase() === "error" ? "ERROR" : "COMPLETED";

	const response = await fetch(BASE_URL + UPDATE_STATUS_PATH, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		//backend only wants a message when the status is ERROR (undefined is dropped from the json)
		body: JSON.stringify({
			phoneNumber: resultToReport.phone,
			registrationStatus,
			registrationMessage:
				registrationStatus === "ERROR" ? resultToReport.errorReason : undefined,
		}),
	});

	const responseBody = await response.json();

	if (!response.ok) {
		throw new Error(responseBody.message);
	}

	return true;
};

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
