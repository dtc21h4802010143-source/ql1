import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const hasSmtpConfig = () => Boolean(env.smtpHost && env.smtpUser && env.smtpPass);

const createTransporter = () => {
	if (!hasSmtpConfig()) return null;
	return nodemailer.createTransport({
		host: env.smtpHost,
		port: env.smtpPort,
		secure: Number(env.smtpPort) === 465,
		auth: {
			user: env.smtpUser,
			pass: env.smtpPass
		}
	});
};

const formatScore = (value) => `${Number(value ?? 0)}/100`;

export const sendKpiResultEmail = async ({ to, fullName, period, record, engineResult, target }) => {
	if (!to) {
		return { delivered: false, reason: "missing-recipient" };
	}

	const subject = `KPI tự động ${period?.label || "của bạn"}`;
	const text = [
		`Xin chào ${fullName || "bạn"},`,
		`KPI của bạn cho kỳ ${period?.label || record?.periodId || "hiện tại"} đã được tính.`,
		`Productivity: ${formatScore(record?.productivityScore ?? engineResult?.productivityScore)}`,
		`Quality: ${formatScore(record?.qualityScore ?? engineResult?.qualityScore)}`,
		`Timeliness: ${formatScore(record?.timelinessScore ?? engineResult?.timelinessScore)}`,
		`Final: ${formatScore(record?.finalScore)}`,
		`Target tasks: ${target?.targetTasks ?? "N/A"}`,
		`` 
	].join("\n");

	const transporter = createTransporter();
	if (!transporter) {
		console.log(`[email] KPI result to ${to}\nSubject: ${subject}\n${text}`);
		return { delivered: true, provider: "console" };
	}

	await transporter.sendMail({
		from: env.smtpFrom,
		to,
		subject,
		text
	});
	return { delivered: true, provider: "smtp" };
};

export default { sendKpiResultEmail };