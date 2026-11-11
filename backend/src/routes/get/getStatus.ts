import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_getEnrolStatus } from "../../models";

/* ===================== GET ===================== */
export const getEnrolStatusRoute: ServerRoute = {
	options: {
		cors: {
			origin: ["*"],
			headers: ["Content-Type"],
		},
	},
	path: "/enrolment-status",
	method: "GET",
	handler: checkEnrolStatusHandler,
};

export async function checkEnrolStatusHandler(
	req: Request,
	res: ResponseToolkit
) {
	const candidatePhoneNumber: number = Number(req.query.candidatePhoneNumber);

	if (!candidatePhoneNumber || Number.isNaN(candidatePhoneNumber)) {
		return res
			.response({ message: "candidate phone number is required" })
			.code(400);
	}

	try {
		const status = await model_getEnrolStatus(candidatePhoneNumber);

		if (!status) {
			return res.response({ message: "data not found" }).code(404);
		}

		return res.response(status).code(200);
	} catch (err: any) {
		console.error("❌ Failed to get enrol status:", err.message);
		return res.response({ message: "Failed to get enrol status" }).code(500);
	}
}
