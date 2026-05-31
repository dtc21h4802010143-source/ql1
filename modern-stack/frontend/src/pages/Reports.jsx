import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { toast } from "sonner";
import { useTranslation } from "../lib/i18n";

const emptyForm = {
	title: "",
	category: "Weekly",
	periodLabel: "",
	status: "Draft",
	summary: ""
};

export const Reports = () => {
	const [reports, setReports] = useState([]);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("");
	const [form, setForm] = useState(emptyForm);
	const [editingId, setEditingId] = useState(null);

	const loadReports = async () => {
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		if (status) params.set("status", status);
		const { data } = await api.get(`/reports?${params.toString()}`);
		setReports(data);
	};

	useEffect(() => {
		loadReports();
	}, [search, status]);

	const sortedReports = useMemo(() => [...reports].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)), [reports]);

	const submitReport = async (event) => {
		event.preventDefault();
		if (editingId) {
			await api.patch(`/reports/${editingId}`, form);
			toast.success("Report updated");
		} else {
			await api.post("/reports", form);
			toast.success("Report created");
		}
		setForm(emptyForm);
		setEditingId(null);
		await loadReports();
	};

	const startEdit = (report) => {
		setEditingId(report.id);
		setForm({
			title: report.title,
			category: report.category,
			periodLabel: report.periodLabel,
			status: report.status,
			summary: report.summary || ""
		});
	};

	const removeReport = async (reportId) => {
		await api.delete(`/reports/${reportId}`);
		toast.success("Report deleted");
		await loadReports();
	};

	const downloadExport = async (type, extension, label) => {
		const params = new URLSearchParams();
		if (search) params.set("search", search);
		if (status) params.set("status", status);
		const res = await api.get(`/reports/export?${params.toString()}&type=${type}`, { responseType: "blob" });
		const blob = new Blob([res.data], { type: extension === "pdf" ? "application/pdf" : extension === "xlsx" ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = res.headers["content-disposition"]?.split("filename=")[1] || `reports_${Date.now()}.${extension}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
		toast.success(label);
	};

	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.reports.title")}</CardTitle>
				<CardDescription>{t("pages.reports.description")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="grid gap-3 md:grid-cols-[1.2fr_0.7fr_auto]">
					<Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("pages.reports.search_placeholder")} />
					<Select value={status} onChange={(event) => setStatus(event.target.value)}>
						<option value="">{t("pages.reports.filter_all")}</option>
						<option value="Draft">Draft</option>
						<option value="Published">Published</option>
						<option value="Archived">Archived</option>
					</Select>
					<div className="flex gap-2 items-center">
						<Button variant="ghost" onClick={() => { setSearch(""); setStatus(""); }}>{t("pages.reports.clear_filters") || "Clear filters"}</Button>
						<Button variant="secondary" onClick={() => downloadExport("csv", "csv", t("pages.reports.export_csv"))}>{t("pages.reports.export_csv")}</Button>
						<Button variant="secondary" onClick={() => downloadExport("xlsx", "xlsx", t("pages.reports.export_excel"))}>{t("pages.reports.export_excel")}</Button>
						<Button variant="secondary" onClick={() => downloadExport("pdf", "pdf", t("pages.reports.export_pdf"))}>{t("pages.reports.export_pdf")}</Button>
					</div>
				</div>

				<form className="grid gap-3 rounded-3xl border border-border/60 p-4 md:grid-cols-2" onSubmit={submitReport}>
					<Input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder={t("pages.reports.report_title")} />
					<Input value={form.periodLabel} onChange={(event) => setForm((current) => ({ ...current, periodLabel: event.target.value }))} placeholder={t("pages.reports.period_label")} />
					<Select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
						<option value="Weekly">Weekly</option>
						<option value="Monthly">Monthly</option>
						<option value="Quarterly">Quarterly</option>
						<option value="Ad-hoc">Ad-hoc</option>
					</Select>
					<Select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
						<option value="Draft">Draft</option>
						<option value="Published">Published</option>
						<option value="Archived">Archived</option>
					</Select>
					<textarea
						className="min-h-32 rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none md:col-span-2"
						value={form.summary}
						onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))}
						placeholder={t("pages.reports.report_summary")}
					/>
					<div className="flex flex-wrap gap-2 md:col-span-2">
						<Button type="submit">{editingId ? t("pages.reports.update_report") : t("pages.reports.create_report")}</Button>
						{editingId ? <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setForm(emptyForm); }}>{t("pages.reports.cancel_edit")}</Button> : null}
					</div>
				</form>

				<div className="grid gap-4">
					{sortedReports.map((report) => (
						<div key={report.id} className="rounded-3xl border border-border/60 p-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{report.category} · {report.periodLabel}</p>
									<p className="mt-2 text-lg font-semibold">{report.title}</p>
									<p className="mt-2 text-sm text-muted-foreground">{report.summary}</p>
								</div>
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-muted px-3 py-1 text-xs">{report.status}</span>
									<Button variant="secondary" onClick={() => startEdit(report)}>Edit</Button>
									<Button variant="ghost" onClick={() => removeReport(report.id)}>Delete</Button>
								</div>
							</div>
						</div>
					))}
					{!sortedReports.length ? <p className="text-sm text-muted-foreground">No reports yet.</p> : null}
				</div>
			</CardContent>
		</Card>
	);
};
