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

export const createApp = () => {
	const app = express();
	const httpServer = createServer(app);
	const frontendDistPath = fileURLToPath(new URL("../../frontend/dist", import.meta.url));
	const frontendIndexPath = path.join(frontendDistPath, "index.html");
	const serveFrontend = fs.existsSync(frontendIndexPath);
	
	// CORS configuration to accept both 5173 and other localhost ports
	const corsOrigin = (origin, callback) => {
		// Allow any localhost origin (including 5173, 5174, etc.) and no origin (for same-origin requests)
		if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	};
	
	const io = new SocketIOServer(httpServer, {
		cors: { origin: corsOrigin, credentials: true }
	});

	app.use(cors({ origin: corsOrigin, credentials: true }));
	app.use(express.json({ limit: "2mb" }));
	app.use(express.urlencoded({ extended: true }));
	app.use((req, res, next) => {
		req.io = io;
		next();
	});

	io.on("connection", (socket) => {
		socket.emit("connected", { ok: true, message: "Modern HRMS socket connected" });
	});

	app.use("/api", createRoutes());

	if (serveFrontend) {
		app.use(express.static(frontendDistPath));
		app.get("*", (req, res, next) => {
			if (req.path.startsWith("/api")) {
				return next();
			}
			res.sendFile(frontendIndexPath);
		});
	}

	app.use(errorHandler);

	return { app, httpServer, io };
};