import { Request, ResponseToolkit, ServerRoute } from "@hapi/hapi";
import Boom from "@hapi/boom";
import { dropTable } from "../../dbConfig";

export const deleteEnrolTable: ServerRoute = {
	path: "/deleteTable",
	method: "DELETE",
	options: {
		cors: {
			origin: ["*"],
			headers: ["Content-Type"],
		},
	},
	handler: deleteHandler,
};

async function deleteHandler(req: Request, res: ResponseToolkit) {
	const deleteQuery = req.query.delete;
	console.log("deleteQ:", deleteQuery);
	if (!deleteQuery) {
		throw Boom.badData();
	}

	if (deleteQuery.toLowerCase() !== "drop_table") {
		throw Boom.badRequest("wrong req format, missing required params");
	}
	try {
		await dropTable();
		return res.response({ message: "table reset successful" }).code(200);
	} catch (err: any) {
		throw Boom.notImplemented(err.message || "table reset unsuccessful");
	}
}
