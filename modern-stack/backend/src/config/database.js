import mysql from "mysql2/promise";
import { env } from "./env.js";

let pool = null;

export const getDatabasePool = () => {
	if (!env.databaseUrl) {
		return null;
	}

	if (!pool) {
		pool = mysql.createPool(env.databaseUrl);
	}

	return pool;
};

export const pingDatabase = async () => {
	const databasePool = getDatabasePool();
	if (!databasePool) {
		return { mode: "memory" };
	}

	await databasePool.query("SELECT 1");
	return { mode: "mysql" };
};