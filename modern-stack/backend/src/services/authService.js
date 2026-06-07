import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { appRepository } from "../repositories/appRepository.js";

export const authService = {
	async login({ email, password }) {
		const user = await appRepository.getUserByEmail(email);
		if (!user) {
			throw new HttpError(401, "Invalid credentials");
		}

		const passwordValid = user.passwordHash.startsWith("$")
			? await bcrypt.compare(password, user.passwordHash)
			: password === user.passwordHash;

		if (!passwordValid) {
			throw new HttpError(401, "Invalid credentials");
		}

		return {
			token: jwt.sign({ id: user.id, role: user.role, fullName: user.fullName, email: user.email }, env.jwtSecret, { expiresIn: "7d" }),
			user: {
				id: user.id,
				role: user.role,
				fullName: user.fullName,
				email: user.email
			}
		};
	},

	async me(userId) {
		const user = await appRepository.getUserById(userId);
		if (!user) {
			throw new HttpError(404, "User not found");
		}
		return { id: user.id, role: user.role, fullName: user.fullName, email: user.email };
	}
};