import dotenv from "dotenv";
import Hapi, { Server } from "@hapi/hapi";
import Inert from "@hapi/inert";
import { startupDB } from "./dbConfig";
import { allRoutes } from "./routes/allRoutes";
import Boom from "@hapi/boom";

dotenv.config({ quiet: true });

const port: number = Number(process.env.PORT);
// const host: string = process.env.HOST || "localhost";

export const server: Server = Hapi.server({
	port,
	// compression: {
	// 	minBytes: 1024,
	// },
});

// init for testing purposes only
// export const initServer = async function (): Promise<void> {
// 	await server.register(Inert);
// 	server.route(allRoutes);
// };

async function bootstrap() {
	try {
		// 1. Initialize DB + tables//
		await startupDB();

		// 2. Register plugins
		await server.register(Inert);

		// 3. Register routes
		server.route({
			method: "GET",
			path: "/uploads/{param*}",
			options: {
				cors: {
					origin: ["*"],
				},
			},
			handler: {
				directory: { path: "src/uploads", listing: false },
			},
		});

		server.route(allRoutes);

		//global enrolhandler so the server doesnt crash abnormally
		server.ext("onPreResponse", function (req, res) {
			const responseState = req.response;

			//if response return an error
			if (Boom.isBoom(responseState)) {
				throw Boom.badRequest(responseState.message);
			}

			return responseState;
		});

		// 4. Start server
		await server.start();

		const time = new Date();
		console.log(
			`🚀 Server running at ${
				server.info.uri
			} as at ${time.getHours()}:${time.getMinutes()}`
		);
	} catch (err: any) {
		console.error(err.message);
		console.error(err.stack);
		process.exit(1);
	}
}

if (require.main === module) {
	void bootstrap();
}
