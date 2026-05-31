import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";

export const Tasks = () => {
	const [data, setData] = useState([]);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [sortBy, setSortBy] = useState("dueDate");

	useEffect(() => {
		const params = new URLSearchParams();
		params.set("limit", "20");
		if (search) params.set("search", search);
		if (status) params.set("status", status);
		if (projectId) params.set("projectId", projectId);
		api.get(`/tasks?${params.toString()}`).then(({ data }) => setData(data.items || []));
	}, [search, status]);

	const [projects, setProjects] = useState([]);
	const [projectId, setProjectId] = useState("");

	useEffect(() => {
		api.get("/projects").then(({ data }) => setProjects(data || []));
	}, []);

	const sortedTasks = useMemo(() => {
		const items = [...data];
		return items.sort((left, right) => {
			if (sortBy === "priority") {
				const order = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
				return (order[left.priority] ?? 99) - (order[right.priority] ?? 99);
			}
			return new Date(left.dueDate || 0) - new Date(right.dueDate || 0);
		});
	}, [data, sortBy]);

	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.tasks.title")}</CardTitle>
				<CardDescription>{t("pages.tasks.description")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.6fr_0.6fr_auto]">
					<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("pages.tasks.search_placeholder")} />
					<Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
						<option value="">All projects</option>
						{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
					</Select>
					<Select value={status} onChange={(event) => setStatus(event.target.value)}>
						<option value="">{t("pages.tasks.filter_all")}</option>
						<option value="Open">Open</option>
						<option value="In Progress">In Progress</option>
						<option value="Review">Review</option>
						<option value="Done">Done</option>
						<option value="Overdue">Overdue</option>
					</Select>
					<Select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
						<option value="dueDate">{t("pages.tasks.sort_dueDate")}</option>
						<option value="priority">{t("pages.tasks.sort_priority")}</option>
					</Select>
					<Button variant="secondary">{t("pages.tasks.button_add")}</Button>
				</div>

				<div className="overflow-hidden rounded-3xl border border-border/60">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted/70 text-muted-foreground">
							<tr>
								<th className="px-4 py-3 font-medium">{t("pages.tasks.table.task")}</th>
								<th className="px-4 py-3 font-medium">{t("pages.tasks.table.assignee")}</th>
								<th className="px-4 py-3 font-medium">{t("pages.tasks.table.priority")}</th>
								<th className="px-4 py-3 font-medium">{t("pages.tasks.table.progress")}</th>
								<th className="px-4 py-3 font-medium">{t("pages.tasks.table.due_date")}</th>
							</tr>
						</thead>
						<tbody>
							{sortedTasks.map((task) => (
								<tr key={task.id} className="border-t border-border/60 hover:bg-muted/40">
									<td className="px-4 py-4">
										<p className="font-semibold">{task.title}</p>
										<p className="mt-1 max-w-xl text-xs text-muted-foreground">{task.description}</p>
									</td>
									<td className="px-4 py-4 text-muted-foreground">{task.assignedToName}</td>
									<td className="px-4 py-4"><Badge>{task.priority}</Badge></td>
									<td className="px-4 py-4">
										<div className="flex items-center gap-3">
											<div className="h-2 w-28 rounded-full bg-muted">
												<div className="h-2 rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
											</div>
											<span className="text-xs text-muted-foreground">{task.progress}%</span>
										</div>
									</td>
									<td className="px-4 py-4 text-muted-foreground">{task.dueDate}</td>
								</tr>
							))}
							{!sortedTasks.length ? (
								<tr>
									<td className="px-4 py-8 text-center text-muted-foreground" colSpan={5}>{t("pages.tasks.no_items")}</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>
			</CardContent>
		</Card>
	);
};