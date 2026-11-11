import { appPool } from "../dbConfig/connection";
import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_isProcessing = async function (pool = appPool) {
	const conn = await pool.connect();

	const selectQuery = `
		SELECT 
		course, fullName, registration_status, phoneNumber
		FROM enrolment_Table
		WHERE registration_status = 'PROCESSING' 
	`;

	try {
		const { rows } = await conn.query(selectQuery);

		if (!rows.length) {
			throw new Error("database is empty");
		}

		return rows;
	} catch (e: any) {
		throw e;
	} finally {
		conn.release();
	}
};
