import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startKpiScheduler } from "./services/kpiSchedulerService.js";
import { logger } from "./utils/logger.js";

const { httpServer } = createApp();

startKpiScheduler();

httpServer.listen(env.port, () => {
	logger.info("Modern HRMS backend is running", { port: env.port, url: `http://localhost:${env.port}` });
});