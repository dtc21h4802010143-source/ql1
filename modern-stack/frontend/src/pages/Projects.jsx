import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { toast } from "sonner";

export const Projects = () => {
	const [projects, setProjects] = useState([]);
	const [form, setForm] = useState({ name: "", code: "", description: "", ownerId: "" });
	const [editingId, setEditingId] = useState(null);
	const [saving, setSaving] = useState(false);

	const load = async () => {
		const res = await api.get("/projects");
		setProjects(res.data || []);
	};

	useEffect(() => { load(); }, []);

	const reset = () => { setForm({ name: "", code: "", description: "", ownerId: "" }); setEditingId(null); };

	const submit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			if (editingId) {
				await api.patch(`/projects/${editingId}`, form);
				toast.success("Project updated");
			} else {
				await api.post(`/projects`, form);
				toast.success("Project created");
			}
			reset();
			await load();
		} catch (err) {
			toast.error(err?.response?.data?.message || "Unable to save project");
		} finally { setSaving(false); }
	};

	const edit = (p) => { setEditingId(p.id); setForm({ name: p.name, code: p.code, description: p.description || "", ownerId: p.ownerId || "" }); };
	const remove = async (id) => { try { await api.delete(`/projects/${id}`); toast.success("Project deleted"); await load(); } catch (e) { toast.error(e?.response?.data?.message || "Unable to delete project"); } };

	return (
		<Card>
			<CardHeader>
				<CardTitle>Projects</CardTitle>
				<CardDescription>Manage projects for KPI and tasks.</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-3 md:grid-cols-3 mb-4" onSubmit={submit}>
					<Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Project name" />
					<Input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} placeholder="Code" />
					<Input value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="Description" />
					<div className="md:col-span-3 flex gap-2">
						<Button type="submit" disabled={saving}>{saving ? "..." : editingId ? "Update" : "Create"}</Button>
						{editingId ? <Button variant="secondary" onClick={reset}>Cancel</Button> : null}
					</div>
				</form>

				<div className="space-y-2">
					{projects.map((p) => (
						<div key={p.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
							<div>
								<p className="font-medium">{p.name}</p>
								<p className="text-sm text-muted-foreground">{p.code} — {p.description}</p>
							</div>
							<div className="flex gap-2">
								<Button size="sm" variant="secondary" onClick={() => edit(p)}>Edit</Button>
								<Button size="sm" variant="ghost" onClick={() => remove(p.id)}>Delete</Button>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
