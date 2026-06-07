import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export const TaskDetail = () => {
	const [task, setTask] = useState(null);

	useEffect(() => {
		api.get("/tasks?limit=1").then(({ data }) => setTask(data.items?.[0] ?? null));
	}, []);

	if (!task) {
		return (
			<Card>
				<CardContent className="py-10 text-center text-muted-foreground">No task data available.</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle>{task.title}</CardTitle>
				<CardDescription>{task.description}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-3 md:grid-cols-4">
					{[
						{ label: "Priority", value: task.priority },
						{ label: "Status", value: task.status },
						{ label: "Due date", value: task.dueDate },
						{ label: "Progress", value: `${task.progress}%` }
					].map((item) => (
						<div key={item.label} className="rounded-2xl border border-border/60 p-4">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
							<p className="mt-2 font-semibold">{item.value}</p>
						</div>
					))}
				</div>
				<div className="flex flex-wrap gap-2">
					<Badge variant="secondary">{task.comments} comments</Badge>
					<Badge variant="secondary">{task.attachments} attachments</Badge>
				</div>
				<Button variant="secondary">Update progress</Button>
			</CardContent>
		</Card>
	);
};