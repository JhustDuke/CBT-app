import { describe, it, expect, vi, beforeEach } from "vitest";
import { updateEnrolStatusHandler } from "../../src/routes/patch";
import { model_updateEnrolStatus } from "../../src/models";

vi.mock("../../src/models", function () {
	return {
		model_updateEnrolStatus: vi.fn(),
	};
});

const res: any = {
	response: vi.fn(function () {
		return {
			code: vi.fn(),
		};
	}),
};

describe("updateEnrolStatusHandler", function () {
	beforeEach(function () {
		vi.clearAllMocks();
	});

	it("calls res.response with error when candidateId is missing", async function () {
		const req: any = { payload: {} };

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "phoneNumber is required",
		});
	});

	it("calls res.response with error when phoneNumber format is wrong", async function () {
		const req: any = { payload: { phoneNumber: "4", status: "processing" } };

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "phoneNumber format is wrong",
		});
	});

	it("calls res.response with error when status is missing", async function () {
		const req: any = { payload: { phoneNumber: 4 } };

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "status is required",
		});
	});

	it("calls res.response with error when errorMessage is missing and status is error", async function () {
		const req: any = { payload: { phoneNumber: 4, status: "error" } };

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "errorMessage is required when status is error",
		});
	});

	it("returns success when enrol status updates successfully", async function () {
		const req: any = {
			payload: {
				phoneNumber: 4,
				status: "processing",
			},
		};

		(model_updateEnrolStatus as any).mockResolvedValue(undefined);

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "Enrol status updated",
		});
	});

	it("returns error when candidate is not found", async function () {
		const req: any = {
			payload: {
				phoneNumber: 4,
				status: "processing",
			},
		};

		(model_updateEnrolStatus as any).mockRejectedValue(
			new Error("candidate not found")
		);

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "candidate not found",
		});
	});

	it("returns error when update fails unexpectedly", async function () {
		const req: any = {
			payload: {
				candidateId: 4,
				status: "processing",
			},
		};

		(model_updateEnrolStatus as any).mockRejectedValue(
			new Error("failed to update candidate info")
		);

		await updateEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "failed to update candidate info",
		});
	});
});
