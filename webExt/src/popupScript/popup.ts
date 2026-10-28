import $ from "jquery";
import { messageType } from "../utils";
import { FormDataInterface } from "../interfaces";
import { oneTimeMsgFactory } from "xtension-messenger";

const popup = oneTimeMsgFactory("popup");

// hides every part of the outcome box
function hideEverythingInOutcomeBox() {
	$("#fetchPlaceholder").addClass("d-none");
	$("#fetchLoading").addClass("d-none");
	$("#fetchResult").addClass("d-none");
}

$("#fetchDataBtn").click(function () {
	// 1. disable the button
	$("#fetchDataBtn").prop("disabled", true);

	// 2. show the spinner
	hideEverythingInOutcomeBox();
	$("#fetchLoading").removeClass("d-none");

	popup.messageBackgroundScript({
		messageToSend: { type: messageType.getData },
		successCb(response) {
			const receivedRecords = response.data as FormDataInterface[];

			// stop the spinner
			hideEverythingInOutcomeBox();

			// enable the button
			$("#fetchDataBtn").prop("disabled", false);

			// show the cards
			$("#receivedCount").text(
				"Received " + receivedRecords.length + " records"
			);
			const cardsContainer = $("#receivedCards").empty();
			for (const record of receivedRecords) {
				const card = $('<div class="card p-2"></div>');
				for (const [key, value] of Object.entries(record)) {
					card.append($("<div></div>").text(`${key}: ${value}`));
				}
				cardsContainer.append(card);
			}
			$("#fetchResult").removeClass("d-none");
		},
		errorCb(error) {
			// stop the spinner
			hideEverythingInOutcomeBox();

			// enable the button
			$("#fetchDataBtn").prop("disabled", false);

			// placeholder text becomes the error message, in red
			$("#fetchPlaceholder")
				.text(error.errorMessage ?? "something went ")
				.removeClass("text-muted")
				.addClass("text-danger")
				.removeClass("d-none");
		},
	});
});
