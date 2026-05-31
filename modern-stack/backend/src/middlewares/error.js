import { HttpError } from "../utils/httpError.js";

export const errorHandler = (error, req, res, next) => {
	const statusCode = error instanceof HttpError ? error.statusCode : 500;
	const payload = {
		message: error.message || "Internal Server Error"
	};

	if (error.details) {
		payload.details = error.details;
	}

	if (process.env.NODE_ENV !== "production") {
		payload.stack = error.stack;
	}

	res.status(statusCode).json(payload);
};