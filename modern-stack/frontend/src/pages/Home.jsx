import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { moduleCatalog } from "../data/modules";
import { useAuthStore } from "../store/authStore";
import { useTranslation } from "../lib/i18n";

export const Home = () => {
	const user = useAuthStore((state) => state.user);
	const role = user?.role || "Employee";
	const modules = moduleCatalog[role] || moduleCatalog.Employee;
	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<Card className="overflow-hidden border-none bg-gradient-to-br from-primary via-sky-600 to-cyan-500 text-white shadow-soft">
				<CardHeader>
					<CardTitle className="text-3xl">{role} {t("pages.home.workspace")}</CardTitle>
					<CardDescription className="max-w-2xl text-white/80">{t("pages.home.description")}</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					<Badge variant="outline" className="border-white/30 text-white">Responsive</Badge>
					<Badge variant="outline" className="border-white/30 text-white">Role-based</Badge>
					<Badge variant="outline" className="border-white/30 text-white">Modern UI</Badge>
					<Badge variant="outline" className="border-white/30 text-white">Realtime ready</Badge>
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{[
						{ label: t("pages.home.modules_available"), value: modules.length },
						{ label: t("pages.home.active_notifications"), value: 2 },
						{ label: t("pages.home.realtime_channels"), value: 1 },
						{ label: t("pages.home.ai_assistance_on"), value: "On" }
					].map((item) => (
						<Card key={item.label}>
							<CardHeader className="pb-2">
								<CardDescription>{item.label}</CardDescription>
								<CardTitle className="text-3xl">{item.value}</CardTitle>
							</CardHeader>
						</Card>
					))}
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Module coverage</CardTitle>
					<CardDescription>Modules ported into the React UI so far for the selected role.</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-wrap gap-2">
					{modules.map((module) => <Badge key={module} variant="secondary">{module}</Badge>)}
				</CardContent>
			</Card>

			<div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
				<Card>
					<CardHeader>
						<CardTitle>Demo actions</CardTitle>
						<CardDescription>Quick entry points for manager, employee and admin demo flows.</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3 sm:grid-cols-2">
						{[
							"Create task",
							"Review KPI",
							"Submit leave request",
							"Check attendance",
							"File expense claim",
							"Ask AI assistant"
						].map((action) => <Button key={action} variant="secondary" className="justify-start">{action}</Button>)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Role summary</CardTitle>
						<CardDescription>What this role gets in the current demo build.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 text-sm text-muted-foreground">
						<p>Admin sees the global overview, system-wide management and reports.</p>
						<p>Manager sees team performance, task assignment and KPI review.</p>
						<p>Employee sees personal tasks, KPI, leave, attendance and AI help.</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};