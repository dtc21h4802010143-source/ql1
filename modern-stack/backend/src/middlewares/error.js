import { HttpError } from "../utils/httpError.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (error, req, res, next) => {
	const statusCode = error instanceof HttpError ? error.statusCode : 500;
	const payload = {
		message: error.message || "Internal Server Error"
	};

	logger.error("Request failed", {
		statusCode,
		path: req.originalUrl,
		method: req.method,
		message: error.message
	});

	if (error.details) {
		payload.details = error.details;
	}

	if (process.env.NODE_ENV !== "production") {
		payload.stack = error.stack;
	}

	res.status(statusCode).json(payload);
};