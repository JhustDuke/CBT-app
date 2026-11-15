import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import { model_addCandidate } from "../../models";
import { NewEnrolPayloadInterface } from "../../interfaces";
import { validateEnrolPayload } from "../../utils";
import Boom from "@hapi/boom";

export const enrolRoute: ServerRoute = {
	path: "/enrolCandidate",
	method: "POST",
	options: {
		payload: {
			parse: true,
			output: "data",
			multipart: true,
			maxBytes: 2 * 1024 * 1024, // 2MB limit
		},
		cors: {
			origin: ["*"],
			headers: ["Content-Type"],
		},
	},
	handler: enrolHandler,
};

export async function enrolHandler(req: Request, res: ResponseToolkit) {
	if (!req.payload) {
		throw Boom.badData("missing required data");
	}

	const { course, fullName, phoneNumber, nin, email } =
		req.payload as NewEnrolPayloadInterface;
	try {
		//this validates/sanitizes the enrol payload for missing fields and wrong fields inputs
		validateEnrolPayload(req.payload as any);

		//any error from here is caught by the global error handler at the server file level

		const newCandidate = await model_addCandidate({
			fullName,
			course,
			phoneNumber,
			nin,
			email,
		});

		return res
			.response({
				status: true,
				newCandidate,
			})
			.code(201);
	} catch (e: any) {
		//23505 is the postgres code for a value that already exists in a unique column
		if (e.code === "23505") {
			//e.constraint is the constraint name e.g. enrolment_table_phonenumber_key
			if (e.constraint && e.constraint.includes("phonenumber")) {
				throw Boom.conflict("this phone number is already registered");
			}
			throw Boom.conflict("this candidate is already registered");
		}
		throw Boom.badRequest(e.message || "could not add candidate");
	}
}
