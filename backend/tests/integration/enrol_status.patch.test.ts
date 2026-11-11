import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { server, initServer } from "../../src/server";
import { appPool } from "../../src/dbConfig/connection";
import {
	createEnrolStatusTable,
	dropEnrolStatusTable,
	createEnrolTable,
	dropEnrolTable,
	insertTestEnrol,
	insertTestEnrolStatus,
	updateTestEnrolStatus,
} from "../testUtils/testUtils";

describe("PATCH /enrol-status (integration)", function () {
	beforeAll(async function () {
		await initServer();

		await dropEnrolStatusTable();
		await dropEnrolTable();

		await createEnrolTable();
		await createEnrolStatusTable();

		// Insert candidate in enrol table first (FK constraint)
		await insertTestEnrol();
		await insertTestEnrolStatus(appPool);
	});

	afterAll(async function () {
		// Delete in reverse order to respect FK
		await appPool.query(`DELETE FROM enrolStatus WHERE phoneNumber = 911`);
		await appPool.query(`DELETE FROM enrol WHERE phoneNumber = 911`);
		//await appPool.end();
	});

	it.only("updates enrol status in the database", async function () {
		const response = await server.inject({
			method: "PATCH",
			url: "/enrol-status",
			payload: {
				phoneNumber: 911,
				status: "completed",
			},
		});

		expect(response.statusCode).toBe(200);

		const [rows]: any = await appPool.query(
			`SELECT status FROM enrolStatus WHERE phoneNumber = ?`,
			["911"]
		);

		expect(rows.length).toBe(1);
		expect(rows[0].status).toBe("completed");
	});
});
