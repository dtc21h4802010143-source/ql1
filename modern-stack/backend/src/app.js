import express from "express";
import cors from "cors";
import fs from "fs";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.js";
import { createRoutes } from "./routes/index.js";
import { errorHandler } from "./middlewares/error.js";
import { logger } from "./utils/logger.js";

export const createApp = () => {
	const app = express();
	const httpServer = createServer(app);
	const frontendDistPath = fileURLToPath(new URL("./public", import.meta.url));
	const frontendIndexPath = path.join(frontendDistPath, "index.html");
	const hasFrontendBundle = fs.existsSync(frontendIndexPath);

	const allowedOrigins = new Set([env.clientUrl, "http://localhost:5173", "http://localhost:3000"]);
	const corsOrigin = (origin, callback) => {
		if (!origin) {
			callback(null, true);
			return;
		}

		const isAllowed = allowedOrigins.has(origin)
			|| /^http:\/\/localhost:\d+$/.test(origin)
			|| /^https:\/\/.+\.onrender\.com$/.test(origin)
			|| /^https:\/\/.+\.render\.com$/.test(origin);

		if (!isAllowed) {
			logger.warn("Rejected CORS origin", { origin });
		}

		callback(null, isAllowed);
	};

	app.use(cors({
		origin: corsOrigin,
		credentials: true,
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
	}));

	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));

	const io = new SocketIOServer(httpServer, {
		cors: {
			origin: corsOrigin,
			credentials: true
		}
	});

	app.use((req, _res, next) => {
		req.io = io;
		next();
	});

	app.use("/api", createRoutes());

	if (hasFrontendBundle) {
		app.use(express.static(frontendDistPath, { maxAge: "1d" }));
	} else {
		logger.warn("Frontend public bundle is missing", { frontendIndexPath });
	}

	app.get("*", (req, res, next) => {
		if (req.url.startsWith("/api")) return next();

		if (hasFrontendBundle) {
			res.sendFile(frontendIndexPath);
			return;
		}

		res.json({ message: "Backend is running, but public files are missing." });
	});

	app.use(errorHandler);

	return { app, httpServer, io };
};
