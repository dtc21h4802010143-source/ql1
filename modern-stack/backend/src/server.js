import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { startKpiScheduler } from "./services/kpiSchedulerService.js";

const { httpServer } = createApp();

startKpiScheduler();

httpServer.listen(env.port, () => {
	console.log(`Modern HRMS backend running at http://localhost:${env.port}`);
});