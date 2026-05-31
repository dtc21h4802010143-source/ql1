const createSeedState = () => ({
	departments: [
		{ id: 1, name: "Executive", code: "EXE", managerId: 1, headcount: 1, protected: true },
		{ id: 2, name: "Engineering", code: "ENG", managerId: 2, headcount: 3, protected: true },
		{ id: 3, name: "Operations", code: "OPS", managerId: 6, headcount: 3, protected: true },
		{ id: 4, name: "People & Culture", code: "HCM", managerId: 10, headcount: 1, protected: true }
	],
	roles: [
		{ id: 1, name: "Admin" },
		{ id: 2, name: "Manager" },
		{ id: 3, name: "Employee" }
	],
	users: [
		{ id: 1, role: "Admin", fullName: "System Admin", email: "admin@hrms.local", password: "admin123", departmentId: 1, managerId: null, protected: true },
		{ id: 2, role: "Manager", fullName: "Nguyen Minh Hieu", email: "manager@hrms.local", password: "manager123", departmentId: 2, managerId: 1, protected: true },
		{ id: 3, role: "Employee", fullName: "Nguyen Van A", email: "employee@hrms.local", password: "employee123", departmentId: 2, managerId: 2, protected: true },
		{ id: 4, role: "Employee", fullName: "Tran Thi B", email: "employee2@hrms.local", password: "employee123", departmentId: 2, managerId: 2, protected: true },
		{ id: 5, role: "Employee", fullName: "Le Van C", email: "employee3@hrms.local", password: "employee123", departmentId: 2, managerId: 2, protected: true },
		{ id: 6, role: "Manager", fullName: "Pham Quang Dung", email: "ops.manager@hrms.local", password: "manager123", departmentId: 3, managerId: 1, protected: true },
		{ id: 7, role: "Employee", fullName: "Hoang Thi E", email: "ops.employee1@hrms.local", password: "employee123", departmentId: 3, managerId: 6, protected: true },
		{ id: 8, role: "Employee", fullName: "Vu Duc F", email: "ops.employee2@hrms.local", password: "employee123", departmentId: 3, managerId: 6, protected: true },
		{ id: 9, role: "Employee", fullName: "Bui Ngoc G", email: "ops.employee3@hrms.local", password: "employee123", departmentId: 3, managerId: 6, protected: true },
		{ id: 10, role: "Manager", fullName: "Doan Thi Hanh", email: "hr.manager@hrms.local", password: "manager123", departmentId: 4, managerId: 1, protected: true }
	],
	kpiPeriods: [
		{ id: 1, label: "Jan 2026", code: "2026-01", startDate: "2026-01-01", endDate: "2026-01-31", status: "locked", weight: 100, protected: true },
		{ id: 2, label: "Feb 2026", code: "2026-02", startDate: "2026-02-01", endDate: "2026-02-28", status: "locked", weight: 100, protected: true },
		{ id: 3, label: "Mar 2026", code: "2026-03", startDate: "2026-03-01", endDate: "2026-03-31", status: "locked", weight: 100, protected: true },
		{ id: 4, label: "Apr 2026", code: "2026-04", startDate: "2026-04-01", endDate: "2026-04-30", status: "submitted", weight: 100, protected: true },
		{ id: 5, label: "May 2026", code: "2026-05", startDate: "2026-05-01", endDate: "2026-05-31", status: "open", weight: 100, protected: true }
	],
	kpiTargets: [
		{ id: 1, periodId: 5, userId: 3, targetScore: 85, productivityWeight: 35, qualityWeight: 35, timelinessWeight: 30, targetTasks: 8, targetCompletionRate: 92, status: "pending", protected: true },
		{ id: 2, periodId: 5, userId: 4, targetScore: 82, productivityWeight: 30, qualityWeight: 40, timelinessWeight: 30, targetTasks: 7, targetCompletionRate: 90, status: "pending", protected: true },
		{ id: 3, periodId: 5, userId: 5, targetScore: 80, productivityWeight: 30, qualityWeight: 35, timelinessWeight: 35, targetTasks: 7, targetCompletionRate: 88, status: "submitted", protected: true },
		{ id: 4, periodId: 5, userId: 7, targetScore: 83, productivityWeight: 35, qualityWeight: 30, timelinessWeight: 35, targetTasks: 6, targetCompletionRate: 90, status: "approved", protected: true },
		{ id: 5, periodId: 5, userId: 8, targetScore: 81, productivityWeight: 30, qualityWeight: 30, timelinessWeight: 40, targetTasks: 6, targetCompletionRate: 88, status: "rejected", protected: true },
		{ id: 6, periodId: 4, userId: 3, targetScore: 84, productivityWeight: 35, qualityWeight: 30, timelinessWeight: 35, targetTasks: 7, targetCompletionRate: 90, status: "approved", protected: true }
	],
	kpiRecords: [
		{ id: 1, periodId: 4, userId: 3, targetId: 6, status: "approved", finalScore: 84, productivityScore: 83, qualityScore: 86, timelinessScore: 83, remarks: "Ổn định, cần tăng tốc ở cuối kỳ.", submittedAt: "2026-04-28T09:00:00Z", approvedAt: "2026-04-30T11:30:00Z", approvedBy: 2, history: [{ at: "2026-04-20T10:00:00Z", action: "submitted", by: 3, note: "Employee submitted KPI self-review" }, { at: "2026-04-30T11:30:00Z", action: "approved", by: 2, note: "Manager approved with minor comments" }], protected: true },
		{ id: 2, periodId: 4, userId: 4, targetId: null, status: "approved", finalScore: 79, productivityScore: 77, qualityScore: 82, timelinessScore: 78, remarks: "Chất lượng tốt, tiến độ còn dao động.", submittedAt: "2026-04-26T08:15:00Z", approvedAt: "2026-04-30T11:45:00Z", approvedBy: 2, history: [{ at: "2026-04-26T08:15:00Z", action: "submitted", by: 4, note: "Self-review submitted" }, { at: "2026-04-30T11:45:00Z", action: "approved", by: 2, note: "Approved after discussion" }], protected: true },
		{ id: 3, periodId: 5, userId: 3, targetId: 1, status: "submitted", finalScore: 86, productivityScore: 88, qualityScore: 85, timelinessScore: 84, remarks: "Đạt mục tiêu tháng, có thể tăng độ ổn định deadline.", submittedAt: "2026-05-21T10:30:00Z", approvedAt: null, approvedBy: null, history: [{ at: "2026-05-21T10:30:00Z", action: "submitted", by: 3, note: "Employee submitted KPI evidence" }], protected: true },
		{ id: 4, periodId: 5, userId: 4, targetId: 2, status: "pending", finalScore: 81, productivityScore: 79, qualityScore: 84, timelinessScore: 80, remarks: "Chờ nộp minh chứng cuối tháng.", submittedAt: null, approvedAt: null, approvedBy: null, history: [{ at: "2026-05-05T09:00:00Z", action: "target_assigned", by: 2, note: "Target assigned by manager" }], protected: true },
		{ id: 5, periodId: 5, userId: 5, targetId: 3, status: "rejected", finalScore: 78, productivityScore: 76, qualityScore: 82, timelinessScore: 75, remarks: "Thiếu dữ liệu đầu ra cho một số task.", submittedAt: "2026-05-18T14:20:00Z", approvedAt: null, approvedBy: 2, history: [{ at: "2026-05-18T14:20:00Z", action: "submitted", by: 5, note: "Submitted self-evaluation" }, { at: "2026-05-20T09:10:00Z", action: "rejected", by: 2, note: "Need more evidence for completed tasks" }], protected: true },
		{ id: 6, periodId: 5, userId: 7, targetId: 4, status: "approved", finalScore: 89, productivityScore: 90, qualityScore: 88, timelinessScore: 89, remarks: "Vượt KPI ở nhóm vận hành.", submittedAt: "2026-05-17T13:00:00Z", approvedAt: "2026-05-19T10:00:00Z", approvedBy: 6, history: [{ at: "2026-05-17T13:00:00Z", action: "submitted", by: 7, note: "Submitted operational KPI" }, { at: "2026-05-19T10:00:00Z", action: "approved", by: 6, note: "Approved by operations manager" }], protected: true },
		{ id: 7, periodId: 5, userId: 8, targetId: 5, status: "pending", finalScore: 80, productivityScore: 79, qualityScore: 80, timelinessScore: 81, remarks: "Chờ cập nhật chứng từ task cuối kỳ.", submittedAt: null, approvedAt: null, approvedBy: null, history: [{ at: "2026-05-06T09:00:00Z", action: "target_assigned", by: 6, note: "Operational KPI target assigned" }], protected: true }
	],
	tasks: [
		{ id: 1, title: "Chuẩn bị báo cáo KPI tháng", description: "Tổng hợp số liệu, so sánh tiến độ và đề xuất cải thiện.", assignedBy: 2, assignedTo: 3, projectId: 1, priority: "High", status: "In Progress", dueDate: "2026-05-30", progress: 65, estimatedHours: 10, actualHours: 6, comments: 3, attachments: 1, protected: true },
		{ id: 2, title: "Rà soát task quá hạn", description: "Kiểm tra các công việc chậm tiến độ của team.", assignedBy: 2, assignedTo: 4, projectId: 1, priority: "Urgent", status: "Open", dueDate: "2026-05-24", progress: 20, estimatedHours: 4, actualHours: 1, comments: 1, attachments: 0, protected: true },
		{ id: 3, title: "Hoàn thiện checklist demo", description: "Sắp xếp dữ liệu demo trước hội đồng.", assignedBy: 2, assignedTo: 5, projectId: 1, priority: "Medium", status: "Review", dueDate: "2026-05-25", progress: 80, estimatedHours: 6, actualHours: 5, comments: 2, attachments: 1, protected: true },
		{ id: 4, title: "Kiểm tra vận hành ca sáng", description: "Theo dõi đầu ca và báo cáo sự cố.", assignedBy: 6, assignedTo: 7, projectId: 2, priority: "High", status: "Done", dueDate: "2026-05-22", progress: 100, estimatedHours: 5, actualHours: 4, comments: 4, attachments: 1, protected: true },
		{ id: 5, title: "Bổ sung nhật ký vận hành", description: "Cập nhật log công việc và checklist an toàn.", assignedBy: 6, assignedTo: 8, projectId: 2, priority: "Medium", status: "In Progress", dueDate: "2026-05-28", progress: 72, estimatedHours: 8, actualHours: 6, comments: 1, attachments: 0, protected: true },
		{ id: 6, title: "Soát lại tài liệu onboarding", description: "Đồng bộ tài liệu nhân sự và quy trình nội bộ.", assignedBy: 10, assignedTo: 9, projectId: null, priority: "Low", status: "Open", dueDate: "2026-05-29", progress: 30, estimatedHours: 3, actualHours: 1, comments: 0, attachments: 0, protected: true },
		{ id: 7, title: "Chuẩn bị slide báo cáo quý", description: "Tổng hợp dashboard, KPI và câu chuyện số liệu.", assignedBy: 1, assignedTo: 2, projectId: 1, priority: "High", status: "Review", dueDate: "2026-05-27", progress: 90, estimatedHours: 9, actualHours: 8, comments: 5, attachments: 2, protected: true },
		{ id: 8, title: "Kiểm tra task tồn đọng", description: "Rà soát backlog của phòng vận hành.", assignedBy: 6, assignedTo: 8, projectId: 2, priority: "Urgent", status: "Overdue", dueDate: "2026-05-20", progress: 45, estimatedHours: 4, actualHours: 3, comments: 2, attachments: 0, protected: true }
	],
	projects: [
		{ id: 1, name: "HRMS Modernization", code: "HRMS-2026", ownerId: 1, description: "Migration and demo modernization project", protected: true },
		{ id: 2, name: "Operations Stabilization", code: "OPS-21", ownerId: 6, description: "Improve operations reliability and shift handling", protected: true }
	],
	criteria: [
		{ id: 1, code: "productivity", name: "Productivity", description: "Measured by tasks completed and estimated vs actual hours", weight: 40, type: "productivity", protected: true },
		{ id: 2, code: "timeliness", name: "Timeliness", description: "On-time delivery and deadline adherence", weight: 30, type: "timeliness", protected: true },
		{ id: 3, code: "quality", name: "Quality", description: "Quality rating from reviews and acceptance", weight: 30, type: "quality", protected: true }
	],
	notifications: [
		{ id: 1, userId: 3, type: "task_assigned", title: "Task mới đã được giao", message: "Bạn nhận 1 task KPI cần xử lý hôm nay.", isRead: false, createdAt: "2026-05-22T08:00:00Z", protected: true },
		{ id: 2, userId: 2, type: "kpi_alert", title: "KPI team giảm", message: "Điểm KPI trung bình tuần này giảm 4% so với tuần trước.", isRead: false, createdAt: "2026-05-22T08:10:00Z", protected: true },
		{ id: 3, userId: 6, type: "approval", title: "Chờ duyệt KPI", message: "Có 1 KPI result đang chờ duyệt trong tháng hiện tại.", isRead: false, createdAt: "2026-05-22T08:30:00Z", protected: true }
	],
	reports: [
		{ id: 1, userId: 1, title: "Báo cáo tuần hệ thống", category: "Weekly", periodLabel: "Week 21 / 2026", status: "Published", summary: "Tổng hợp task, KPI và notification của toàn bộ hệ thống.", protected: true },
		{ id: 2, userId: 2, title: "Báo cáo KPI team", category: "Monthly", periodLabel: "May 2026", status: "Draft", summary: "Theo dõi hiệu suất, chậm tiến độ và gợi ý cải thiện.", protected: true },
		{ id: 3, userId: 6, title: "Báo cáo vận hành tuần", category: "Weekly", periodLabel: "Week 21 / 2026", status: "Published", summary: "Tóm tắt task, ca trực và tỷ lệ hoàn thành của team vận hành.", protected: true }
	],
	leaveRequests: [
		{ id: 1, userId: 3, leaveType: "Annual Leave", startDate: "2026-05-24", endDate: "2026-05-26", reason: "Family matter", status: "Pending", protected: true },
		{ id: 2, userId: 3, leaveType: "Sick Leave", startDate: "2026-05-16", endDate: "2026-05-16", reason: "Medical checkup", status: "Approved", protected: true }
	],
	attendanceCheckins: [
		{ id: 1, userId: 3, checkInAt: "2026-05-22T08:03:00", status: "On time", note: "GPS matched", protected: true },
		{ id: 2, userId: 4, checkInAt: "2026-05-21T08:17:00", status: "Late", note: "Traffic delay", protected: true },
		{ id: 3, userId: 7, checkInAt: "2026-05-22T07:56:00", status: "On time", note: "Shift start", protected: true }
	],
	shiftAssignments: [
		{ id: 1, title: "Morning shift", assigneeName: "Nguyen Van A", assigneeRole: "Employee", status: "Assigned", shiftDate: "2026-05-22", protected: true },
		{ id: 2, title: "Weekend shift", assigneeName: "Team Pool", assigneeRole: "Employee", status: "Pending", shiftDate: "2026-05-25", protected: true }
	],
	expenseClaims: [
		{ id: 1, userId: 3, title: "Client transport", amount: 420000, status: "Submitted", protected: true },
		{ id: 2, userId: 3, title: "Team lunch", amount: 760000, status: "Approved", protected: true },
		{ id: 3, userId: 7, title: "Stationery reimbursement", amount: 180000, status: "Pending", protected: true }
	],
	employeeAdvances: [
		{ id: 1, userId: 3, purpose: "Field trip", amount: 1500000, status: "Pending", protected: true },
		{ id: 2, userId: 3, purpose: "Project materials", amount: 800000, status: "Approved", protected: true },
		{ id: 3, userId: 7, purpose: "Shift support", amount: 1200000, status: "Pending", protected: true }
	],
	salarySlips: [
		{ id: 1, userId: 3, periodLabel: "May 2026", grossAmount: 18000000, netAmount: 15200000, status: "Processed", protected: true },
		{ id: 2, userId: 3, periodLabel: "Apr 2026", grossAmount: 18000000, netAmount: 14950000, status: "Processed", protected: true },
		{ id: 3, userId: 7, periodLabel: "May 2026", grossAmount: 16500000, netAmount: 14100000, status: "Processed", protected: true }
	],
	userSettings: [
		{ userId: 1, theme: "dark", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 2, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 3, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 4, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 5, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 6, theme: "dark", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 7, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 8, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 9, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true },
		{ userId: 10, theme: "light", notificationsEnabled: true, defaultDashboard: "role-based", protected: true }
	]
});

const seedState = createSeedState();

export const roles = seedState.roles;
export const departments = seedState.departments;
export const users = seedState.users;
export const kpiPeriods = seedState.kpiPeriods;
export const kpiTargets = seedState.kpiTargets;
export const kpiRecords = seedState.kpiRecords;
export const tasks = seedState.tasks;
export const projects = seedState.projects;
export const criteria = seedState.criteria;
export const notifications = seedState.notifications;
export const reports = seedState.reports;
export const leaveRequests = seedState.leaveRequests;
export const attendanceCheckins = seedState.attendanceCheckins;
export const shiftAssignments = seedState.shiftAssignments;
export const expenseClaims = seedState.expenseClaims;
export const employeeAdvances = seedState.employeeAdvances;
export const salarySlips = seedState.salarySlips;
export const userSettings = seedState.userSettings;

const mutableCollections = {
	departments,
	users,
	projects,
	criteria,
	kpiPeriods,
	kpiTargets,
	kpiRecords,
	tasks,
	notifications,
	reports,
	leaveRequests,
	attendanceCheckins,
	shiftAssignments,
	expenseClaims,
	employeeAdvances,
	salarySlips,
	userSettings
};

export const resetSeedState = () => {
	const fresh = createSeedState();
	for (const [key, collection] of Object.entries(mutableCollections)) {
		collection.splice(0, collection.length, ...fresh[key].map((item) => ({ ...item })));
	}
	return fresh;
};

export const nextSeedId = (collection) => Math.max(0, ...collection.map((item) => Number(item.id) || 0)) + 1;