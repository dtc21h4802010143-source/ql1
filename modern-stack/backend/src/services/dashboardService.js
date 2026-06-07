import { appRepository } from "../repositories/appRepository.js";
import { users } from "../data/seed.js";

export const dashboardService = {
	async getSummary(role, userId) {
		const taskData = await appRepository.listTasks({ role, userId, page: 1, limit: 5 });
		const scopedNotifications = await appRepository.listNotifications(userId);
		const kpiOverview = await appRepository.listKpiOverview({ role, userId });
		const scopedKpi = await appRepository.getKpi(userId);
		const scopedTasks = taskData.items;
		const pending = scopedTasks.filter((task) => task.status !== "Done");
		const completed = scopedTasks.filter((task) => task.status === "Done").length;
		const overdue = scopedTasks.filter((task) => task.status === "Overdue").length;
		const completionRate = scopedTasks.length ? Math.round((completed / scopedTasks.length) * 100) : 0;
		const ranking = kpiOverview.ranking || [];
		const topEmployees = ranking.slice(0, 5);
		const teamMembers = role === "Admin"
			? users.filter((item) => item.role === "Employee").length
			: role === "Manager"
				? users.filter((item) => Number(item.managerId) === Number(userId)).length
				: 1;
		const teamAverage = ranking.length ? Math.round(ranking.reduce((sum, item) => sum + Number(item.finalScore || 0), 0) / ranking.length) : scopedKpi?.finalScore || 0;

		const statsByRole = {
			Admin: [
				{ label: "Employees", value: users.filter((item) => item.role === "Employee").length },
				{ label: "Departments", value: 4 },
				{ label: "Locked periods", value: kpiOverview.lockedPeriods || 0 },
				{ label: "Completion rate", value: `${completionRate}%` }
			],
			Manager: [
				{ label: "Team members", value: teamMembers },
				{ label: "Open tasks", value: pending.length },
				{ label: "Overdue", value: overdue },
				{ label: "Team average", value: `${teamAverage}/100` }
			],
			Employee: [
				{ label: "My tasks", value: scopedTasks.length },
				{ label: "Done", value: completed },
				{ label: "Overdue", value: overdue },
				{ label: "My score", value: `${scopedKpi?.finalScore || 0}/100` }
			]
		};

		return {
			role,
			period: kpiOverview.period,
			stats: statsByRole[role] || statsByRole.Employee,
			activity: scopedTasks.slice(0, 5),
			kpi: scopedKpi,
			kpiRecords: kpiOverview.records || [],
			notifications: scopedNotifications.slice(0, 5),
			ranking: topEmployees,
			completionRate,
			taskSummary: {
				open: pending.length,
				completed,
				overdue,
				progress: completionRate
			},
			insights: role === "Admin"
				? ["Dữ liệu seed sẵn cho demo ổn định ngay sau khi đăng nhập.", `Có ${kpiOverview.lockedPeriods || 0} kỳ KPI đã khóa để bảo toàn lịch sử.`]
				: role === "Manager"
					? ["Theo dõi task quá hạn và phê duyệt KPI theo kỳ hiện tại.", `Top team score hiện tại: ${topEmployees[0]?.fullName || "N/A"}.`]
					: ["Cập nhật tiến độ task thường xuyên để cải thiện điểm KPI.", "Dữ liệu lịch sử KPI được giữ để đối chiếu theo từng tháng."]
		};
	}
};