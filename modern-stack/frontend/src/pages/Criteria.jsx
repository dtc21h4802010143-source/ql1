import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { toast } from "sonner";

export const Criteria = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ code: "", name: "", description: "", weight: 0, type: "productivity" });
	const [editingId, setEditingId] = useState(null);
	const [saving, setSaving] = useState(false);

	const load = async () => { const res = await api.get("/criteria"); setItems(res.data || []); };
	useEffect(() => { load(); }, []);

	const reset = () => { setForm({ code: "", name: "", description: "", weight: 0, type: "productivity" }); setEditingId(null); };

	const submit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			if (editingId) { await api.patch(`/criteria/${editingId}`, form); toast.success("Criteria updated"); }
			else { await api.post(`/criteria`, form); toast.success("Criteria created"); }
			reset(); await load();
		} catch (err) { toast.error(err?.response?.data?.message || "Unable to save criteria"); }
		finally { setSaving(false); }
	};

	const edit = (c) => setEditingId(c.id) || setForm({ code: c.code, name: c.name, description: c.description || "", weight: c.weight || 0, type: c.type || "other" });
	const remove = async (id) => { try { await api.delete(`/criteria/${id}`); toast.success("Deleted"); await load(); } catch (e) { toast.error(e?.response?.data?.message || "Unable to delete"); } };

	return (
		<Card>
			<CardHeader>
				<CardTitle>KPI Criteria</CardTitle>
				<CardDescription>Manage KPI scoring criteria and weights.</CardDescription>
			</CardHeader>
			<CardContent>
				<form className="grid gap-3 md:grid-cols-4 mb-4" onSubmit={submit}>
					<Input value={form.code} onChange={(e) => setForm((c) => ({ ...c, code: e.target.value }))} placeholder="code" />
					<Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="name" />
					<Input value={form.weight} type="number" onChange={(e) => setForm((c) => ({ ...c, weight: Number(e.target.value) }))} placeholder="weight" />
					<Select value={form.type} onChange={(e) => setForm((c) => ({ ...c, type: e.target.value }))}>
						<option value="productivity">Productivity</option>
						<option value="quality">Quality</option>
						<option value="timeliness">Timeliness</option>
						<option value="other">Other</option>
					</Select>
					<div className="md:col-span-4">
						<Input value={form.description} onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))} placeholder="description" />
					</div>
					<div className="md:col-span-4 flex gap-2">
						<Button type="submit" disabled={saving}>{saving ? "..." : editingId ? "Update" : "Create"}</Button>
						{editingId ? <Button variant="secondary" onClick={reset}>Cancel</Button> : null}
					</div>
				</form>

				<div className="space-y-2">
					{items.map((c) => (
						<div key={c.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-3">
							<div>
								<p className="font-medium">{c.name} ({c.code})</p>
								<p className="text-sm text-muted-foreground">Weight: {c.weight} — {c.type}</p>
								<p className="text-sm text-muted-foreground">{c.description}</p>
							</div>
							<div className="flex gap-2">
								<Button size="sm" variant="secondary" onClick={() => edit(c)}>Edit</Button>
								<Button size="sm" variant="ghost" onClick={() => remove(c.id)}>Delete</Button>
							</div>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};
