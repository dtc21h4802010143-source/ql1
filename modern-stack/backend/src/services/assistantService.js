import { dashboardService } from "./dashboardService.js";
import { taskService } from "./taskService.js";
import { HttpError } from "../utils/httpError.js";
import OpenAI from "openai";

const buildSummary = async (role, userId) => {
	const dashboard = await dashboardService.getSummary(role, userId);
	const tasksResult = await taskService.list({ role, userId, page: 1, limit: 5 });
	const tasks = tasksResult.items || [];
	return {
		taskCount: dashboard.stats[0].value,
		overdueCount: dashboard.stats[1].value,
		kpiScore: dashboard.kpi.finalScore,
		recentTasks: tasks.map((task) => `${task.title} (${task.status}, ${task.progress}%)`)
	};
};

const createOpenAIClient = () => {
	const key = process.env.OPENAI_API_KEY;
	if (!key) return null;
	return new OpenAI({ apiKey: key });
};

export const assistantService = {
	async chat({ role, userId, message }) {
		const summary = await buildSummary(role, userId);

		// If OpenAI key provided, use LLM for richer responses
		const openai = createOpenAIClient();
		if (openai) {
			try {
				const systemPrompt = `You are an assistant for an HR management dashboard. Use the provided summary and user message to craft concise, actionable replies in Vietnamese when appropriate. Always be factual and avoid inventing sensitive data.`;
				const userPrompt = `Dashboard summary: ${JSON.stringify(summary)}\nUser message: ${message}`;
				const resp = await openai.chat.completions.create({
					model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
					messages: [
						{ role: "system", content: systemPrompt },
						{ role: "user", content: userPrompt }
					],
					temperature: 0.2,
					max_tokens: 512
				});
				const content = resp?.choices?.[0]?.message?.content;
				if (content) return content.trim();
			} catch (err) {
				console.error("OpenAI error:", err?.message || err);
				// fallthrough to local logic
			}
		}

		// Fallback deterministic responses
		const normalized = (message || "").toLowerCase();

		if (normalized.includes("deadline") || normalized.includes("overdue") || normalized.includes("quá hạn")) {
			return `Các task đáng chú ý: ${summary.overdueCount} task quá hạn. Ưu tiên xử lý task có deadline gần nhất trước.`;
		}

		if (normalized.includes("kpi")) {
			return `KPI hiện tại là ${summary.kpiScore}/100. Điểm mạnh là tiến độ đều, điểm cần cải thiện là tính đúng hạn.`;
		}

		if (normalized.includes("report") || normalized.includes("bao cao")) {
			return `Báo cáo: ${summary.taskCount} task đang mở, ${summary.overdueCount} task quá hạn, KPI ${summary.kpiScore}/100.`;
		}

		if (normalized.includes("priority") || normalized.includes("ưu tiên")) {
			return `Ưu tiên đề xuất: ${summary.recentTasks[0] || "Chưa có task phù hợp"}.`;
		}

		return `Tóm tắt nhanh: ${summary.taskCount} task, ${summary.overdueCount} task quá hạn, KPI ${summary.kpiScore}/100. Tôi có thể hỗ trợ tóm tắt, xếp ưu tiên hoặc tạo báo cáo tuần.`;
	}
};