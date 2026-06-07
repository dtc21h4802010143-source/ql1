import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { KpiChart } from "../components/charts/kpi-chart";
import { useTranslation } from "../lib/i18n";

export const Kpis = () => {
	const [summary, setSummary] = useState(null);

	const getScoreClass = (v) => {
		if (v == null || v === "N/A") return "text-muted-foreground";
		const n = Number(v);
		if (Number.isNaN(n)) return "text-muted-foreground";
		if (n >= 80) return "text-emerald-600";
		if (n >= 60) return "text-amber-500";
		return "text-rose-600";
	};

	const [confirmation, setConfirmation] = useState(null);
	const [resultModal, setResultModal] = useState(null);

	const [computing, setComputing] = useState(false);


	useEffect(() => {
		api.get("/dashboard/summary").then(({ data }) => setSummary(data));
	}, []);

	const { t } = useTranslation();

	if (!summary) return <div className="h-40 rounded-3xl bg-card animate-pulse" />;

	const kpi = summary.kpi || {};
	const ranking = summary.ranking || [];
	const records = summary.kpiRecords || [];

	const exportPdf = async () => {
		const res = await api.get("/kpi-rankings/export?type=pdf", { responseType: "blob" });
		const blob = new Blob([res.data], { type: "application/pdf" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = res.headers["content-disposition"]?.split("filename=")[1] || `kpi_rankings_${Date.now()}.pdf`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		window.URL.revokeObjectURL(url);
	};

	const computeAutoKpi = () => {
		if (!summary?.period?.id) {
			toast.error("Không có kỳ KPI hiện thời để tính tự động");
			return;
		}
		setConfirmation({
			type: "compute-kpi",
			title: "Xác nhận tính KPI tự động",
			message: `Bạn có chắc muốn tính KPI tự động cho kỳ '${summary.period.label || summary.period.id}' không?`,
			confirmLabel: "Tính ngay",
			payload: { periodId: summary.period.id }
		});
	};

	const closeConfirmation = () => {
		if (computing) return;
		setConfirmation(null);
	};

	const runConfirmedAction = async () => {
		if (!confirmation) return;
		const { type, payload } = confirmation;
		setConfirmation(null);
		if (type !== "compute-kpi") return;
		setComputing(true);
		try {
			const resPost = await api.post("/kpi-records/submit", { periodId: payload.periodId, auto: true });
			const resultData = resPost?.data || null;
			const res = await api.get("/dashboard/summary");
			setSummary(res.data);
			// ensure modal shows concise structured result
			setResultModal(resultData || { message: "KPI đã được tính. Xem bảng xếp hạng để biết chi tiết." });
			// scroll to top and focus close button so user immediately sees the modal
			window.scrollTo({ top: 0, behavior: "smooth" });
			setTimeout(() => {
				document.querySelector('#kpi-result-close')?.focus();
			}, 150);
			toast.success("Đã tính KPI tự động và lưu kết quả");
		} catch (err) {
			toast.error(err?.response?.data?.message || "Không thể tính KPI tự động");
		} finally {
			setComputing(false);
		}
	};

	return (
		<div className="space-y-6">
			{confirmation ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-3xl border border-border/60 bg-background p-6 shadow-2xl">
						<p className="text-sm font-medium text-destructive">Xác nhận</p>
						<h3 className="mt-2 text-xl font-semibold">{confirmation.title}</h3>
						<p className="mt-2 text-sm text-muted-foreground">{confirmation.message}</p>
						<div className="mt-6 flex flex-wrap justify-end gap-2">
							<Button variant="secondary" onClick={closeConfirmation}>Hủy</Button>
							<Button onClick={runConfirmedAction}>{confirmation.confirmLabel}</Button>
						</div>
					</div>
				</div>
			) : null}

			{resultModal ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
					<div className="w-full max-w-2xl rounded-3xl border border-border/60 bg-background p-6 shadow-2xl">
						<p className="text-sm font-medium">Kết quả</p>
						<h3 className="mt-2 text-xl font-semibold">Kết quả tính KPI</h3>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="flex flex-col gap-4">
									<div className="rounded-2xl border border-border/60 p-6 flex items-center justify-between">
										<div>
											<p className="text-sm text-muted-foreground">Kỳ KPI</p>
											<p className="font-semibold">{resultModal?.periodLabel || resultModal?.period?.label || resultModal?.record?.periodId || 'N/A'}</p>
										</div>
										<div className="text-3xl font-bold">
											<span className={getScoreClass(resultModal?.record?.finalScore ?? resultModal?.engineResult?.finalScore)}>
												{resultModal?.record?.finalScore ?? resultModal?.engineResult?.finalScore ?? 'N/A'}
											</span>
										</div>
									</div>
									<div className="rounded-2xl border border-border/60 p-4 grid grid-cols-3 gap-3">
										<div className="text-center">
											<p className="text-sm text-muted-foreground">Productivity</p>
											<p className={`font-semibold text-lg ${getScoreClass(resultModal?.record?.productivityScore ?? resultModal?.engineResult?.productivityScore)}`}>
												{resultModal?.record?.productivityScore ?? resultModal?.engineResult?.productivityScore ?? 'N/A'}
											</p>
										</div>
										<div className="text-center">
											<p className="text-sm text-muted-foreground">Quality</p>
											<p className={`font-semibold text-lg ${getScoreClass(resultModal?.record?.qualityScore ?? resultModal?.engineResult?.qualityScore)}`}>
												{resultModal?.record?.qualityScore ?? resultModal?.engineResult?.qualityScore ?? 'N/A'}
											</p>
										</div>
										<div className="text-center">
											<p className="text-sm text-muted-foreground">Timeliness</p>
											<p className={`font-semibold text-lg ${getScoreClass(resultModal?.record?.timelinessScore ?? resultModal?.engineResult?.timelinessScore)}`}>
												{resultModal?.record?.timelinessScore ?? resultModal?.engineResult?.timelinessScore ?? 'N/A'}
											</p>
										</div>
									</div>
								</div>
								<div className="rounded-2xl border border-border/60 p-4">
									<p className="text-sm text-muted-foreground">Chi tiết</p>
									<ul className="mt-2 space-y-2 text-sm">
										<li>Số task được xét: <span className="font-medium">{resultModal?.engineResult?.computedFrom?.tasksConsidered ?? 'N/A'}</span></li>
										<li>Task hoàn thành: <span className="font-medium">{resultModal?.engineResult?.computedFrom?.completedCount ?? 'N/A'}</span></li>
										<li>Người nhận: <span className="font-medium">{resultModal?.recipientName || summary?.user?.fullName || 'N/A'}</span></li>
										<li>Email gửi: <span className="font-medium"><Badge>{resultModal?.emailSent ? 'Đã gửi' : 'Không gửi'}</Badge></span></li>
									</ul>
								</div>
							</div>
						<div className="mt-6 flex justify-end">
							<Button id="kpi-result-close" variant="secondary" onClick={() => setResultModal(null)}>Đóng</Button>
						</div>
					</div>
				</div>
			) : null}
			<Card>
				<CardHeader>
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<CardTitle>{t("pages.kpis.title") || "KPI dashboard"}</CardTitle>
							<CardDescription>{t("pages.kpis.description") || "Visual KPI overview for each role"}</CardDescription>
						</div>
						<div className="flex items-center gap-2">
							<Button variant="secondary" onClick={exportPdf}>{t("pages.kpis.export_pdf")}</Button>
							<Button variant="ghost" onClick={computeAutoKpi} disabled={computing}>{computing ? "..." : "Compute KPI tự động"}</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent className="grid gap-4 md:grid-cols-4">
					{[
						{ label: "Productivity", value: kpi.productivityScore },
						{ label: "Quality", value: kpi.qualityScore },
						{ label: "Timeliness", value: kpi.timelinessScore },
						{ label: "Final", value: kpi.finalScore }
					].map((item) => {
						const cls = getScoreClass(item.value);
						return (
							<div key={item.label} className="rounded-3xl border border-border/60 p-5">
								<p className="text-sm text-muted-foreground">{item.label}</p>
								<p className={`mt-3 text-4xl font-semibold ${cls}`}>{item.value ?? 'N/A'}</p>
							</div>
						);
					})}
				</CardContent>
			</Card>

			<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<Card>
					<CardHeader>
						<CardTitle>KPI breakdown</CardTitle>
						<CardDescription>{summary.period?.label || summary.kpi?.cycleLabel || "Current period"}</CardDescription>
					</CardHeader>
					<CardContent>
						<KpiChart scores={[
							{ label: "Prod", value: kpi.productivityScore },
							{ label: "Qual", value: kpi.qualityScore },
							{ label: "Time", value: kpi.timelinessScore }
						]} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Top ranking</CardTitle>
						<CardDescription>Leaderboard for the active period</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{ranking.map((item) => (
							<div key={`${item.userId}-${item.periodId}-${item.rank}`} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
								<div>
									<p className="font-medium">#{item.rank} {item.fullName}</p>
									<p className="text-sm text-muted-foreground">{item.departmentName}</p>
								</div>
								<Badge>{item.finalScore}</Badge>
							</div>
						))}
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Recent KPI history</CardTitle>
					<CardDescription>Latest seed-backed workflow events</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{records.slice(0, 6).map((item, index) => (
						<div key={`${item.type}-${index}`} className="rounded-2xl border border-border/60 p-4">
							<p className="font-medium">{item.title || item.type}</p>
							<p className="mt-1 text-sm text-muted-foreground">{item.message || item.note || item.createdAt || "KPI event"}</p>
						</div>
					))}
				</CardContent>
			</Card>
		</div>
	);
};