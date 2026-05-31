import { getDatabasePool } from "../config/database.js";
import { attendanceCheckins, departments, employeeAdvances, expenseClaims, kpiPeriods, kpiRecords, kpiTargets, leaveRequests, nextSeedId, notifications, reports, resetSeedState, salarySlips, shiftAssignments, tasks, userSettings, users, projects } from "../data/seed.js";
import { criteria } from "../data/seed.js";
import { HttpError } from "../utils/httpError.js";

const hasDatabase = () => Boolean(getDatabasePool());

const mapRole = (roleId) => ({ 1: "Admin", 2: "Manager", 3: "Employee" }[Number(roleId)] || "Employee");

const mapUserRow = (row) => ({
	id: row.id,
	role: row.role || mapRole(row.role_id),
	fullName: row.full_name,
	email: row.email,
	passwordHash: row.password_hash
});

const mapTaskRow = (row) => ({
	id: row.id,
	assignedBy: row.assigned_by,
	assignedTo: row.assigned_to,
	projectId: row.project_id || row.projectId || null,
	title: row.title,
	description: row.description || "",
	priority: row.priority,
	status: row.status,
	dueDate: row.due_date,
	progress: Number(row.progress),
	estimatedHours: Number(row.estimated_hours),
	actualHours: Number(row.actual_hours),
	comments: Number(row.comments || 0),
	attachments: Number(row.attachments || 0),
	assignedByName: row.assigned_by_name,
	assignedToName: row.assigned_to_name
});

const findProject = (projectId) => projects.find((p) => Number(p.id) === Number(projectId));
const findCriteria = (criteriaId) => criteria.find((c) => Number(c.id) === Number(criteriaId));

const mapKpiRow = (row) => ({
	userId: row.user_id,
	cycleLabel: row.cycle_label,
	productivityScore: Number(row.productivity_score),
	qualityScore: Number(row.quality_score),
	timelinessScore: Number(row.timeliness_score),
	finalScore: Number(row.final_score),
	remarks: row.remarks || ""
});

const mapNotificationRow = (row) => ({
	id: row.id,
	userId: row.user_id,
	type: row.type,
	title: row.title,
	message: row.message,
	isRead: Boolean(row.is_read),
	createdAt: row.created_at
});

const mapReportRow = (row) => ({
	id: row.id,
	userId: row.user_id,
	title: row.title,
	category: row.category,
	periodLabel: row.period_label,
	status: row.status,
	summary: row.summary || "",
	createdAt: row.created_at,
	updatedAt: row.updated_at
});

const clone = (value) => JSON.parse(JSON.stringify(value));

const findUser = (userId) => users.find((item) => Number(item.id) === Number(userId));

const findDepartment = (departmentId) => departments.find((item) => Number(item.id) === Number(departmentId));

const findKpiPeriod = (periodId) => kpiPeriods.find((item) => Number(item.id) === Number(periodId));

const findKpiTarget = (targetId) => kpiTargets.find((item) => Number(item.id) === Number(targetId));

const findKpiRecord = (recordId) => kpiRecords.find((item) => Number(item.id) === Number(recordId));

const latestRecordForUser = (userId) => {
	const records = kpiRecords.filter((item) => Number(item.userId) === Number(userId));
	return records.sort((left, right) => Number(right.periodId) - Number(left.periodId))[0] || null;
};

const weightedScore = ({ productivityScore = 0, qualityScore = 0, timelinessScore = 0 }, target = {}) => {
	const weights = {
		productivityWeight: Number(target.productivityWeight || 33),
		qualityWeight: Number(target.qualityWeight || 33),
		timelinessWeight: Number(target.timelinessWeight || 34)
	};
	const totalWeight = weights.productivityWeight + weights.qualityWeight + weights.timelinessWeight || 100;
	return Math.round((Number(productivityScore) * weights.productivityWeight + Number(qualityScore) * weights.qualityWeight + Number(timelinessScore) * weights.timelinessWeight) / totalWeight);
};

const pushHistory = (record, action, by, note) => {
	record.history = record.history || [];
	record.history.unshift({ at: new Date().toISOString(), action, by, note });
};

export const appRepository = {
	hasDatabase,

	async getUserByEmail(email) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query(
				`SELECT u.id, u.full_name, u.email, u.password_hash, r.name AS role
				 FROM users u
				 INNER JOIN roles r ON r.id = u.role_id
				 WHERE LOWER(u.email) = LOWER(?)
				 LIMIT 1`,
				[email]
			);
			return rows[0] ? mapUserRow(rows[0]) : null;
		}

		const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
		return user ? { id: user.id, role: user.role, fullName: user.fullName, email: user.email, passwordHash: user.password } : null;
	},

	async listDepartments() {
		return departments.map((department) => ({
			...clone(department),
			managerName: findUser(department.managerId)?.fullName || "Unassigned",
			employeeCount: users.filter((item) => Number(item.departmentId) === Number(department.id)).length
		}));
	},

	async createDepartment(payload) {
		const department = {
			id: nextSeedId(departments),
			name: payload.name,
			code: payload.code,
			managerId: payload.managerId ? Number(payload.managerId) : null,
			headcount: 0,
			protected: false
		};
		departments.unshift(department);
		return department;
	},

	async updateDepartment(departmentId, payload) {
		const department = departments.find((item) => Number(item.id) === Number(departmentId));
		if (!department) return null;
		Object.assign(department, {
			name: payload.name ?? department.name,
			code: payload.code ?? department.code,
			managerId: payload.managerId === undefined ? department.managerId : payload.managerId ? Number(payload.managerId) : null
		});
		return department;
	},

	async deleteDepartment(departmentId) {
		const index = departments.findIndex((item) => Number(item.id) === Number(departmentId));
		if (index < 0) return false;
		const fallbackDepartment = departments.find((item) => Number(item.id) !== Number(departmentId) && Number(item.id) !== 1) || departments.find((item) => Number(item.id) !== Number(departmentId)) || null;
		const fallbackDepartmentId = fallbackDepartment?.id || 1;
		users.forEach((user) => {
			if (Number(user.departmentId) === Number(departmentId) && user.role !== "Admin") {
				user.departmentId = fallbackDepartmentId;
				user.managerId = null;
			}
		});
		departments.splice(index, 1);
		return true;
	},

	async listProjects() {
		return projects.map((p) => ({ ...clone(p), ownerName: findUser(p.ownerId)?.fullName || 'Unassigned' }));
	},

	async createProject(payload) {
		const project = {
			id: nextSeedId(projects),
			name: payload.name,
			code: payload.code,
			description: payload.description || "",
			ownerId: payload.ownerId ? Number(payload.ownerId) : null,
			protected: false
		};
		projects.unshift(project);
		return project;
	},

	async updateProject(projectId, payload) {
		const project = projects.find((p) => Number(p.id) === Number(projectId));
		if (!project) return null;
		Object.assign(project, {
			name: payload.name ?? project.name,
			code: payload.code ?? project.code,
			description: payload.description ?? project.description,
			ownerId: payload.ownerId === undefined ? project.ownerId : payload.ownerId ? Number(payload.ownerId) : null
		});
		return project;
	},

	async deleteProject(projectId) {
		const index = projects.findIndex((p) => Number(p.id) === Number(projectId));
		if (index < 0) return false;
		// reassign tasks associated to null project
		tasks.forEach((task) => {
			if (Number(task.projectId) === Number(projectId)) {
				task.projectId = null;
			}
		});
		projects.splice(index, 1);
		return true;
	},

	async listCriteria() {
		return criteria.map((c) => ({ ...clone(c) }));
	},

	async createCriteria(payload) {
		const item = {
			id: nextSeedId(criteria),
			code: payload.code,
			name: payload.name,
			description: payload.description || "",
			weight: Number(payload.weight || 0),
			type: payload.type || "other",
			protected: false
		};
		criteria.unshift(item);
		return item;
	},

	async updateCriteria(criteriaId, payload) {
		const item = criteria.find((c) => Number(c.id) === Number(criteriaId));
		if (!item) return null;
		Object.assign(item, {
			code: payload.code ?? item.code,
			name: payload.name ?? item.name,
			description: payload.description ?? item.description,
			weight: payload.weight === undefined ? item.weight : Number(payload.weight),
			type: payload.type ?? item.type
		});
		return item;
	},

	async deleteCriteria(criteriaId) {
		const idx = criteria.findIndex((c) => Number(c.id) === Number(criteriaId));
		if (idx < 0) return false;
		criteria.splice(idx, 1);
		return true;
	},

	async listEmployees({ departmentId }) {
		let items = users.filter((item) => item.role === "Employee" || item.role === "Manager");
		if (departmentId) {
			items = items.filter((item) => Number(item.departmentId) === Number(departmentId));
		}
		return items.map((item) => ({
			id: item.id,
			fullName: item.fullName,
			email: item.email,
			role: item.role,
			departmentId: item.departmentId,
			departmentName: findDepartment(item.departmentId)?.name || "Unknown",
			managerId: item.managerId,
			managerName: findUser(item.managerId)?.fullName || "Unassigned"
		}));
	},

	async createEmployee(payload) {
		const employee = {
			id: nextSeedId(users),
			role: payload.role,
			fullName: payload.fullName,
			email: payload.email,
			password: payload.password || "employee123",
			departmentId: Number(payload.departmentId),
			managerId: payload.managerId ? Number(payload.managerId) : null,
			protected: false
		};
		users.unshift(employee);
		return {
			id: employee.id,
			role: employee.role,
			fullName: employee.fullName,
			email: employee.email,
			departmentId: employee.departmentId,
			departmentName: findDepartment(employee.departmentId)?.name || "Unknown",
			managerId: employee.managerId,
			managerName: findUser(employee.managerId)?.fullName || "Unassigned"
		};
	},

	async updateEmployee(employeeId, payload) {
		const employee = users.find((item) => Number(item.id) === Number(employeeId));
		if (!employee) return null;
		if (employee.protected && employee.role === "Admin" && Number(employee.id) === 1) {
			throw new HttpError(403, "Admin account cannot be modified in demo mode");
		}
		Object.assign(employee, {
			role: payload.role ?? employee.role,
			fullName: payload.fullName ?? employee.fullName,
			email: payload.email ?? employee.email,
			password: payload.password || employee.password,
			departmentId: payload.departmentId === undefined ? employee.departmentId : Number(payload.departmentId),
			managerId: payload.managerId === undefined ? employee.managerId : payload.managerId ? Number(payload.managerId) : null
		});
		return {
			id: employee.id,
			role: employee.role,
			fullName: employee.fullName,
			email: employee.email,
			departmentId: employee.departmentId,
			departmentName: findDepartment(employee.departmentId)?.name || "Unknown",
			managerId: employee.managerId,
			managerName: findUser(employee.managerId)?.fullName || "Unassigned"
		};
	},

	async deleteEmployee(employeeId) {
		const index = users.findIndex((item) => Number(item.id) === Number(employeeId));
		if (index < 0) return false;
		if (Number(users[index].id) === 1) throw new HttpError(400, "Admin account cannot be deleted");
		users.splice(index, 1);
		return true;
	},

	async listKpiPeriods() {
		return clone(kpiPeriods);
	},

	async listKpiTargets({ userId, periodId, role }) {
		let items = kpiTargets;
		if (periodId) {
			items = items.filter((item) => Number(item.periodId) === Number(periodId));
		}
		if (role === "Employee") {
			items = items.filter((item) => Number(item.userId) === Number(userId));
		}
		return items.map((item) => ({
			...clone(item),
			period: findKpiPeriod(item.periodId),
			employee: findUser(item.userId)
		}));
	},

	async listKpiRecords({ userId, role, periodId, status }) {
		let items = kpiRecords;
		if (role === "Employee") {
			items = items.filter((item) => Number(item.userId) === Number(userId));
		} else if (role === "Manager") {
			const manager = findUser(userId);
			items = items.filter((item) => {
				const employee = findUser(item.userId);
				return employee && Number(employee.managerId) === Number(manager?.id);
			});
		}
		if (periodId) items = items.filter((item) => Number(item.periodId) === Number(periodId));
		if (status) items = items.filter((item) => item.status === status);
		return items.map((item) => ({
			...clone(item),
			period: findKpiPeriod(item.periodId),
			target: findKpiTarget(item.targetId),
			employee: findUser(item.userId)
		}));
	},

	async listKpiRankings({ periodId }) {
		const scoped = kpiRecords.filter((item) => !periodId || Number(item.periodId) === Number(periodId));
		const latestByUser = new Map();
		scoped.forEach((item) => {
			const current = latestByUser.get(Number(item.userId));
			const currentTime = new Date(current?.submittedAt || current?.createdAt || 0).getTime();
			const itemTime = new Date(item.submittedAt || item.createdAt || 0).getTime();
			if (!current || itemTime >= currentTime) {
				latestByUser.set(Number(item.userId), item);
			}
		});
		return Array.from(latestByUser.values())
			.map((item) => ({
				userId: item.userId,
				fullName: findUser(item.userId)?.fullName || "Unknown",
				departmentName: findDepartment(findUser(item.userId)?.departmentId)?.name || "Unknown",
				periodId: item.periodId,
				finalScore: Number(item.finalScore),
				status: item.status,
				productivityScore: Number(item.productivityScore),
				qualityScore: Number(item.qualityScore),
				timelinessScore: Number(item.timelinessScore),
				remarks: item.remarks || ""
			}))
			.sort((left, right) => right.finalScore - left.finalScore)
			.map((item, index) => ({ ...item, rank: index + 1 }));
	},

	async getUserById(userId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query(
				`SELECT u.id, u.full_name, u.email, u.password_hash, r.name AS role
				 FROM users u
				 INNER JOIN roles r ON r.id = u.role_id
				 WHERE u.id = ?
				 LIMIT 1`,
				[userId]
			);
			return rows[0] ? mapUserRow(rows[0]) : null;
		}

		const user = users.find((item) => item.id === Number(userId));
		return user ? { id: user.id, role: user.role, fullName: user.fullName, email: user.email, passwordHash: user.password } : null;
	},

	async listTasks({ role, userId, status, search, page, limit, projectId }) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];

			if (role === "Employee") {
				filters.push("t.assigned_to = ?");
				params.push(userId);
			} else if (role === "Manager") {
				filters.push("(t.assigned_by = ? OR t.assigned_to = ?)");
				params.push(userId, userId);
			}

			if (status) {
				filters.push("t.status = ?");
				params.push(status);
			}

			if (projectId) {
				filters.push("t.project_id = ?");
				params.push(projectId);
			}

			if (search) {
				filters.push("(t.title LIKE ? OR t.description LIKE ?)");
				params.push(`%${search}%`, `%${search}%`);
			}

			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const offset = (page - 1) * limit;
			const [rows] = await pool.query(
				`SELECT t.*, ua.full_name AS assigned_by_name, ub.full_name AS assigned_to_name
				 FROM tasks t
				 INNER JOIN users ua ON ua.id = t.assigned_by
				 INNER JOIN users ub ON ub.id = t.assigned_to
				 ${whereClause}
				 ORDER BY t.created_at DESC
				 LIMIT ? OFFSET ?`,
				[...params, limit, offset]
			);
			const [countRows] = await pool.query(
				`SELECT COUNT(*) AS total
				 FROM tasks t
				 ${whereClause}`,
				params
			);
			return { items: rows.map(mapTaskRow), total: Number(countRows[0]?.total || 0), page, limit };
		}

		let items = tasks.map((task) => {
			const assignedBy = users.find((user) => user.id === task.assignedBy);
			const assignedTo = users.find((user) => user.id === task.assignedTo);
			return {
				...task,
				assignedByName: assignedBy?.fullName || "Unknown",
				assignedToName: assignedTo?.fullName || "Unknown"
			};
		});

		if (role === "Employee") {
			items = items.filter((task) => task.assignedTo === Number(userId));
		}

		if (role === "Manager") {
			items = items.filter((task) => task.assignedBy === Number(userId) || task.assignedTo === Number(userId));
		}

		if (status) {
			items = items.filter((task) => task.status === status);
		}

		if (projectId) {
			items = items.filter((task) => Number(task.projectId || task.project_id || 0) === Number(projectId));
		}

		if (search) {
			const keyword = search.toLowerCase();
			items = items.filter((task) => task.title.toLowerCase().includes(keyword) || task.description.toLowerCase().includes(keyword));
		}

		const total = items.length;
		const offset = (page - 1) * limit;
		return { items: items.slice(offset, offset + limit), total, page, limit };
	},

	async createTask(payload, actorId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [result] = await pool.query(
				`INSERT INTO tasks (assigned_by, assigned_to, title, description, priority, status, due_date, progress, estimated_hours, actual_hours)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					actorId,
					payload.assignedTo,
					payload.projectId || null,
					payload.title,
					payload.description || "",
					payload.priority || "Medium",
					payload.status || "Open",
					payload.dueDate || null,
					Number(payload.progress || 0),
					Number(payload.estimatedHours || 0),
					Number(payload.actualHours || 0)
				]
			);
			const [rows] = await pool.query(
					`SELECT t.*, ua.full_name AS assigned_by_name, ub.full_name AS assigned_to_name, t.project_id
				 FROM tasks t
				 INNER JOIN users ua ON ua.id = t.assigned_by
				 INNER JOIN users ub ON ub.id = t.assigned_to
				 WHERE t.id = ?
				 LIMIT 1`,
				[result.insertId]
			);
			return mapTaskRow(rows[0]);
		}

		const task = {
			id: Date.now(),
			assignedBy: Number(actorId),
			assignedTo: Number(payload.assignedTo),
			projectId: payload.projectId ? Number(payload.projectId) : null,
			title: payload.title,
			description: payload.description || "",
			priority: payload.priority || "Medium",
			status: payload.status || "Open",
			dueDate: payload.dueDate || null,
			progress: Number(payload.progress || 0),
			estimatedHours: Number(payload.estimatedHours || 0),
			actualHours: Number(payload.actualHours || 0),
			comments: 0,
			attachments: 0
		};
		tasks.unshift(task);
		const assignedTo = users.find((user) => user.id === task.assignedTo);
		const assignedBy = users.find((user) => user.id === task.assignedBy);
		return { ...task, assignedToName: assignedTo?.fullName || "Unknown", assignedByName: assignedBy?.fullName || "Unknown", projectName: findProject(task.projectId)?.name || null };
	},

	async getTaskById(taskId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query(
				`SELECT t.*, ua.full_name AS assigned_by_name, ub.full_name AS assigned_to_name
				 FROM tasks t
				 INNER JOIN users ua ON ua.id = t.assigned_by
				 INNER JOIN users ub ON ub.id = t.assigned_to
				 WHERE t.id = ? LIMIT 1`,
				[taskId]
			);
			return rows[0] ? mapTaskRow(rows[0]) : null;
		}

		const task = tasks.find((t) => Number(t.id) === Number(taskId));
		if (!task) return null;
		const assignedTo = users.find((u) => u.id === task.assignedTo);
		const assignedBy = users.find((u) => u.id === task.assignedBy);
		return { ...task, assignedToName: assignedTo?.fullName || "Unknown", assignedByName: assignedBy?.fullName || "Unknown", projectId: task.projectId || null, projectName: findProject(task.projectId)?.name || null };
	},

	async updateTask(taskId, userId, role, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [taskId]);
			if (!rows[0]) return null;
			const task = rows[0];
			// permission: only Admin or assignedBy or assignedTo or Manager can update
			if (role !== "Admin" && Number(task.assigned_by) !== Number(userId) && Number(task.assigned_to) !== Number(userId)) {
				throw new HttpError(403, "You cannot update this task");
			}
			await pool.query(
				"UPDATE tasks SET title = COALESCE(?, title), description = COALESCE(?, description), priority = COALESCE(?, priority), status = COALESCE(?, status), due_date = COALESCE(?, due_date), estimated_hours = COALESCE(?, estimated_hours), actual_hours = COALESCE(?, actual_hours) WHERE id = ?",
				[payload.title, payload.description, payload.priority, payload.status, payload.dueDate, payload.estimatedHours, payload.actualHours, taskId]
			);
			const [updatedRows] = await pool.query(
				`SELECT t.*, ua.full_name AS assigned_by_name, ub.full_name AS assigned_to_name
				 FROM tasks t
				 INNER JOIN users ua ON ua.id = t.assigned_by
				 INNER JOIN users ub ON ub.id = t.assigned_to
				 WHERE t.id = ? LIMIT 1`,
				[taskId]
			);
			return mapTaskRow(updatedRows[0]);
		}

		const task = tasks.find((t) => Number(t.id) === Number(taskId));
		if (!task) return null;
		if (role !== "Admin" && task.assignedBy !== Number(userId) && task.assignedTo !== Number(userId)) {
			throw new HttpError(403, "You cannot update this task");
		}
		Object.assign(task, {
			title: payload.title ?? task.title,
			description: payload.description ?? task.description,
			priority: payload.priority ?? task.priority,
			status: payload.status ?? task.status,
			projectId: payload.projectId === undefined ? task.projectId : payload.projectId ? Number(payload.projectId) : null,
			dueDate: payload.dueDate ?? task.dueDate,
			estimatedHours: payload.estimatedHours ?? task.estimatedHours,
			actualHours: payload.actualHours ?? task.actualHours
		});
		const assignedTo = users.find((u) => u.id === task.assignedTo);
		const assignedBy = users.find((u) => u.id === task.assignedBy);
		return { ...task, assignedToName: assignedTo?.fullName || "Unknown", assignedByName: assignedBy?.fullName || "Unknown", projectId: task.projectId || null, projectName: findProject(task.projectId)?.name || null };
	},

	async deleteTask(taskId, userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [taskId]);
			if (!rows[0]) return false;
			const task = rows[0];
			if (role !== "Admin" && Number(task.assigned_by) !== Number(userId)) {
				throw new HttpError(403, "You cannot delete this task");
			}
			await pool.query("DELETE FROM tasks WHERE id = ?", [taskId]);
			return true;
		}

		const index = tasks.findIndex((t) => Number(t.id) === Number(taskId));
		if (index < 0) return false;
		const task = tasks[index];
		if (task.protected) {
			throw new HttpError(403, "Seed task data is protected in demo mode");
		}
		if (role !== "Admin" && task.assignedBy !== Number(userId)) {
			throw new HttpError(403, "You cannot delete this task");
		}
		tasks.splice(index, 1);
		return true;
	},

	async updateTaskProgress({ taskId, progress, status, note, actorId, actorRole }) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM tasks WHERE id = ? LIMIT 1", [taskId]);
			if (!rows[0]) return null;
			const task = rows[0];
			if (actorRole === "Employee" && Number(task.assigned_to) !== Number(actorId)) {
				throw new HttpError(403, "You cannot update this task");
			}
			const nextProgress = Math.max(0, Math.min(100, Number(progress ?? task.progress)));
			await pool.query("UPDATE tasks SET progress = ?, status = ?, description = COALESCE(?, description) WHERE id = ?", [nextProgress, status || task.status, note || null, taskId]);
			const [updatedRows] = await pool.query(
				`SELECT t.*, ua.full_name AS assigned_by_name, ub.full_name AS assigned_to_name
				 FROM tasks t
				 INNER JOIN users ua ON ua.id = t.assigned_by
				 INNER JOIN users ub ON ub.id = t.assigned_to
				 WHERE t.id = ? LIMIT 1`,
				[taskId]
			);
			return mapTaskRow(updatedRows[0]);
		}

		const task = tasks.find((item) => item.id === Number(taskId));
		if (!task) return null;
		if (actorRole === "Employee" && task.assignedTo !== Number(actorId)) {
			throw new HttpError(403, "You cannot update this task");
		}
		task.progress = Math.max(0, Math.min(100, Number(progress ?? task.progress)));
		task.status = status || task.status;
		task.updatedNote = note || task.updatedNote || "";
		const assignedTo = users.find((user) => user.id === task.assignedTo);
		const assignedBy = users.find((user) => user.id === task.assignedBy);
		return { ...task, assignedToName: assignedTo?.fullName || "Unknown", assignedByName: assignedBy?.fullName || "Unknown" };
	},

	async listNotifications(userId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [userId]);
			return rows.map(mapNotificationRow);
		}
		return notifications.filter((item) => Number(item.userId) === Number(userId));
	},

	async markNotificationAsRead(notificationId, userId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			await pool.query("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?", [notificationId, userId]);
			const [rows] = await pool.query("SELECT * FROM notifications WHERE id = ? AND user_id = ? LIMIT 1", [notificationId, userId]);
			return rows[0] ? mapNotificationRow(rows[0]) : null;
		}
		const notification = notifications.find((item) => Number(item.id) === Number(notificationId) && Number(item.userId) === Number(userId));
		if (!notification) return null;
		notification.isRead = true;
		return notification;
	},

	async markAllNotificationsAsRead(userId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			await pool.query("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [userId]);
			const [rows] = await pool.query("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC", [userId]);
			return rows.map(mapNotificationRow);
		}
		return notifications
			.filter((item) => Number(item.userId) === Number(userId))
			.map((item) => ({ ...item, isRead: true }));
	},

	async listReports({ userId, role, status, search }) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];
			if (role !== "Admin") {
				filters.push("r.user_id = ?");
				params.push(userId);
			}
			if (status) {
				filters.push("r.status = ?");
				params.push(status);
			}
			if (search) {
				filters.push("(r.title LIKE ? OR r.summary LIKE ? OR r.category LIKE ?)");
				params.push(`%${search}%`, `%${search}%`, `%${search}%`);
			}
			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const [rows] = await pool.query(
				`SELECT r.*
				 FROM reports r
				 ${whereClause}
				 ORDER BY r.created_at DESC`,
				params
			);
			return rows.map(mapReportRow);
		}
		let items = reports.filter((item) => role === "Admin" || Number(item.userId) === Number(userId));
		if (status) items = items.filter((item) => item.status === status);
		if (search) {
			const keyword = search.toLowerCase();
			items = items.filter((item) => item.title.toLowerCase().includes(keyword) || item.summary.toLowerCase().includes(keyword) || item.category.toLowerCase().includes(keyword));
		}
		return items;
	},

	async createReport(userId, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [result] = await pool.query(
				"INSERT INTO reports (user_id, title, category, period_label, status, summary) VALUES (?, ?, ?, ?, ?, ?)",
				[userId, payload.title, payload.category, payload.periodLabel, payload.status || "Draft", payload.summary || ""]
			);
			const [rows] = await pool.query("SELECT * FROM reports WHERE id = ? LIMIT 1", [result.insertId]);
			return mapReportRow(rows[0]);
		}
		const item = {
			id: Date.now(),
			userId: Number(userId),
			title: payload.title,
			category: payload.category,
			periodLabel: payload.periodLabel,
			status: payload.status || "Draft",
			summary: payload.summary || "",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		reports.unshift(item);
		return item;
	},

	async updateReport(reportId, userId, role, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [currentRows] = await pool.query("SELECT * FROM reports WHERE id = ? LIMIT 1", [reportId]);
			if (!currentRows[0]) return null;
			if (role !== "Admin" && Number(currentRows[0].user_id) !== Number(userId)) {
				throw new HttpError(403, "You cannot update this report");
			}
			await pool.query(
				"UPDATE reports SET title = ?, category = ?, period_label = ?, status = ?, summary = ? WHERE id = ?",
				[payload.title, payload.category, payload.periodLabel, payload.status, payload.summary || "", reportId]
			);
			const [rows] = await pool.query("SELECT * FROM reports WHERE id = ? LIMIT 1", [reportId]);
			return mapReportRow(rows[0]);
		}
		const report = reports.find((item) => Number(item.id) === Number(reportId));
		if (!report) return null;
		if (role !== "Admin" && Number(report.userId) !== Number(userId)) {
			throw new HttpError(403, "You cannot update this report");
		}
		Object.assign(report, {
			title: payload.title,
			category: payload.category,
			periodLabel: payload.periodLabel,
			status: payload.status,
			summary: payload.summary || report.summary,
			updatedAt: new Date().toISOString()
		});
		return report;
	},

	async deleteReport(reportId, userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [currentRows] = await pool.query("SELECT * FROM reports WHERE id = ? LIMIT 1", [reportId]);
			if (!currentRows[0]) return false;
			if (role !== "Admin" && Number(currentRows[0].user_id) !== Number(userId)) {
				throw new HttpError(403, "You cannot delete this report");
			}
			await pool.query("DELETE FROM reports WHERE id = ?", [reportId]);
			return true;
		}
		const index = reports.findIndex((item) => Number(item.id) === Number(reportId));
		if (index < 0) return false;
		if (reports[index].protected) {
			throw new HttpError(403, "Seed report data is protected in demo mode");
		}
		if (role !== "Admin" && Number(reports[index].userId) !== Number(userId)) {
			throw new HttpError(403, "You cannot delete this report");
		}
		reports.splice(index, 1);
		return true;
	},

	async listKpiOverview({ role, userId, periodId }) {
		const currentPeriod = periodId ? findKpiPeriod(periodId) : kpiPeriods.find((item) => item.status !== "locked") || kpiPeriods[kpiPeriods.length - 1];
		const ranking = await this.listKpiRankings({ periodId: currentPeriod?.id });
		const records = await this.listKpiRecords({ role, userId, periodId: currentPeriod?.id });
		return {
			period: currentPeriod,
			records,
			ranking,
			lockedPeriods: kpiPeriods.filter((item) => item.status === "locked").length,
			openPeriods: kpiPeriods.filter((item) => item.status !== "locked").length
		};
	},

	async createKpiTarget(userId, payload) {
		const target = {
			id: Date.now(),
			periodId: Number(payload.periodId),
			userId: Number(payload.userId),
			targetScore: Number(payload.targetScore || 80),
			productivityWeight: Number(payload.productivityWeight || 33),
			qualityWeight: Number(payload.qualityWeight || 33),
			timelinessWeight: Number(payload.timelinessWeight || 34),
			targetTasks: Number(payload.targetTasks || 0),
			targetCompletionRate: Number(payload.targetCompletionRate || 0),
			status: payload.status || "pending",
			protected: false
		};
		kpiTargets.unshift(target);
		pushHistory(target, "target_assigned", userId, "KPI target created");
		return target;
	},

	async submitKpiResult(userId, payload) {
		const target = findKpiTarget(payload.targetId);
		const record = {
			id: Date.now(),
			periodId: Number(payload.periodId),
			userId: Number(userId),
			targetId: target?.id || null,
			status: "submitted",
			productivityScore: Number(payload.productivityScore || target?.productivityWeight || 0),
			qualityScore: Number(payload.qualityScore || target?.qualityWeight || 0),
			timelinessScore: Number(payload.timelinessScore || target?.timelinessWeight || 0),
			finalScore: weightedScore(payload, target),
			remarks: payload.remarks || "",
			submittedAt: new Date().toISOString(),
			approvedAt: null,
			approvedBy: null,
			history: [] ,
			protected: false
		};
		pushHistory(record, "submitted", userId, "KPI result submitted");
		kpiRecords.unshift(record);
		return record;
	},

	async findKpiRecordByUserAndPeriod(userId, periodId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query(
				`SELECT * FROM kpi_records
				 WHERE user_id = ? AND period_id = ?
				 ORDER BY created_at DESC
				 LIMIT 1`,
				[userId, periodId]
			);
			if (!rows[0]) return null;
			return {
				id: rows[0].id,
				periodId: rows[0].period_id,
				userId: rows[0].user_id,
				targetId: rows[0].target_id,
				status: rows[0].status,
				finalScore: Number(rows[0].final_score),
				productivityScore: Number(rows[0].productivity_score),
				qualityScore: Number(rows[0].quality_score),
				timelinessScore: Number(rows[0].timeliness_score),
				remarks: rows[0].remarks || "",
				submittedAt: rows[0].submitted_at,
				approvedAt: rows[0].approved_at,
				approvedBy: rows[0].approved_by,
				history: []
			};
		}
		const records = kpiRecords
			.filter((item) => Number(item.userId) === Number(userId) && Number(item.periodId) === Number(periodId))
			.sort((left, right) => new Date(right.submittedAt || right.createdAt || 0) - new Date(left.submittedAt || left.createdAt || 0));
		return records[0] ? clone(records[0]) : null;
	},

	async reviewKpiResult(recordId, userId, decision, note) {
		const record = findKpiRecord(recordId);
		if (!record) return null;
		record.status = decision;
		record.approvedBy = Number(userId);
		record.approvedAt = new Date().toISOString();
		pushHistory(record, decision, userId, note || `Record ${decision}`);
		return record;
	},

	async lockKpiPeriod(periodId, userId) {
		const period = findKpiPeriod(periodId);
		if (!period) return null;
		period.status = "locked";
		period.lockedBy = Number(userId);
		period.lockedAt = new Date().toISOString();
		return period;
	},

	async resetDemoData() {
		resetSeedState();
		return { ok: true };
	},

	async addNotification(notification) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			await pool.query("INSERT INTO notifications (user_id, type, title, message, is_read) VALUES (?, ?, ?, ?, 0)", [notification.userId, notification.type, notification.title, notification.message]);
			return;
		}
		notifications.unshift({ id: Date.now(), createdAt: new Date().toISOString(), isRead: false, ...notification });
	},

	async getKpi(userId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM kpi_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1", [userId]);
			if (rows[0]) return mapKpiRow(rows[0]);
		}
		return latestRecordForUser(userId) || kpiRecords[0] || null;
	},
	async getLeaveRequests(userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];
			if (role === "Employee") {
				filters.push("user_id = ?");
				params.push(userId);
			}
			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const [rows] = await pool.query(`SELECT * FROM leave_requests ${whereClause} ORDER BY created_at DESC`, params);
			return rows.map((row) => ({
				id: row.id,
				userId: row.user_id,
				leaveType: row.leave_type,
				startDate: row.start_date,
				endDate: row.end_date,
				reason: row.reason,
				status: row.status
			}));
		}
		return leaveRequests.filter((item) => role === "Employee" ? Number(item.userId) === Number(userId) : true);
	},

	async createLeaveRequest(userId, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [result] = await pool.query(
				"INSERT INTO leave_requests (user_id, leave_type, start_date, end_date, reason, status) VALUES (?, ?, ?, ?, ?, ?)",
				[userId, payload.leaveType, payload.startDate, payload.endDate, payload.reason, payload.status || "Requested"]
			);
			const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ? LIMIT 1", [result.insertId]);
			const row = rows[0];
			return { id: row.id, userId: row.user_id, leaveType: row.leave_type, startDate: row.start_date, endDate: row.end_date, reason: row.reason, status: row.status };
		}
		const item = { id: Date.now(), userId: Number(userId), leaveType: payload.leaveType, startDate: payload.startDate, endDate: payload.endDate, reason: payload.reason, status: payload.status || "Requested" };
		leaveRequests.unshift(item);
		return item;
	},

	async getLeaveRequestById(leaveId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ? LIMIT 1", [leaveId]);
			if (!rows[0]) return null;
			const row = rows[0];
			return { id: row.id, userId: row.user_id, leaveType: row.leave_type, startDate: row.start_date, endDate: row.end_date, reason: row.reason, status: row.status };
		}
		return leaveRequests.find((item) => Number(item.id) === Number(leaveId)) || null;
	},

	async updateLeaveRequest(leaveId, userId, role, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ? LIMIT 1", [leaveId]);
			if (!rows[0]) return null;
			if (role !== "Admin" && Number(rows[0].user_id) !== Number(userId)) {
				throw new HttpError(403, "You cannot update this leave request");
			}
			await pool.query("UPDATE leave_requests SET leave_type = COALESCE(?, leave_type), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date), reason = COALESCE(?, reason), status = COALESCE(?, status) WHERE id = ?", [payload.leaveType, payload.startDate, payload.endDate, payload.reason, payload.status, leaveId]);
			const [updated] = await pool.query("SELECT * FROM leave_requests WHERE id = ? LIMIT 1", [leaveId]);
			const row = updated[0];
			return { id: row.id, userId: row.user_id, leaveType: row.leave_type, startDate: row.start_date, endDate: row.end_date, reason: row.reason, status: row.status };
		}
		const item = leaveRequests.find((it) => Number(it.id) === Number(leaveId));
		if (!item) return null;
		if (item.protected) {
			throw new HttpError(403, "Seed leave data is protected in demo mode");
		}
		if (role !== "Admin" && Number(item.userId) !== Number(userId)) throw new HttpError(403, "You cannot update this leave request");
		Object.assign(item, {
			leaveType: payload.leaveType ?? item.leaveType,
			startDate: payload.startDate ?? item.startDate,
			endDate: payload.endDate ?? item.endDate,
			reason: payload.reason ?? item.reason,
			status: payload.status ?? item.status
		});
		return item;
	},

	async deleteLeaveRequest(leaveId, userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM leave_requests WHERE id = ? LIMIT 1", [leaveId]);
			if (!rows[0]) return false;
			if (role !== "Admin" && Number(rows[0].user_id) !== Number(userId)) throw new HttpError(403, "You cannot delete this leave request");
			await pool.query("DELETE FROM leave_requests WHERE id = ?", [leaveId]);
			return true;
		}
		const idx = leaveRequests.findIndex((it) => Number(it.id) === Number(leaveId));
		if (idx < 0) return false;
		if (leaveRequests[idx].protected) {
			throw new HttpError(403, "Seed leave data is protected in demo mode");
		}
		if (role !== "Admin" && Number(leaveRequests[idx].userId) !== Number(userId)) throw new HttpError(403, "You cannot delete this leave request");
		leaveRequests.splice(idx, 1);
		return true;
	},

	async getAttendance(userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];
			if (role === "Employee") {
				filters.push("user_id = ?");
				params.push(userId);
			}
			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const [rows] = await pool.query(`SELECT * FROM attendance_checkins ${whereClause} ORDER BY check_in_at DESC`, params);
			return rows.map((row) => ({ id: row.id, userId: row.user_id, checkInAt: row.check_in_at, status: row.status, note: row.note || "" }));
		}
		return attendanceCheckins.filter((item) => role === "Employee" ? Number(item.userId) === Number(userId) : true);
	},

	async getShiftAssignments() {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM shift_assignments ORDER BY created_at DESC");
			return rows.map((row) => ({ id: row.id, title: row.title, assigneeName: row.assignee_name, assigneeRole: row.assignee_role, status: row.status, shiftDate: row.shift_date }));
		}
		return shiftAssignments;
	},

	async getExpenseClaims(userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];
			if (role === "Employee") {
				filters.push("user_id = ?");
				params.push(userId);
			}
			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const [rows] = await pool.query(`SELECT * FROM expense_claims ${whereClause} ORDER BY created_at DESC`, params);
			return rows.map((row) => ({ id: row.id, userId: row.user_id, title: row.title, amount: Number(row.amount), status: row.status }));
		}
		return expenseClaims.filter((item) => role === "Employee" ? Number(item.userId) === Number(userId) : true);
	},

	async createExpenseClaim(userId, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [result] = await pool.query("INSERT INTO expense_claims (user_id, title, amount, status) VALUES (?, ?, ?, ?)", [userId, payload.title, payload.amount, payload.status || "Submitted"]);
			const [rows] = await pool.query("SELECT * FROM expense_claims WHERE id = ? LIMIT 1", [result.insertId]);
			const row = rows[0];
			return { id: row.id, userId: row.user_id, title: row.title, amount: Number(row.amount), status: row.status };
		}
		const item = { id: Date.now(), userId: Number(userId), title: payload.title, amount: Number(payload.amount), status: payload.status || "Submitted" };
		expenseClaims.unshift(item);
		return item;
	},

	async getExpenseClaimById(id) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM expense_claims WHERE id = ? LIMIT 1", [id]);
			if (!rows[0]) return null;
			const row = rows[0];
			return { id: row.id, userId: row.user_id, title: row.title, amount: Number(row.amount), status: row.status };
		}
		return expenseClaims.find((item) => Number(item.id) === Number(id)) || null;
	},

	async updateExpenseClaim(id, userId, role, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM expense_claims WHERE id = ? LIMIT 1", [id]);
			if (!rows[0]) return null;
			if (role !== "Admin" && Number(rows[0].user_id) !== Number(userId)) throw new HttpError(403, "You cannot update this expense claim");
			await pool.query("UPDATE expense_claims SET title = COALESCE(?, title), amount = COALESCE(?, amount), status = COALESCE(?, status) WHERE id = ?", [payload.title, payload.amount, payload.status, id]);
			const [updated] = await pool.query("SELECT * FROM expense_claims WHERE id = ? LIMIT 1", [id]);
			const row = updated[0];
			return { id: row.id, userId: row.user_id, title: row.title, amount: Number(row.amount), status: row.status };
		}
		const item = expenseClaims.find((it) => Number(it.id) === Number(id));
		if (!item) return null;
		if (item.protected) throw new HttpError(403, "Seed expense data is protected in demo mode");
		if (role !== "Admin" && Number(item.userId) !== Number(userId)) throw new HttpError(403, "You cannot update this expense claim");
		Object.assign(item, { title: payload.title ?? item.title, amount: payload.amount ?? item.amount, status: payload.status ?? item.status });
		return item;
	},

	async deleteExpenseClaim(id, userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM expense_claims WHERE id = ? LIMIT 1", [id]);
			if (!rows[0]) return false;
			if (role !== "Admin" && Number(rows[0].user_id) !== Number(userId)) throw new HttpError(403, "You cannot delete this expense claim");
			await pool.query("DELETE FROM expense_claims WHERE id = ?", [id]);
			return true;
		}
		const idx = expenseClaims.findIndex((it) => Number(it.id) === Number(id));
		if (idx < 0) return false;
		if (expenseClaims[idx].protected) throw new HttpError(403, "Seed expense data is protected in demo mode");
		if (role !== "Admin" && Number(expenseClaims[idx].userId) !== Number(userId)) throw new HttpError(403, "You cannot delete this expense claim");
		expenseClaims.splice(idx, 1);
		return true;
	},

	async getEmployeeAdvances(userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];
			if (role === "Employee") {
				filters.push("user_id = ?");
				params.push(userId);
			}
			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const [rows] = await pool.query(`SELECT * FROM employee_advances ${whereClause} ORDER BY created_at DESC`, params);
			return rows.map((row) => ({ id: row.id, userId: row.user_id, purpose: row.purpose, amount: Number(row.amount), status: row.status }));
		}
		return employeeAdvances.filter((item) => role === "Employee" ? Number(item.userId) === Number(userId) : true);
	},

	async createEmployeeAdvance(userId, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [result] = await pool.query("INSERT INTO employee_advances (user_id, purpose, amount, status) VALUES (?, ?, ?, ?)", [userId, payload.purpose, payload.amount, payload.status || "Pending"]);
			const [rows] = await pool.query("SELECT * FROM employee_advances WHERE id = ? LIMIT 1", [result.insertId]);
			const row = rows[0];
			return { id: row.id, userId: row.user_id, purpose: row.purpose, amount: Number(row.amount), status: row.status };
		}
		const item = { id: Date.now(), userId: Number(userId), purpose: payload.purpose, amount: Number(payload.amount), status: payload.status || "Pending" };
		employeeAdvances.unshift(item);
		return item;
	},

	async getEmployeeAdvanceById(id) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM employee_advances WHERE id = ? LIMIT 1", [id]);
			if (!rows[0]) return null;
			const row = rows[0];
			return { id: row.id, userId: row.user_id, purpose: row.purpose, amount: Number(row.amount), status: row.status };
		}
		return employeeAdvances.find((item) => Number(item.id) === Number(id)) || null;
	},

	async updateEmployeeAdvance(id, userId, role, payload) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM employee_advances WHERE id = ? LIMIT 1", [id]);
			if (!rows[0]) return null;
			if (role !== "Admin" && Number(rows[0].user_id) !== Number(userId)) throw new HttpError(403, "You cannot update this advance request");
			await pool.query("UPDATE employee_advances SET purpose = COALESCE(?, purpose), amount = COALESCE(?, amount), status = COALESCE(?, status) WHERE id = ?", [payload.purpose, payload.amount, payload.status, id]);
			const [updated] = await pool.query("SELECT * FROM employee_advances WHERE id = ? LIMIT 1", [id]);
			const row = updated[0];
			return { id: row.id, userId: row.user_id, purpose: row.purpose, amount: Number(row.amount), status: row.status };
		}
		const item = employeeAdvances.find((it) => Number(it.id) === Number(id));
		if (!item) return null;
		if (item.protected) throw new HttpError(403, "Seed advance data is protected in demo mode");
		if (role !== "Admin" && Number(item.userId) !== Number(userId)) throw new HttpError(403, "You cannot update this advance request");
		Object.assign(item, { purpose: payload.purpose ?? item.purpose, amount: payload.amount ?? item.amount, status: payload.status ?? item.status });
		return item;
	},

	async deleteEmployeeAdvance(id, userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM employee_advances WHERE id = ? LIMIT 1", [id]);
			if (!rows[0]) return false;
			if (role !== "Admin" && Number(rows[0].user_id) !== Number(userId)) throw new HttpError(403, "You cannot delete this advance request");
			await pool.query("DELETE FROM employee_advances WHERE id = ?", [id]);
			return true;
		}
		const idx = employeeAdvances.findIndex((it) => Number(it.id) === Number(id));
		if (idx < 0) return false;
		if (employeeAdvances[idx].protected) throw new HttpError(403, "Seed advance data is protected in demo mode");
		if (role !== "Admin" && Number(employeeAdvances[idx].userId) !== Number(userId)) throw new HttpError(403, "You cannot delete this advance request");
		employeeAdvances.splice(idx, 1);
		return true;
	},

	async getSalarySlips(userId, role) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const filters = [];
			const params = [];
			if (role === "Employee") {
				filters.push("user_id = ?");
				params.push(userId);
			}
			const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
			const [rows] = await pool.query(`SELECT * FROM salary_slips ${whereClause} ORDER BY created_at DESC`, params);
			return rows.map((row) => ({ id: row.id, userId: row.user_id, periodLabel: row.period_label, grossAmount: Number(row.gross_amount), netAmount: Number(row.net_amount), status: row.status }));
		}
		return salarySlips.filter((item) => role === "Employee" ? Number(item.userId) === Number(userId) : true);
	},

	async getProfile(userId) {
		const user = await this.getUserById(userId);
		if (!user) throw new HttpError(404, "User not found");
		return { id: user.id, role: user.role, fullName: user.fullName, email: user.email };
	},

	async getSettings(userId) {
		if (hasDatabase()) {
			const pool = getDatabasePool();
			const [rows] = await pool.query("SELECT * FROM user_settings WHERE user_id = ? LIMIT 1", [userId]);
			if (rows[0]) {
				return { userId: rows[0].user_id, theme: rows[0].theme, notificationsEnabled: Boolean(rows[0].notifications_enabled), defaultDashboard: rows[0].default_dashboard };
			}
		}
		return userSettings.find((item) => Number(item.userId) === Number(userId)) || { userId: Number(userId), theme: "light", notificationsEnabled: true, defaultDashboard: "role-based" };
	},

	async updateSettings(userId, payload) {
		const nextSettings = {
			userId: Number(userId),
			theme: payload.theme || "light",
			notificationsEnabled: payload.notificationsEnabled ?? true,
			defaultDashboard: payload.defaultDashboard || "role-based"
		};
		if (hasDatabase()) {
			const pool = getDatabasePool();
			await pool.query(
				"INSERT INTO user_settings (user_id, theme, notifications_enabled, default_dashboard) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE theme = VALUES(theme), notifications_enabled = VALUES(notifications_enabled), default_dashboard = VALUES(default_dashboard)",
				[userId, nextSettings.theme, nextSettings.notificationsEnabled ? 1 : 0, nextSettings.defaultDashboard]
			);
			return nextSettings;
		}
		const existingIndex = userSettings.findIndex((item) => Number(item.userId) === Number(userId));
		if (existingIndex >= 0) {
			userSettings[existingIndex] = nextSettings;
		} else {
			userSettings.push(nextSettings);
		}
		return nextSettings;
	}
};