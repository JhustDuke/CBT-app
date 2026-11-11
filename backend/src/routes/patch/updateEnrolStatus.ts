import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_updateEnrolStatus } from "../../models";
import { UpdateEnrolStatusInterface } from "../../interfaces";
import { validateUpdatePayload } from "../../utils";

export const updateEnrolStatusRoute: ServerRoute = {
	path: "/updateEnrolStatus",
	method: "PATCH",
	options: {
		cors: {
			origin: ["*"],
			headers: ["Content-Type", "application/json"],
		},
	},
	handler: updateEnrolStatusHandler,
};

export async function updateEnrolStatusHandler(
	req: Request,
	res: ResponseToolkit
) {
	const payload = req.payload as UpdateEnrolStatusInterface;

	try {
		// Validate and sanitize payload
		validateUpdatePayload(payload);

		// Update database
		const updatedData = await model_updateEnrolStatus(payload);

		return res
			.response({ message: "Enrol status updated", updatedData })
			.code(200);
	} catch (err: any) {
		return res.response({ message: err.message }).code(400);
	}
}

// -------------------------
// Helper: validate payload
// -------------------------
