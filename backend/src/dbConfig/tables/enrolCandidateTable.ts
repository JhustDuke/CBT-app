import { appPool } from "../index";

export const createEnrolTable = async function (): Promise<void> {
	const createSQLTable: string = `CREATE TABLE IF NOT EXISTS enrolment_Table (
    id 
        SERIAL PRIMARY KEY,
    course 
        VARCHAR(100) NOT NULL,
    fullName 
        VARCHAR(255) NOT NULL,
    phoneNumber 
        VARCHAR(20) NOT NULL UNIQUE,
    nin
        VARCHAR(20) NOT NULL,
    email
        VARCHAR(255) NOT NULL,
    registration_status 
        VARCHAR(20) DEFAULT 'PROCESSING' CHECK (registration_status IN ('PROCESSING','ERROR','COMPLETED')),
    registration_message
        VARCHAR(255) DEFAULT NULL,
    createdAt 
        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt 
        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON COLUMN enrolment_Table.registration_message IS 'used mostly by updated route';`;

	const conn = await appPool.connect();

	try {
		await conn.query(createSQLTable);
		console.log("enrolment_table created.");
	} catch (err) {
		console.error("❌ Error creating enrol table:", err);
		throw err;
	} finally {
		conn.release();
	}
};
