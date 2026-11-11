import { describe, it, expect, vi, beforeEach } from "vitest";
import { enrolHandler } from "../../src/routes/post";
import { model_enrol } from "../../src/models";
import fs from "fs";

vi.mock("../../src/models", function () {
	return {
		model_enrol: vi.fn(),
	};
});

vi.mock("fs");

const mockRes: any = function () {
	return {
		response: vi.fn(function (payload: any) {
			return {
				code: vi.fn(function (statusCode: number) {
					return { payload, statusCode };
				}),
			};
		}),
	};
};

beforeEach(function () {
	vi.clearAllMocks();
});

describe("POST /enrol", function () {
	it("returns 400 when a required field is missing", async function () {
		const req: any = {
			payload: {
				course: "Math",
				phoneNumber: "08030000000",
			},
		};

		const res = mockRes();
		const result = await enrolHandler(req, res);

		expect(result.statusCode).toBe(400);
		expect(model_enrol).not.toHaveBeenCalled();
	});

	it("renames uploaded passport to phoneNumber.ext", async function () {
		(model_enrol as any).mockResolvedValue({ insertId: 1 });

		const fakeStream = { pipe: vi.fn() };

		const req: any = {
			payload: {
				course: "Math",
				fullName: "John Doe",
				phoneNumber: "08030000000",
				passportHash: "hash",
				passport: {
					hapi: { filename: "photo.png" },
					pipe: fakeStream.pipe,
				},
			},
		};

		const res = mockRes();

		await enrolHandler(req, res);

		expect(fs.createWriteStream).toHaveBeenCalledWith(
			expect.stringContaining("08030000000.png")
		);
	});

	it("pipes the uploaded file stream", async function () {
		(model_enrol as any).mockResolvedValue({ insertId: 1 });

		const fakeStream = { pipe: vi.fn() };

		const req: any = {
			payload: {
				course: "Math",
				fullName: "John Doe",
				phoneNumber: "08030000000",
				passportHash: "hash",
				passport: {
					hapi: { filename: "photo.jpg" },
					pipe: fakeStream.pipe,
				},
			},
		};

		const res = mockRes();
		await enrolHandler(req, res);

		expect(fakeStream.pipe).toHaveBeenCalled();
	});

	it("calls model_enrol with renamed passport", async function () {
		(model_enrol as any).mockResolvedValue({ insertId: 7 });

		const fakeStream = { pipe: vi.fn() };

		const req: any = {
			payload: {
				course: "Math",
				fullName: "John Doe",
				phoneNumber: "08030000000",
				passportHash: "hash",
				passport: {
					hapi: { filename: "pic.jpeg" },
					pipe: fakeStream.pipe,
				},
			},
		};

		const res = mockRes();
		await enrolHandler(req, res);

		expect(model_enrol).toHaveBeenCalledWith(
			expect.objectContaining({
				passport: "08030000000.jpeg",
			})
		);
	});

	it("returns 201 on successful enrol", async function () {
		(model_enrol as any).mockResolvedValue({ insertId: 99 });

		const fakeStream = { pipe: vi.fn() };

		const req: any = {
			payload: {
				course: "Math",
				fullName: "John Doe",
				phoneNumber: "08030000000",
				passportHash: "hash",
				passport: {
					hapi: { filename: "photo.png" },
					pipe: fakeStream.pipe,
				},
			},
		};

		const res = mockRes();
		const result = (await enrolHandler(req, res)) as any;

		expect(result.statusCode).toBe(201);
		expect(result.payload.candidateId).toBe(99);
	});

	it("returns 500 when model_enrol throws", async function () {
		(model_enrol as any).mockRejectedValue(new Error("DB failed"));

		const fakeStream = { pipe: vi.fn() };

		const req: any = {
			payload: {
				course: "Math",
				fullName: "John Doe",
				phoneNumber: "08030000000",
				passportHash: "hash",
				passport: {
					hapi: { filename: "photo.png" },
					pipe: fakeStream.pipe,
				},
			},
		};

		const res = mockRes();
		const result = await enrolHandler(req, res);

		expect(result.statusCode).toBe(500);
	});
});
