import { appPool } from "../dbConfig/connection";
import {
	UpdateEnrolStatusInterface,
	EnrolPayloadInterface,
} from "../interfaces";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_updateEnrolStatus = async function (
	payload: UpdateEnrolStatusInterface,
	pool = appPool
): Promise<EnrolPayloadInterface> {
	const conn = await pool.connect();

	const updateQuery = `
		UPDATE enrolment_Table
		SET registration_status = $1, registration_message = $2, updatedAt = NOW()
		WHERE phoneNumber = $3
	`;

	const selectQuery = `
		SELECT course, fullName, registration_status AS "registrationStatus", registration_message AS "registrationMessage", phoneNumber
		FROM enrolment_Table
		WHERE phoneNumber = $1
		LIMIT 1
	`;

	try {
		const updateResult = await conn.query(updateQuery, [
			payload.registrationStatus,
			payload.registrationMessage ?? null,
			payload.phoneNumber,
		]);

		if (!updateResult.rowCount) {
			throw new Error(`phoneNumber ${payload.phoneNumber} does not exist`);
		}

		const { rows } = await conn.query(selectQuery, [payload.phoneNumber]);

		if (!rows.length) {
			throw new Error(
				`Candidate with phoneNumber ${payload.phoneNumber} not found`
			);
		}

		return rows[0] as EnrolPayloadInterface;
	} catch (error: any) {
		throw error || new Error("Failed to update candidate info");
	} finally {
		conn.release();
	}
};
