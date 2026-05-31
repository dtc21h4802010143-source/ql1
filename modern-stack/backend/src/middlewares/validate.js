import { HttpError } from "../utils/httpError.js";

export const validate = (schema, target = "body") => (req, res, next) => {
	const result = schema.safeParse(req[target]);
	if (!result.success) {
		return next(new HttpError(400, "Validation failed", result.error.flatten()));
	}

	req[target] = result.data;
	return next();
};