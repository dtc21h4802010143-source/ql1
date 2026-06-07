import cron from "node-cron";
import { env } from "../config/env.js";
import { appRepository } from "../repositories/appRepository.js";
import { computeUserKpi } from "./kpiEngine.js";
import { sendKpiResultEmail } from "./emailService.js";

let scheduledTask = null;

const getOpenPeriod = async () => {
	const periods = await appRepository.listKpiPeriods();
	return periods.find((item) => item.status !== "locked") || periods[periods.length - 1] || null;
};

export const runScheduledKpiAutoJob = async () => {
	const period = await getOpenPeriod();
	if (!period) return { ok: false, reason: "no-open-period" };

	const targets = await appRepository.listKpiTargets({ userId: null, periodId: period.id, role: "Admin" });
	const results = [];

	for (const target of targets) {
		const employee = target.employee;
		if (!employee?.email) continue;
		const existing = await appRepository.findKpiRecordByUserAndPeriod(employee.id, period.id);
		if (existing) {
			continue;
		}

		const engineResult = await computeUserKpi({ userId: employee.id, periodId: period.id, target });
		const record = await appRepository.submitKpiResult(employee.id, {
			periodId: period.id,
			auto: true,
			targetId: target.id,
			productivityScore: engineResult.productivityScore,
			qualityScore: engineResult.qualityScore,
			timelinessScore: engineResult.timelinessScore
		});

		await sendKpiResultEmail({
			to: employee.email,
			fullName: employee.fullName,
			period,
			record,
			engineResult,
			target
		});

		results.push({ userId: employee.id, recordId: record.id });
	}

	return { ok: true, periodId: period.id, count: results.length, results };
};

export const startKpiScheduler = () => {
	if (!env.kpiCronEnabled) {
		console.log("KPI cron is disabled by configuration.");
		return null;
	}
	if (scheduledTask) return scheduledTask;
	scheduledTask = cron.schedule(env.kpiCronExpression, async () => {
		try {
			const result = await runScheduledKpiAutoJob();
			console.log(`[kpi-cron] completed: ${JSON.stringify(result)}`);
		} catch (error) {
			console.error("[kpi-cron] failed", error);
		}
	});
	console.log(`KPI cron scheduled with expression: ${env.kpiCronExpression}`);
	return scheduledTask;
};

export default { startKpiScheduler, runScheduledKpiAutoJob };