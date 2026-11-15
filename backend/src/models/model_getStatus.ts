import { appPool } from "../dbConfig";
import { EnrolStatusInterface } from "../interfaces";

import dotenv from "dotenv";

dotenv.config({ quiet: true });

const enrolDB = process.env.ENROL_DB;

export const model_getEnrolStatus = async function (
	phoneNumber: string,
	pool = appPool
): Promise<EnrolStatusInterface | null> {
	const conn = await pool.connect();

	const query = `
			SELECT  registration_status, registration_message
			FROM enrolment_Table
			WHERE phoneNumber = $1
			LIMIT 1
	`;

	try {
		const { rows } = await conn.query(query, [phoneNumber]);
		const result = rows as EnrolStatusInterface[];
		return result.length ? result[0] : null;
	} catch (err: any) {
		throw new Error(err.message || "opps couldnt get required data");
	} finally {
		conn.release();
	}
};
