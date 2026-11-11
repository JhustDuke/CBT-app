import { appPool } from "../index";

export const createEnrolStatusTable = async function () {
	const createSQLTable = `
		CREATE TABLE IF NOT EXISTS enrolment_status_table (
			id 
					SERIAL PRIMARY KEY,
			phoneNumber 
					INTEGER NOT NULL,
			nin
					INTEGER NOT NULL,
			registration_status 
					VARCHAR(20) DEFAULT 'processing'
								CHECK (registration_status IN ('processing', 'completed', 'error')),
			errorMessage 
					VARCHAR(255) DEFAULT 'there was an error',
			updatedAt 
					TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			FOREIGN KEY (phoneNumber) REFERENCES enrolment_table(id)
		);
	`;

	try {
		await appPool.query(createSQLTable);
		console.log("enrolment_status_table created.");
	} catch (err) {
		console.error("❌ Error creating enrol status table", err);
		throw err;
	}
};
