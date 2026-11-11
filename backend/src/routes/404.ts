// src/routes/notFound.ts
import { ServerRoute } from "@hapi/hapi";

export const notFoundRoute: ServerRoute = {
	method: "*",
	path: "/{any*}",
	handler: function (_req, h) {
		return h
			.response({ status: false, message: "Route not found" })
			.code(404);
	},
};
