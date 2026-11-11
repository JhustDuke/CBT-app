import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_getEnrolStatus } from "../../models";

/* ===================== GET ===================== */
export const getEnrolStatusRoute: ServerRoute = {
	options: {
		cors: {
			origin: ["*"],
			headers: ["Content-Type", "application/json"],
		},
	},
	path: "/checkEnrolStatus",
	method: "GET",
	handler: checkEnrolStatusEnrolStatusHandler,
};

export async function checkEnrolStatusEnrolStatusHandler(
	req: Request,
	res: ResponseToolkit
) {
	const candidatePhoneNumber: number = Number(req.query.candidatePhoneNumber);

	if (!candidatePhoneNumber || Number.isNaN(candidatePhoneNumber)) {
		return res
			.response({ message: "candidate phone number is required" })
			.code(400);
	}

	const status = await model_getEnrolStatus(candidatePhoneNumber);

	if (!status) {
		return res.response({ message: "Status not found" }).code(404);
	}

	return res.response(status).code(200);
}
