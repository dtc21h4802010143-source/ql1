import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useTranslation } from "../lib/i18n";

export const SalarySlip = () => {
	const [slips, setSlips] = useState([]);

	useEffect(() => {
		api.get("/salary-slips").then(({ data }) => setSlips(data));
	}, []);

	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.salary.title") || "Salary slip"}</CardTitle>
				<CardDescription>{t("pages.salary.description") || "Readable salary statement for demo and explanation."}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				{slips.map((slip) => (
					<div key={slip.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
						<div>
							<p className="font-semibold">{slip.periodLabel}</p>
							<p className="text-sm text-muted-foreground">Gross {Number(slip.grossAmount).toLocaleString("vi-VN")} VND - Net {Number(slip.netAmount).toLocaleString("vi-VN")} VND</p>
						</div>
						<Badge variant="secondary">{slip.status}</Badge>
					</div>
				))}
				<Button variant="secondary">{t("pages.salary.view_detail") || "View salary detail"}</Button>
			</CardContent>
		</Card>
	);
};