import { appPool } from "../../src/dbConfig";

//---------- DROP TABLES ---------- */
export const dropEnrolStatusTable = async function (): Promise<void> {
	await appPool.query("DROP TABLE IF EXISTS enrolStatus");
};

export const dropEnrolTable = async function (): Promise<void> {
	await appPool.query("DROP TABLE IF EXISTS enrol");
};

/* ---------- CREATE TABLES ---------- */
export const createEnrolTable = async function (): Promise<void> {
	await appPool.query(`
		CREATE TABLE enrol (
			id INT PRIMARY KEY AUTO_INCREMENT,
			fullName VARCHAR(255) NOT NULL,
			phoneNumber VARCHAR(20) NOT NULL UNIQUE,
			passport VARCHAR(255)
		)
	`);
};

export const createEnrolStatusTable = async function (): Promise<void> {
	await appPool.query(`
		CREATE TABLE enrolStatus (
			id INT PRIMARY KEY AUTO_INCREMENT,
			phoneNumber VARCHAR(20) NOT NULL,
			status ENUM('processing','completed','error') DEFAULT 'processing',
			errorMessage VARCHAR(255) DEFAULT NULL,
			FOREIGN KEY (phoneNumber) REFERENCES enrol(phoneNumber)
		)
	`);
};

export const insertTestEnrol = async function (): Promise<void> {
	await appPool.query(
		`INSERT INTO enrol (fullName, phoneNumber, passport)
		 VALUES (?, ?, ?)`,
		["test name", "911", "test passport"]
	);
};

export const insertTestEnrolStatus = async function (
	pool = appPool
): Promise<void> {
	await pool.query(
		`INSERT INTO enrolStatus (phoneNumber)
		 VALUES (?)`,
		["911"]
	);
};

/* ---------- UPDATE STATUS HELPER ---------- */
export const updateTestEnrolStatus = async function ({
	phoneNumber,
	status = "processing",
	errorMessage,
}: {
	phoneNumber: number;
	status?: "processing" | "completed" | "error";
	errorMessage?: string;
}) {
	if (status === "error" && !errorMessage) {
		throw new Error("errorMessage required when status is error");
	}

	const [result]: any = await appPool.query(
		`UPDATE enrolStatus 
		 SET status=?, errorMessage=?
		 WHERE phoneNumber=?`,
		[status, errorMessage ?? null, phoneNumber]
	);

	return result; // contains affectedRows
};
