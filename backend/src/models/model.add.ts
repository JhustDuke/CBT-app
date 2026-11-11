import { NewEnrolPayloadInterface } from "../interfaces";
import { appPool } from "../dbConfig/connection";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_addCandidate = async function (
	payload: NewEnrolPayloadInterface,
	pool = appPool
): Promise<NewEnrolPayloadInterface> {
	const conn = await pool.connect();

	const insertQuery = `
		INSERT INTO enrolment_Table (course, fullName, phoneNumber, nin, email)
		VALUES ($1, $2, $3, $4, $5)
	`;

	const selectQuery = `
		SELECT course, fullName, nin, email, registration_status AS "registrationStatus",
		       registration_message AS "registrationMessage", phoneNumber
		FROM enrolment_Table
		WHERE phoneNumber = $1
		LIMIT 1
	`;

	try {
		await conn.query(insertQuery, [
			payload.course,
			payload.fullName,
			payload.phoneNumber,
			payload.nin,
			payload.email,
		]);

		const { rows } = await conn.query(selectQuery, [payload.phoneNumber]);

		if (!rows.length) {
			throw new Error(
				`Candidate with phoneNumber ${payload.phoneNumber} not found`
			);
		}

		return rows[0] as NewEnrolPayloadInterface;
	} catch (e: any) {
		throw e;
	} finally {
		conn.release();
	}
};
