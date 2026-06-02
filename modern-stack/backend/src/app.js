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
// 1. Định nghĩa đường dẫn tĩnh (Đứng từ src/app.js trỏ vào src/public)
    const frontendDistPath = fileURLToPath(new URL("./public", import.meta.url));
    const frontendIndexPath = path.join(frontendDistPath, "index.html");

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

    // 3. Khởi tạo Routes API (Bắt buộc phải chạy trước giao diện để không nghẽn)
    createRoutes(app);

    // 4. Giải pháp Lazy-load Static Files: Chỉ quét ổ đĩa khi có người dùng truy cập vào trang chủ
    app.use((req, res, next) => {
        // Nếu là các API route thì bỏ qua, nhường xử lý cho hệ thống API
        if (req.url.startsWith('/api')) return next();
        
        if (fs.existsSync(frontendIndexPath)) {
            express.static(frontendDistPath, { maxAge: '1d' })(req, res, next);
        } else {
            next();
        }
    });

    // Trả về file index.html cho các route lồng nhau của Vue Router
    app.get("*", (req, res, next) => {
        if (req.url.startsWith('/api')) return next();
        
        if (fs.existsSync(frontendIndexPath)) {
            res.sendFile(frontendIndexPath);
        } else {
            res.json({ message: "Backend is running, but public files are missing." });
        }
    });

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
