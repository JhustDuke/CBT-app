// src/routes/health.ts
import { ServerRoute } from "@hapi/hapi";

export const baseRoute: ServerRoute = {
	path: "/",
	method: "GET",
	options: {
		cors: {
			origin: ["*"],
		},
	},
	handler: (_req, h) =>
		h.response({ status: true, message: "AUXIE IS ACTIVE" }).code(200),
};
