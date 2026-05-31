import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useTranslation } from "../lib/i18n";

export const ExpenseClaim = () => {
	const [items, setItems] = useState([]);
	const [form, setForm] = useState({ title: "", amount: "" });

	const load = async () => {
		const { data } = await api.get("/expense-claims");
		setItems(data);
	};

	useEffect(() => {
		load();
	}, []);

	const submit = async (event) => {
		event.preventDefault();
		await api.post("/expense-claims", form);
		setForm({ title: "", amount: "" });
		load();
	};

	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("pages.expense.title") || "Expense claims"}</CardTitle>
					<CardDescription>{t("pages.expense.description") || "Travel, meal and project expense flows ready for demo."}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{items.map((item) => (
						<div key={item.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
							<div>
								<p className="font-semibold">{item.title}</p>
								<p className="text-sm text-muted-foreground">{Number(item.amount).toLocaleString("vi-VN")} VND</p>
							</div>
							<Badge variant="secondary">{item.status}</Badge>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{t("pages.expense.new_title") || "New expense claim"}</CardTitle>
				</CardHeader>
				<CardContent>
					<form className="flex gap-3" onSubmit={submit}>
						<Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={t("pages.expense.title_placeholder") || "Title"} />
						<Input value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} placeholder={t("pages.expense.amount_placeholder") || "Amount"} />
						<Button>{t("pages.expense.submit") || "Submit"}</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};