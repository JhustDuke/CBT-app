import $ from "jquery";
import { checkDomElems } from "../utils";
import { domElems } from "./domElems";
import { tabController } from "./tabController";
import { fetchBtnMethods } from "./popupfetchDataMethod";

$(function () {
	try {
		checkDomElems(domElems);

		// Attach all events first
		tabController.initEvent();
		fetchBtnMethods.initEvent();

		// Default tab
		tabController.activate(domElems.defaultBtn);
	} catch (err: any) {
		console.error(err.message);
	}
});
