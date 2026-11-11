import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEnrolStatusHandler } from "../../src/routes/get";
import { model_getEnrolStatus } from "../../src/models";

vi.mock("../../src/models", function () {
	return {
		model_getEnrolStatus: vi.fn(),
	};
});

const res: any = {
	response: vi.fn(function () {
		return {
			code: vi.fn(),
		};
	}),
};

describe("getEnrolStatusHandler", function () {
	beforeEach(function () {
		vi.clearAllMocks();
	});

	it("calls res.response with error when phoneNumber is missing", async function () {
		const req: any = { query: {} };

		await getEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "phoneNumber is required",
		});
	});

	it("calls res.response with error when phoneNumber is not a number", async function () {
		const req: any = { query: { phoneNumber: "abc" } };

		await getEnrolStatusHandler(req, res);

		expect(res.response).toHaveBeenCalledWith({
			message: "phoneNumber is required",
		});
	});

	it("calls res.response with not found message when status does not exist", async function () {
		(model_getEnrolStatus as any).mockResolvedValue(null);

		const req: any = { query: { phoneNumber: 10 } };

		await getEnrolStatusHandler(req, res);

		expect(model_getEnrolStatus).toHaveBeenCalledWith(10);
		expect(res.response).toHaveBeenCalledWith({
			message: "Status not found",
		});
	});

	it("calls res.response with enrol status when found", async function () {
		const fakeStatus = { status: "completed" };
		(model_getEnrolStatus as any).mockResolvedValue(fakeStatus);

		const req: any = { query: { phoneNumber: 10 } };

		await getEnrolStatusHandler(req, res);

		expect(model_getEnrolStatus).toHaveBeenCalledWith(10);
		expect(res.response).toHaveBeenCalledWith(fakeStatus);
	});
});
