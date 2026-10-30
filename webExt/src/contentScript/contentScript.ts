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

import { showActionButton, actionModalStore } from "./actionBtnAndModal";

const cs = oneTimeMsgFactory("cs");

// Central app

const ContentScript = function () {
	const renderer = createRenderer();
	const cleanup = createCleanup();

	const handleMessage = function (message: ExtensionMessageInterface) {
		switch (message.type) {
			case messageType.getData: {
				const receivedRecords = message.payload as FormDataInterface[];

				console.log("CS: records received", receivedRecords);

				// Store first, so the modal can read the records the moment the button shows.
				actionModalStore.setRecords(receivedRecords);
				renderer.showDataReceived();

				console.log(`received ${receivedRecords.length} records`);
				return true;
			}

			default:
				throw new Error(
					`cs has no handler for this message type: ${message.type}`
				);
		}
	};

	const start = function () {
		cleanup.run();

		cs.onMessageAsync({
			onAsyncCb: handleMessage,
		});

		console.log("CS: listener registered");
	};

	return { start };
};

ContentScript().start();

// Only touches the screen: toast and action button.
function createRenderer() {
	const showDataReceived = function () {
		notifyToast({ type: "success", text: "gotten data", timeoutMs: 6000 });
		showActionButton();
	};

	return { showDataReceived };
}

function createCleanup() {
	const run = function () {
		cleanupAll(
			'[class^="auxie-"], [class*=" auxie-"], [id^="auxie"], [name^="auxie"]'
		);
	};

	return { run };
}
