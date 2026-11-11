import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { appPool } from "../../src/dbConfig";
import {
	createEnrolStatusTable,
	createEnrolTable,
	dropEnrolStatusTable,
	dropEnrolTable,
	insertTestEnrol,
	insertTestEnrolStatus,
	updateTestEnrolStatus,
} from "../testUtils/testUtils";

describe("Database connection", function () {
	beforeAll(async function () {
		await dropEnrolStatusTable();
		await dropEnrolTable();

		await createEnrolTable();
		await createEnrolStatusTable();
		await insertTestEnrol();
		await insertTestEnrolStatus();
	});

	afterAll(async function () {
		await dropEnrolStatusTable();
		await dropEnrolTable();
		await appPool.end();
	});

	it("should run a simple query", async function () {
		const [rows]: any = await appPool.query(`SELECT 1 AS ok`);
		expect(rows[0].ok).toBe(1);
	});

	it("should PREVENT dropping enrol when enrolStatus FK exists", async function () {
		let tableIsDroped: null | boolean;
		try {
			await dropEnrolTable();
			tableIsDroped = true;
		} catch {
			tableIsDroped = false;
		}
		expect(tableIsDroped).toBeFalsy();
	});

	it("should update enrolStatus by phonenumber", async function () {
		let updateStatus: null | boolean = null;
		try {
			await updateTestEnrolStatus({
				phoneNumber: 911,
				status: "completed",
			});
			updateStatus = true;
		} catch {
			updateStatus = false;
		}

		expect(updateStatus).toBeTruthy();
	});
});
