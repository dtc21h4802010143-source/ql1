import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { Button } from "../components/ui/button";

export const TaskForm = () => {
	const navigate = useNavigate();
	const [form, setForm] = useState({
		title: "",
		description: "",
		assignedTo: "3",
		priority: "Medium",
		dueDate: "",
		status: "Open"
	});
	const [loading, setLoading] = useState(false);

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		try {
			await api.post("/tasks", form);
			toast.success("Task created");
			navigate("/tasks");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Create task</CardTitle>
				<CardDescription>Manager and admin task assignment flow kept simple for demo use.</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
					<Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Task title" />
					<Select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}>
						<option>Low</option>
						<option>Medium</option>
						<option>High</option>
						<option>Urgent</option>
					</Select>
					<Input value={form.assignedTo} onChange={(event) => setForm((current) => ({ ...current, assignedTo: event.target.value }))} placeholder="Assigned to user ID" />
					<Input type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
					<textarea className="min-h-32 rounded-xl border border-input bg-background p-3 text-sm md:col-span-2" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" />
					<div className="md:col-span-2">
						<Button disabled={loading} type="submit">{loading ? "Creating..." : "Create task"}</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	);
};