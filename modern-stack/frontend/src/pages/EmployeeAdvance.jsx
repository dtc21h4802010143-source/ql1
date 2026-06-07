import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useTranslation } from "../lib/i18n";

export const EmployeeAdvance = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ purpose: "", amount: "" });

	const load = async () => {
		const { data } = await api.get("/employee-advances");
		setItems(data);
	};

	useEffect(() => {
		load();
	}, []);

	const submit = async (event) => {
		event.preventDefault();
		await api.post("/employee-advances", form);
		setForm({ purpose: "", amount: "" });
		load();
	};

	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("pages.advance.title") || "Employee advance"}</CardTitle>
					<CardDescription>{t("pages.advance.description") || "Advance request and reimbursement overview."}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{items.map((item) => (
						<div key={item.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
							<div>
								<p className="font-semibold">{item.purpose}</p>
								<p className="text-sm text-muted-foreground">{Number(item.amount).toLocaleString("vi-VN")} VND</p>
							</div>
							<Badge variant="secondary">{item.status}</Badge>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("pages.advance.request_title") || "Request advance"}</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="flex gap-3" onSubmit={submit}>
						<Input value={form.purpose} onChange={(event) => setForm({ ...form, purpose: event.target.value })} placeholder={t("pages.advance.purpose_placeholder") || "Purpose"} />
						<Input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder={t("pages.advance.amount_placeholder") || "Amount"} />
						<Button>{t("pages.advance.submit") || "Submit"}</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};