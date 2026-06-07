import dotenv from "dotenv";

dotenv.config();

export const env = {
	port: Number(process.env.PORT || 5000),
	clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
	jwtSecret: process.env.JWT_SECRET || "modern-hrms-dev-secret",
	databaseUrl: process.env.DATABASE_URL || "",
	openAiApiKey: process.env.OPENAI_API_KEY || "",
	geminiApiKey: process.env.GEMINI_API_KEY || "",
	smtpHost: process.env.SMTP_HOST || "",
	smtpPort: Number(process.env.SMTP_PORT || 587),
	smtpUser: process.env.SMTP_USER || "",
	smtpPass: process.env.SMTP_PASS || "",
	smtpFrom: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@hrms.local",
	kpiCronEnabled: String(process.env.KPI_CRON_ENABLED || "true").toLowerCase() !== "false",
	kpiCronExpression: process.env.KPI_CRON_EXPRESSION || "0 8 * * *"
};