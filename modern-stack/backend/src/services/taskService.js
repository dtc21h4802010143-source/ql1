import { HttpError } from "../utils/httpError.js";
import { appRepository } from "../repositories/appRepository.js";

const normalizeTask = (task) => ({
	...task,
	assignedByName: task.assignedByName || "Unknown",
	assignedToName: task.assignedToName || "Unknown"
});

export const taskService = {
	async list({ role, userId, status, search, page = 1, limit = 10, projectId }) {
		return appRepository.listTasks({ role, userId, status, search, page, limit, projectId });
	},

	async updateProgress({ taskId, progress, status, note, actorId, actorRole }) {
		const task = await appRepository.updateTaskProgress({ taskId, progress, status, note, actorId, actorRole });
		if (!task) {
			throw new HttpError(404, "Task not found");
		}

		return normalizeTask(task);
	},

	async create(payload, actorId) {
		return normalizeTask(await appRepository.createTask(payload, actorId));
	},

	async addNotification(notification) {
		await appRepository.addNotification(notification);
	}
};