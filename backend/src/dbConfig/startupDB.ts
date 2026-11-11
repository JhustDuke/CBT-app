import { appPool, createDB } from "../dbConfig/connection";
import { createEnrolStatusTable, createEnrolTable } from "../dbConfig/tables";

export async function startupDB() {
	try {
		//	await dropTable("enrolment_table");
		await createDB(); // create DB first
		await createEnrolTable(); // parent table first
		//await createEnrolStatusTable(); // then child table

		console.log("✅ All tables set up.");
	} catch (err) {
		console.error("❌ Error setting up tables:", err);
		throw err;
	}
}

export async function dropTable(tableName = "enrolment_Table", pool = appPool) {
	const conn = await pool.connect();

	try {
		const query = `DROP TABLE IF EXISTS \`${tableName}\``;
		await conn.query(query);
		console.log(`✅ Table ${tableName} dropped successfully.`);
	} catch (err) {
		console.error(`❌ Error dropping table ${tableName}:`, err);
		throw err;
	} finally {
		conn.release();
	}
}
