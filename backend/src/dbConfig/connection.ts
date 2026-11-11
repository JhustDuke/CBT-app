import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME;

if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
	throw new Error("❌ Invalid or missing DB_NAME in .env");
}

// This pool connects to the PostgreSQL maintenance database.
const adminPool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: Number(process.env.DB_PORT),
	database: "postgres",
	max: 10,
});

// This pool connects to your application database.
export const appPool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: Number(process.env.DB_PORT) || 5432,
	database: dbName,
	max: 10,
});

export async function createDB(): Promise<void> {
	try {
		await adminPool.query(`CREATE DATABASE "${dbName}"`);
		console.log(`✅ Database '${dbName}' created.`);
	} catch (error: any) {
		if (error.code === "42P04") {
			console.log(`ℹ️ Database '${dbName}' already exists.`);
			return;
		}

		console.error("❌ DB init error:", error.message);
		throw new Error(error.message);
	}
}
