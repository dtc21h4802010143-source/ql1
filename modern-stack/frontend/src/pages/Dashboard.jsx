import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { KpiChart } from "../components/charts/kpi-chart";
import { useTranslation } from "../lib/i18n";
import { useAuthStore } from "../store/authStore";

export const Dashboard = () => {
	const [data, setData] = useState(null);
	const user = useAuthStore((state) => state.user);

	useEffect(() => {
		api.get("/dashboard/summary").then(({ data }) => setData(data));
	}, []);

	const { t } = useTranslation();

	if (!data) {
		return <div className="grid gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-3xl bg-card animate-pulse" />)}</div>;
	}

	const kpi = data.kpi || {};
	const topRanking = data.ranking || [];
	const insights = data.insights || [];

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-cyan-500/10">
				<CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm text-muted-foreground">{data.period?.label || "Current KPI cycle"}</p>
						<h2 className="text-2xl font-semibold">{user?.fullName || "Employee"}</h2>
						<p className="mt-1 max-w-2xl text-sm text-muted-foreground">{insights[0] || "Demo ready dashboard with seed data and role-specific KPI flow."}</p>
					</div>
					<Badge variant="secondary" className="w-fit">{data.role || user?.role || "Role-based dashboard"}</Badge>
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-4">
				{data.stats.map((item) => (
					<Card key={item.label}>
						<CardHeader className="pb-2">
							<CardDescription>{item.label}</CardDescription>
							<CardTitle className="text-3xl">{item.value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
				<Card>
					<CardHeader>
						<CardTitle>{t("pages.dashboard.recent_activity")}</CardTitle>
						<CardDescription>{t("pages.dashboard.recent_activity_desc")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{data.activity.map((task) => (
							<div key={task.id} className="rounded-2xl border border-border/60 p-4">
								<div className="flex items-center justify-between gap-4">
									<div>
										<p className="font-medium">{task.title}</p>
										<p className="text-sm text-muted-foreground">{task.assignedToName}</p>
									</div>
									<Badge variant="secondary">{task.status}</Badge>
								</div>
								<div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
									<div className="h-full rounded-full bg-primary" style={{ width: `${task.progress}%` }} />
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card className="overflow-hidden">
					<CardHeader>
						<CardTitle>KPI snapshot</CardTitle>
						<CardDescription>{data.period?.label || kpi.cycleLabel || "Monthly cycle"}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="rounded-3xl bg-gradient-to-br from-primary/15 to-cyan-500/10 p-5 text-center">
							<p className="text-sm text-muted-foreground">Final score</p>
							<p className="text-5xl font-semibold">{kpi.finalScore}</p>
						</div>
						<KpiChart scores={[
							{ label: "Prod", value: kpi.productivityScore },
							{ label: "Qual", value: kpi.qualityScore },
							{ label: "Time", value: kpi.timelinessScore }
						]} />
						<p className="text-sm text-muted-foreground">{kpi.remarks}</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
				<Card>
					<CardHeader>
						<CardTitle>Top KPI ranking</CardTitle>
						<CardDescription>Current period leaderboard</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{topRanking.length ? topRanking.map((item) => (
							<div key={item.userId} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
								<div>
									<p className="font-medium">#{item.rank} {item.fullName}</p>
									<p className="text-sm text-muted-foreground">{item.departmentName}</p>
								</div>
								<Badge>{item.finalScore}</Badge>
							</div>
						)) : <p className="text-sm text-muted-foreground">No KPI ranking available.</p>}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Demo insights</CardTitle>
						<CardDescription>Presentation-friendly summary</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{insights.map((item) => <div key={item} className="rounded-2xl border border-border/60 p-4 text-sm text-muted-foreground">{item}</div>)}
						<div className="rounded-2xl border border-border/60 p-4">
							<p className="text-sm text-muted-foreground">Task completion</p>
							<p className="mt-2 text-3xl font-semibold">{data.completionRate}%</p>
							<div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
								<div className="h-full rounded-full bg-cyan-500" style={{ width: `${data.completionRate}%` }} />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};