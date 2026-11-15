import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_getEnrolStatus } from "../../models";

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
	//kept as a string so the leading zero stays e.g. "08012345678"
	const candidatePhoneNumber: string = String(
		req.query.candidatePhoneNumber || ""
	);

	if (!candidatePhoneNumber) {
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
