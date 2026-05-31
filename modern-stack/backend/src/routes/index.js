import { Router } from "express";
import { z } from "zod";
import { authService } from "../services/authService.js";
import { computeUserKpi } from "../services/kpiEngine.js";
import { taskService } from "../services/taskService.js";
import { dashboardService } from "../services/dashboardService.js";
import { assistantService } from "../services/assistantService.js";
import { authRequired } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { appRepository } from "../repositories/appRepository.js";
import { sendKpiResultEmail } from "../services/emailService.js";
import * as XLSX from "xlsx";
import PDFDocument from "pdfkit";

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6)
});

const taskCreateSchema = z.object({
	title: z.string().min(3),
	description: z.string().optional(),
	assignedTo: z.union([z.string(), z.number()]),
	priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
	status: z.enum(["Open", "In Progress", "Review", "Done", "Overdue"]).optional(),
	dueDate: z.string().optional(),
	progress: z.union([z.string(), z.number()]).optional(),
	estimatedHours: z.union([z.string(), z.number()]).optional(),
	actualHours: z.union([z.string(), z.number()]).optional()
,
	projectId: z.union([z.string(), z.number()]).optional().nullable()
});

const taskUpdateSchema = z.object({
	title: z.string().min(1).optional(),
	description: z.string().optional(),
	priority: z.enum(["Low", "Medium", "High", "Urgent"]).optional(),
 	status: z.enum(["Open", "In Progress", "Review", "Done", "Overdue"]).optional(),
	dueDate: z.string().optional(),
	estimatedHours: z.union([z.string(), z.number()]).optional(),
 	actualHours: z.union([z.string(), z.number()]).optional()
	,
	projectId: z.union([z.string(), z.number()]).optional().nullable()
});

const projectSchema = z.object({
	name: z.string().min(2),
	code: z.string().min(2).max(20),
	description: z.string().optional(),
	ownerId: z.union([z.string(), z.number()]).optional().nullable()
});

const criteriaSchema = z.object({
	code: z.string().min(2),
	name: z.string().min(2),
	description: z.string().optional(),
	weight: z.union([z.string(), z.number()]).optional(),
	type: z.enum(["productivity","quality","timeliness","other"]).optional()
});

const leaveCreateSchema = z.object({
	leaveType: z.string().min(3),
	startDate: z.string(),
	endDate: z.string(),
	reason: z.string().min(3),
	status: z.string().optional()
});

const leaveUpdateSchema = z.object({
 	leaveType: z.string().optional(),
 	startDate: z.string().optional(),
 	endDate: z.string().optional(),
 	reason: z.string().optional(),
 	status: z.string().optional()
});

const expenseCreateSchema = z.object({
	title: z.string().min(3),
	amount: z.union([z.string(), z.number()]),
	status: z.string().optional()
});

const expenseUpdateSchema = z.object({
 	title: z.string().optional(),
 	amount: z.union([z.string(), z.number()]).optional(),
 	status: z.string().optional()
});

const advanceCreateSchema = z.object({
	purpose: z.string().min(3),
	amount: z.union([z.string(), z.number()]),
	status: z.string().optional()
});

const advanceUpdateSchema = z.object({
 	purpose: z.string().optional(),
 	amount: z.union([z.string(), z.number()]).optional(),
 	status: z.string().optional()
});

const checkinCreateSchema = z.object({
	status: z.string().optional(),
	note: z.string().optional()
});

const settingsUpdateSchema = z.object({
	theme: z.enum(["light", "dark"]).optional(),
	notificationsEnabled: z.boolean().optional(),
	defaultDashboard: z.string().optional()
});

const reportCreateSchema = z.object({
	title: z.string().min(3),
	category: z.string().min(2),
	periodLabel: z.string().min(2),
	status: z.enum(["Draft", "Published", "Archived"]).optional(),
	summary: z.string().optional()
});

const departmentSchema = z.object({
	name: z.string().min(2),
	code: z.string().min(2).max(10),
	managerId: z.union([z.string(), z.number()]).optional().nullable()
});

const employeeSchema = z.object({
	fullName: z.string().min(2),
	email: z.string().email(),
	password: z.string().min(6).optional(),
	role: z.enum(["Admin", "Manager", "Employee"]),
	departmentId: z.union([z.string(), z.number()]),
	managerId: z.union([z.string(), z.number()]).optional().nullable()
});

const kpiTargetSchema = z.object({
	periodId: z.union([z.string(), z.number()]),
	userId: z.union([z.string(), z.number()]),
	targetScore: z.union([z.string(), z.number()]).optional(),
	productivityWeight: z.union([z.string(), z.number()]).optional(),
	qualityWeight: z.union([z.string(), z.number()]).optional(),
	timelinessWeight: z.union([z.string(), z.number()]).optional(),
	targetTasks: z.union([z.string(), z.number()]).optional(),
	targetCompletionRate: z.union([z.string(), z.number()]).optional(),
	status: z.enum(["pending", "submitted", "approved", "rejected", "locked"]).optional()
});

const kpiSubmitSchema = z.object({
	periodId: z.union([z.string(), z.number()]),
	targetId: z.union([z.string(), z.number()]).optional(),
	productivityScore: z.union([z.string(), z.number()]).optional(),
	qualityScore: z.union([z.string(), z.number()]).optional(),
	timelinessScore: z.union([z.string(), z.number()]).optional(),
	remarks: z.string().optional(),
	auto: z.boolean().optional()
});

const kpiReviewSchema = z.object({
	decision: z.enum(["approved", "rejected"]),
	note: z.string().optional()
});

const writePdfResponse = (res, filename, title, rows, headers) => {
	const doc = new PDFDocument({ margin: 40, size: "A4" });
	res.setHeader("Content-Type", "application/pdf");
	res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
	doc.pipe(res);

	doc.fontSize(18).text(title, { align: "center" });
	doc.moveDown();
	doc.fontSize(10).fillColor("#6b7280").text(`Generated at ${new Date().toLocaleString()}`, { align: "center" });
	doc.moveDown();
	if (headers?.length) {
		doc.fontSize(11).fillColor("#111827").text(headers.join("   |   "));
		doc.moveDown(0.5);
		doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor("#d1d5db").stroke();
		doc.moveDown(0.5);
	}
	rows.forEach((row) => {
		doc.fontSize(10).fillColor("#111827").text(row.join("   |   "), { paragraphGap: 4 });
	});
	if (!rows.length) {
		doc.fontSize(10).fillColor("#6b7280").text("No records available.");
	}
	doc.end();
};

export const createRoutes = () => {
	const router = Router();

	router.get("/health", (req, res) => {
		res.json({ ok: true, service: "modern-hrms-backend" });
	});

	router.post("/auth/login", validate(loginSchema), asyncHandler(async (req, res) => {
		const { email, password } = req.body;
		const result = await authService.login({ email, password });
		res.json(result);
	}));

	router.get("/auth/me", authRequired(), asyncHandler(async (req, res) => {
		const user = await authService.me(req.user.id);
		res.json(user);
	}));

	router.get("/dashboard/summary", authRequired(), asyncHandler(async (req, res) => {
		res.json(await dashboardService.getSummary(req.user.role, req.user.id));
	}));

	router.get("/departments", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listDepartments());
	}));

	router.post("/departments", authRequired(["Admin"]), validate(departmentSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createDepartment(req.body));
	}));

	router.patch("/departments/:departmentId", authRequired(["Admin"]), validate(departmentSchema), asyncHandler(async (req, res) => {
		const department = await appRepository.updateDepartment(req.params.departmentId, req.body);
		if (!department) throw new HttpError(404, "Department not found");
		res.json(department);
	}));

	router.delete("/departments/:departmentId", authRequired(["Admin"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteDepartment(req.params.departmentId);
		if (!deleted) throw new HttpError(404, "Department not found");
		res.status(204).send();
	}));

	router.get("/employees", authRequired(["Admin", "Manager"]), asyncHandler(async (req, res) => {
		res.json(await appRepository.listEmployees({ departmentId: req.query.departmentId, role: req.user.role }));
	}));

	router.post("/employees", authRequired(["Admin"]), validate(employeeSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createEmployee(req.body));
	}));

	router.patch("/employees/:employeeId", authRequired(["Admin"]), validate(employeeSchema), asyncHandler(async (req, res) => {
		const employee = await appRepository.updateEmployee(req.params.employeeId, req.body);
		if (!employee) throw new HttpError(404, "Employee not found");
		res.json(employee);
	}));

	router.delete("/employees/:employeeId", authRequired(["Admin"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteEmployee(req.params.employeeId);
		if (!deleted) throw new HttpError(404, "Employee not found");
		res.status(204).send();
	}));

	router.get("/kpi-periods", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listKpiPeriods());
	}));

	router.get("/kpi-targets", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listKpiTargets({ userId: req.user.id, periodId: req.query.periodId, role: req.user.role }));
	}));

	router.get("/kpi-records", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listKpiRecords({ userId: req.user.id, role: req.user.role, periodId: req.query.periodId, status: req.query.status }));
	}));

	router.get("/kpi-rankings", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listKpiRankings({ periodId: req.query.periodId }));
	}));

	router.post("/kpi-targets", authRequired(["Admin", "Manager"]), validate(kpiTargetSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createKpiTarget(req.user.id, req.body));
	}));

	router.post("/kpi-records/submit", authRequired(), validate(kpiSubmitSchema), asyncHandler(async (req, res) => {
		const body = { ...req.body };
		const target = (body.targetId ? await appRepository.listKpiTargets({ userId: req.user.id, periodId: body.periodId }) : await appRepository.listKpiTargets({ userId: req.user.id, periodId: body.periodId })).find((item) => Number(item.userId) === Number(req.user.id)) || null;
		let engineResult = null;
		if (body.auto) {
			// try to compute automatically using engine based on tasks and target
			engineResult = await computeUserKpi({ userId: req.user.id, role: req.user.role, periodId: body.periodId, target });
			body.productivityScore = engineResult.productivityScore;
			body.qualityScore = engineResult.qualityScore;
			body.timelinessScore = engineResult.timelinessScore;
			// finalScore will be computed by repository's submitKpiResult using weightedScore
		}
		const record = await appRepository.submitKpiResult(req.user.id, body);
		const period = (await appRepository.listKpiPeriods()).find((item) => Number(item.id) === Number(body.periodId)) || null;
		if (body.auto) {
			await sendKpiResultEmail({
				to: req.user.email,
				fullName: req.user.fullName,
				period,
				record,
				engineResult,
				target
			});
		}
		res.status(201).json({
			record,
			period,
			periodLabel: period?.label || `Period ${body.periodId}`,
			recipientName: req.user.fullName,
			target,
			engineResult,
			emailSent: Boolean(body.auto)
		});
	}));

	router.patch("/kpi-records/:recordId/review", authRequired(["Admin", "Manager"]), validate(kpiReviewSchema), asyncHandler(async (req, res) => {
		const record = await appRepository.reviewKpiResult(req.params.recordId, req.user.id, req.body.decision, req.body.note);
		if (!record) throw new HttpError(404, "KPI record not found");
		res.json(record);
	}));

	router.post("/kpi-periods/:periodId/lock", authRequired(["Admin"]), asyncHandler(async (req, res) => {
		const period = await appRepository.lockKpiPeriod(req.params.periodId, req.user.id);
		if (!period) throw new HttpError(404, "KPI period not found");
		res.json(period);
	}));

	router.post("/demo/reset", authRequired(["Admin"]), asyncHandler(async (req, res) => {
		res.json(await appRepository.resetDemoData());
	}));

	router.get("/tasks", authRequired(), asyncHandler(async (req, res) => {
		const data = await taskService.list({
			role: req.user.role,
			userId: req.user.id,
			status: req.query.status,
			search: req.query.search,
			page: Number(req.query.page || 1),
			limit: Number(req.query.limit || 10),
			projectId: req.query.projectId
		});
		res.json(data);
	}));

	router.post("/tasks", authRequired(["Admin", "Manager"]), validate(taskCreateSchema), asyncHandler(async (req, res) => {
		const payload = req.body;
		const task = await taskService.create(payload, req.user.id);
		await taskService.addNotification({
			userId: Number(payload.assignedTo),
			type: "task_assigned",
			title: "Task assigned",
			message: `${task.title} has been assigned to you.`
		});
		req.io?.emit("notification", {
			type: "task_assigned",
			userId: Number(payload.assignedTo),
			title: "Task assigned",
			message: `${task.title} has been assigned to you.`
		});
		res.status(201).json(task);
	}));

	router.get("/projects", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listProjects());
	}));

	router.post("/projects", authRequired(["Admin", "Manager"]), validate(projectSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createProject(req.body));
	}));

	router.patch("/projects/:projectId", authRequired(["Admin"]), validate(projectSchema), asyncHandler(async (req, res) => {
		const project = await appRepository.updateProject(req.params.projectId, req.body);
		if (!project) throw new HttpError(404, "Project not found");
		res.json(project);
	}));

	router.delete("/projects/:projectId", authRequired(["Admin"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteProject(req.params.projectId);
		if (!deleted) throw new HttpError(404, "Project not found");
		res.status(204).send();
	}));

	router.get("/criteria", authRequired(["Admin", "Manager"]), asyncHandler(async (req, res) => {
		res.json(await appRepository.listCriteria());
	}));

	router.post("/criteria", authRequired(["Admin"]), validate(criteriaSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createCriteria(req.body));
	}));

	router.patch("/criteria/:criteriaId", authRequired(["Admin"]), validate(criteriaSchema), asyncHandler(async (req, res) => {
		const item = await appRepository.updateCriteria(req.params.criteriaId, req.body);
		if (!item) throw new HttpError(404, "Criteria not found");
		res.json(item);
	}));

	router.delete("/criteria/:criteriaId", authRequired(["Admin"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteCriteria(req.params.criteriaId);
		if (!deleted) throw new HttpError(404, "Criteria not found");
		res.status(204).send();
	}));

	router.patch("/tasks/:taskId/progress", authRequired(), asyncHandler(async (req, res) => {
		const task = await taskService.updateProgress({
			taskId: req.params.taskId,
			progress: req.body.progress,
			status: req.body.status,
			note: req.body.note,
			actorId: req.user.id,
			actorRole: req.user.role
		});
		await taskService.addNotification({
			userId: Number(task.assignedBy || req.user.id),
			type: "task_update",
			title: "Task progress updated",
			message: `${task.title} is now ${task.progress}% complete.`
		});
		req.io?.emit("notification", {
			type: "task_update",
			userId: Number(task.assignedBy || req.user.id),
			title: "Task progress updated",
			message: `${task.title} is now ${task.progress}% complete.`
		});
		res.json(task);
	}));

	router.get("/tasks/:taskId", authRequired(), asyncHandler(async (req, res) => {
		const task = await appRepository.getTaskById(req.params.taskId);
		if (!task) throw new HttpError(404, "Task not found");
		res.json(task);
	}));

	router.patch("/tasks/:taskId", authRequired(), validate(taskUpdateSchema), asyncHandler(async (req, res) => {
		const task = await appRepository.updateTask(req.params.taskId, req.user.id, req.user.role, req.body);
		if (!task) throw new HttpError(404, "Task not found");
		res.json(task);
	}));

	router.delete("/tasks/:taskId", authRequired(["Admin", "Manager"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteTask(req.params.taskId, req.user.id, req.user.role);
		if (!deleted) throw new HttpError(404, "Task not found");
		res.status(204).send();
	}));

	router.get("/notifications", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listNotifications(req.user.id));
	}));

	router.patch("/notifications/:notificationId/read", authRequired(), asyncHandler(async (req, res) => {
		const notification = await appRepository.markNotificationAsRead(req.params.notificationId, req.user.id);
		if (!notification) throw new HttpError(404, "Notification not found");
		res.json(notification);
	}));

	router.patch("/notifications/read-all", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.markAllNotificationsAsRead(req.user.id));
	}));

	router.get("/reports", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.listReports({
			userId: req.user.id,
			role: req.user.role,
			status: req.query.status,
			search: req.query.search
		}));
	}));

	router.get("/reports/export", authRequired(), asyncHandler(async (req, res) => {
		const items = await appRepository.listReports({ userId: req.user.id, role: req.user.role, status: req.query.status, search: req.query.search });
		const type = (req.query.type || "csv").toLowerCase();
		if (type === "pdf") {
			writePdfResponse(
				res,
				`reports_${Date.now()}.pdf`,
				"HRMS Reports Export",
				items.map((item) => [item.title, item.category, item.periodLabel, item.status, item.summary || ""]),
				["Title", "Category", "Period", "Status", "Summary"]
			);
			return;
		}
		if (type === "xlsx" || type === "excel") {
			const workbook = XLSX.utils.book_new();
			const sheet = XLSX.utils.json_to_sheet(items.map((item) => ({
				id: item.id,
				title: item.title,
				category: item.category,
				periodLabel: item.periodLabel,
				status: item.status,
				summary: item.summary,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt
			})));
			XLSX.utils.book_append_sheet(workbook, sheet, "Reports");
			const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
			res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			res.setHeader("Content-Disposition", `attachment; filename=reports_${Date.now()}.xlsx`);
			res.send(buffer);
			return;
		}
		if (type === "csv") {
			const headers = ["id", "userId", "title", "category", "periodLabel", "status", "summary", "createdAt", "updatedAt"];
			const rows = items.map((r) => headers.map((h) => {
				const v = r[h] ?? "";
				const s = String(v).replace(/"/g, '""');
				return `"${s}"`;
			}).join(","));
			const csv = [headers.join(","), ...rows].join("\n");
			res.setHeader("Content-Type", "text/csv; charset=utf-8");
			res.setHeader("Content-Disposition", `attachment; filename=reports_${Date.now()}.csv`);
			res.send(csv);
			return;
		}
		res.status(501).json({ message: "Only CSV export is supported" });
	}));

	router.get("/kpi-rankings/export", authRequired(), asyncHandler(async (req, res) => {
		const items = await appRepository.listKpiRankings({ periodId: req.query.periodId });
		const type = (req.query.type || "csv").toLowerCase();
		if (type === "pdf") {
			writePdfResponse(
				res,
				`kpi_rankings_${Date.now()}.pdf`,
				"HRMS KPI Rankings",
				items.map((item) => [String(item.rank), item.fullName, item.departmentName, String(item.finalScore), item.status]),
				["Rank", "Employee", "Department", "Score", "Status"]
			);
			return;
		}
		if (type === "xlsx" || type === "excel") {
			const workbook = XLSX.utils.book_new();
			const sheet = XLSX.utils.json_to_sheet(items.map((item) => ({
				rank: item.rank,
				fullName: item.fullName,
				departmentName: item.departmentName,
				finalScore: item.finalScore,
				status: item.status,
				productivityScore: item.productivityScore,
				qualityScore: item.qualityScore,
				timelinessScore: item.timelinessScore,
				remarks: item.remarks
			})));
			XLSX.utils.book_append_sheet(workbook, sheet, "KPI Rankings");
			const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
			res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
			res.setHeader("Content-Disposition", `attachment; filename=kpi_rankings_${Date.now()}.xlsx`);
			res.send(buffer);
			return;
		}
		const headers = ["rank", "fullName", "departmentName", "finalScore", "status", "productivityScore", "qualityScore", "timelinessScore", "remarks"];
		const rows = items.map((r) => headers.map((h) => {
			const v = r[h] ?? "";
			const s = String(v).replace(/"/g, '""');
			return `"${s}"`;
		}).join(","));
		const csv = [headers.join(","), ...rows].join("\n");
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename=kpi_rankings_${Date.now()}.csv`);
		res.send(csv);
	}));

	router.get("/reports/:reportId/export", authRequired(), asyncHandler(async (req, res) => {
		const report = (await appRepository.listReports({ userId: req.user.id, role: req.user.role })).find((r) => String(r.id) === String(req.params.reportId));
		if (!report) throw new HttpError(404, "Report not found");
		const csv = `id,title,category,periodLabel,status,summary\n"${String(report.id).replace(/"/g,'""')}","${(report.title||"").replace(/"/g,'""')}","${(report.category||"").replace(/"/g,'""')}","${(report.periodLabel||"").replace(/"/g,'""')}","${(report.status||"").replace(/"/g,'""')}","${(report.summary||"").replace(/"/g,'""')}"`;
		res.setHeader("Content-Type", "text/csv; charset=utf-8");
		res.setHeader("Content-Disposition", `attachment; filename=report_${report.id}.csv`);
		res.send(csv);
	}));

	router.post("/reports", authRequired(), validate(reportCreateSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createReport(req.user.id, req.body));
	}));

	router.patch("/reports/:reportId", authRequired(), validate(reportCreateSchema), asyncHandler(async (req, res) => {
		const report = await appRepository.updateReport(req.params.reportId, req.user.id, req.user.role, req.body);
		if (!report) throw new HttpError(404, "Report not found");
		res.json(report);
	}));

	router.delete("/reports/:reportId", authRequired(), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteReport(req.params.reportId, req.user.id, req.user.role);
		if (!deleted) throw new HttpError(404, "Report not found");
		res.status(204).send();
	}));

	router.get("/leave-requests", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getLeaveRequests(req.user.id, req.user.role));
	}));

	router.post("/leave-requests", authRequired(), validate(leaveCreateSchema), asyncHandler(async (req, res) => {
		const leaveRequest = await appRepository.createLeaveRequest(req.user.id, req.body);
		req.io?.emit("notification", {
			userId: req.user.id,
			type: "leave_requested",
			title: "Leave request submitted",
			message: `${leaveRequest.leaveType} request is now ${leaveRequest.status}.`
		});
		res.status(201).json(leaveRequest);
	}));

	router.get("/leave-requests/:leaveId", authRequired(), asyncHandler(async (req, res) => {
		const leave = await appRepository.getLeaveRequestById(req.params.leaveId);
		if (!leave) throw new HttpError(404, "Leave request not found");
		res.json(leave);
	}));

	router.patch("/leave-requests/:leaveId", authRequired(), validate(leaveUpdateSchema), asyncHandler(async (req, res) => {
		const leave = await appRepository.updateLeaveRequest(req.params.leaveId, req.user.id, req.user.role, req.body);
		if (!leave) throw new HttpError(404, "Leave request not found");
		res.json(leave);
	}));

	router.delete("/leave-requests/:leaveId", authRequired(["Admin", "Manager"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteLeaveRequest(req.params.leaveId, req.user.id, req.user.role);
		if (!deleted) throw new HttpError(404, "Leave request not found");
		res.status(204).send();
	}));

	router.get("/attendance/checkins", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getAttendance(req.user.id, req.user.role));
	}));

	router.post("/attendance/checkins", authRequired(), validate(checkinCreateSchema), asyncHandler(async (req, res) => {
		res.status(201).json({
			id: Date.now(),
			userId: req.user.id,
			checkInAt: new Date().toISOString(),
			status: req.body.status || "On time",
			note: req.body.note || "Manual check-in"
		});
	}));

	router.get("/attendance/shifts", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getShiftAssignments());
	}));

	router.get("/expense-claims", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getExpenseClaims(req.user.id, req.user.role));
	}));

	router.post("/expense-claims", authRequired(), validate(expenseCreateSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createExpenseClaim(req.user.id, req.body));
	}));

	router.get("/expense-claims/:id", authRequired(), asyncHandler(async (req, res) => {
		const item = await appRepository.getExpenseClaimById(req.params.id);
		if (!item) throw new HttpError(404, "Expense claim not found");
		res.json(item);
	}));

	router.patch("/expense-claims/:id", authRequired(), validate(expenseUpdateSchema), asyncHandler(async (req, res) => {
		const item = await appRepository.updateExpenseClaim(req.params.id, req.user.id, req.user.role, req.body);
		if (!item) throw new HttpError(404, "Expense claim not found");
		res.json(item);
	}));

	router.delete("/expense-claims/:id", authRequired(["Admin", "Manager"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteExpenseClaim(req.params.id, req.user.id, req.user.role);
		if (!deleted) throw new HttpError(404, "Expense claim not found");
		res.status(204).send();
	}));

	router.get("/employee-advances", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getEmployeeAdvances(req.user.id, req.user.role));
	}));

	router.post("/employee-advances", authRequired(), validate(advanceCreateSchema), asyncHandler(async (req, res) => {
		res.status(201).json(await appRepository.createEmployeeAdvance(req.user.id, req.body));
	}));

	router.get("/employee-advances/:id", authRequired(), asyncHandler(async (req, res) => {
		const item = await appRepository.getEmployeeAdvanceById(req.params.id);
		if (!item) throw new HttpError(404, "Employee advance not found");
		res.json(item);
	}));

	router.patch("/employee-advances/:id", authRequired(), validate(advanceUpdateSchema), asyncHandler(async (req, res) => {
		const item = await appRepository.updateEmployeeAdvance(req.params.id, req.user.id, req.user.role, req.body);
		if (!item) throw new HttpError(404, "Employee advance not found");
		res.json(item);
	}));

	router.delete("/employee-advances/:id", authRequired(["Admin", "Manager"]), asyncHandler(async (req, res) => {
		const deleted = await appRepository.deleteEmployeeAdvance(req.params.id, req.user.id, req.user.role);
		if (!deleted) throw new HttpError(404, "Employee advance not found");
		res.status(204).send();
	}));

	router.get("/salary-slips", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getSalarySlips(req.user.id, req.user.role));
	}));

	router.get("/profile", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getProfile(req.user.id));
	}));

	router.get("/settings", authRequired(), asyncHandler(async (req, res) => {
		res.json(await appRepository.getSettings(req.user.id));
	}));

	router.put("/settings", authRequired(), validate(settingsUpdateSchema), asyncHandler(async (req, res) => {
		res.json(await appRepository.updateSettings(req.user.id, req.body));
	}));

	router.post("/assistant/chat", authRequired(), asyncHandler(async (req, res) => {
		const reply = await assistantService.chat({ role: req.user.role, userId: req.user.id, message: req.body.message || "" });
		res.json({ reply });
	}));

	return router;
};