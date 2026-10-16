import { domElems } from "./domElems";
import $ from "jquery";

export const tabController = {
	activeBtnId: "",
	activeContentId: "",

	// --- EVENTS ---
	initEvent: function (): void {
		domElems.initBtn.on("click", function () {
			tabController.activate($(this));
		});

		domElems.recvdBtn.on("click", function () {
			tabController.activate($(this));
		});
	},

	// --- METHODS ---
	activate: function ($btn: JQuery<HTMLElement>): void {
		const btnId = $btn.attr("id");
		if (!btnId || btnId === this.activeBtnId) return;

		if (this.activeBtnId) $("#" + this.activeBtnId).removeClass("active");
		if (this.activeContentId) $("#" + this.activeContentId).removeClass("show");

		const contentId = btnId.replace("Btn", "Contents");
		$btn.addClass("active");
		$("#" + contentId).addClass("show");

		this.activeBtnId = btnId;
		this.activeContentId = contentId;
	},
};
