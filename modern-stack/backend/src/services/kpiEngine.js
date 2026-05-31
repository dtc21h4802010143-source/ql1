import { appRepository } from "../repositories/appRepository.js";

const clamp = (v, min = 0, max = 100) => Math.max(min, Math.min(max, Math.round(v)));

export const computeUserKpi = async ({ userId, periodId, target, role }) => {
    // load tasks for the current scope and filter by period date range
    const period = (await appRepository.listKpiPeriods()).find((p) => Number(p.id) === Number(periodId));
    const tasksResp = await appRepository.listTasks({
        role: role === "Admin" ? "Admin" : role === "Manager" ? "Manager" : "Employee",
        userId,
        page: 1,
        limit: 1000
    });
    let items = tasksResp.items || [];
    if (period) {
        const start = new Date(period.startDate);
        const end = new Date(period.endDate);
        const scopedByPeriod = items.filter((t) => {
            if (!t.dueDate) return true;
            const d = new Date(t.dueDate);
            return d >= start && d <= end;
        });
        if (scopedByPeriod.length) {
            items = scopedByPeriod;
        }
    }

    const completed = items.filter((t) => String(t.status).toLowerCase() === "done" || Number(t.progress) >= 100);
    const completedCount = completed.length;

    // Productivity: completed tasks vs targetTasks
    const targetTasks = Number(target?.targetTasks || 1);
    const productivityScore = clamp((completedCount / Math.max(1, targetTasks)) * 100);

    // Timeliness: fraction of completed tasks with dueDate >= today (proxy for on-time)
    const now = new Date();
    const onTimeCount = completed.filter((t) => {
        if (!t.dueDate) return true; // unknown due-date considered neutral
        try {
            return new Date(t.dueDate) >= now;
        } catch (e) {
            return true;
        }
    }).length;
    const timelinessScore = completedCount ? clamp((onTimeCount / completedCount) * 100) : 0;

    // Quality: proxy score using attachments, comments, and hours efficiency
    const qualityPerTask = (t) => {
        const attachments = Number(t.attachments || 0);
        const comments = Number(t.comments || 0);
        const est = Number(t.estimatedHours || 0);
        const act = Number(t.actualHours || 0);
        const efficiencyBonus = est > 0 ? Math.max(-10, Math.min(10, Math.round((est - act)))) : 0;
        const score = 70 + Math.min(20, attachments * 3) + Math.min(10, comments * 2) + efficiencyBonus;
        return clamp(score);
    };
    const qualityScore = completed.length ? Math.round(completed.map(qualityPerTask).reduce((a, b) => a + b, 0) / completed.length) : 75;

    // Combine with target weights
    const weights = {
        productivityWeight: Number(target?.productivityWeight || 33),
        qualityWeight: Number(target?.qualityWeight || 33),
        timelinessWeight: Number(target?.timelinessWeight || 34)
    };
    const totalW = weights.productivityWeight + weights.qualityWeight + weights.timelinessWeight || 100;
    const finalScore = clamp((productivityScore * weights.productivityWeight + qualityScore * weights.qualityWeight + timelinessScore * weights.timelinessWeight) / totalW);

    return {
        productivityScore,
        qualityScore,
        timelinessScore,
        finalScore,
        computedFrom: {
            tasksConsidered: items.length,
            completedCount
        }
    };
};

export default { computeUserKpi };
