import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useTranslation } from "../lib/i18n";

export const Leave = () => {
	const [requests, setRequests] = useState([]);
	const [form, setForm] = useState({ leaveType: "Annual Leave", startDate: "", endDate: "", reason: "" });

	const load = async () => {
		const { data } = await api.get("/leave-requests");
		setRequests(data);
	};

	useEffect(() => {
		load();
	}, []);

	const submit = async (event) => {
		event.preventDefault();
		await api.post("/leave-requests", form);
		setForm({ leaveType: "Annual Leave", startDate: "", endDate: "", reason: "" });
		load();
	};

	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("pages.leave.title") || "Leave management"}</CardTitle>
					<CardDescription>{t("pages.leave.description") || "Request and approval flow aligned with the legacy workflow."}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{requests.map((item) => (
						<div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 p-4">
							<div>
								<p className="font-semibold">{item.leaveType}</p>
								<p className="text-sm text-muted-foreground">{item.startDate} - {item.endDate} - {item.reason}</p>
							</div>
							<Badge variant="secondary">{item.status}</Badge>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("pages.leave.new_title") || "New leave request"}</CardTitle>
					<CardDescription>{t("pages.leave.new_desc") || "Submit a new request without leaving the page."}</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="grid gap-3 md:grid-cols-2" onSubmit={submit}>
						<Input value={form.leaveType} onChange={(event) => setForm({ ...form, leaveType: event.target.value })} placeholder={t("pages.leave.leave_type") || "Leave type"} />
						<Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
						<Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
						<Input value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder={t("pages.leave.reason") || "Reason"} />
						<div className="md:col-span-2">
							<Button>{t("pages.leave.create_button") || "Create request"}</Button>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};