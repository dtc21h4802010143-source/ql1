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

    // 1. Định nghĩa đường dẫn tĩnh linh hoạt
    const frontendDistPath = fileURLToPath(new URL("../frontend/dist", import.meta.url));
    const frontendIndexPath = path.join(frontendDistPath, "index.html");
    const serveFrontend = fs.existsSync(frontendIndexPath);

    // 2. Cấu hình CORS
    const corsOrigin = (origin, callback) => {
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    };

    app.use(cors({
        origin: corsOrigin,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 3. Khởi tạo Routes API
    createRoutes(app);

    // 4. Cấu hình phục vụ file Frontend tĩnh nếu tìm thấy thư mục dist
    if (serveFrontend) {
        app.use(express.static(frontendDistPath));
        app.get("*", (req, res) => {
            res.sendFile(frontendIndexPath);
        });
    } else {
        // Dự phòng nếu không tìm thấy static files để tránh lỗi Cannot GET /
        app.get("/", (req, res) => {
            res.json({ message: "Modern HRMS Backend is running, but Frontend static files are missing." });
        });
    }

    // 5. Cấu hình Socket.IO
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: corsOrigin,
            credentials: true
        }
    });

    app.use(errorHandler);

    // Đảm bảo lệnh return này nằm TRONG dấu ngoặc nhọn của hàm createApp
    return { app, httpServer, io };
}; // Dấu đóng hàm createApp được chuyển xuống cuối cùng này
