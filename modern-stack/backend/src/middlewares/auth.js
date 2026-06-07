import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

export const authRequired = (allowedRoles = []) => (req, res, next) => {
	const header = req.headers.authorization || "";
	const token = header.startsWith("Bearer ") ? header.slice(7) : null;

	if (!token) {
		return next(new HttpError(401, "Unauthorized"));
	}

	try {
		const decoded = jwt.verify(token, env.jwtSecret);
		req.user = decoded;
		if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
			return next(new HttpError(403, "Forbidden"));
		}
		return next();
	} catch (error) {
		return next(new HttpError(401, "Invalid or expired token"));
	}
};