import { appPool } from "../dbConfig/connection";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_isProcessing = async function (pool = appPool) {
	const conn = await pool.connect();

	const selectQuery = `
		SELECT 
		course, fullName AS "fullName", email, nin,
		registration_status AS "registrationStatus",
		phoneNumber AS "phoneNumber"
		FROM enrolment_Table
		WHERE registration_status = 'PROCESSING' 
	`;

	try {
		const { rows } = await conn.query(selectQuery);

		if (!rows.length) {
			throw new Error(
				"no candidates are waiting to be processed,try again later"
			);
		}

		return rows;
	} catch (e: any) {
		throw e;
	} finally {
		conn.release();
	}
};
