import { NavLink, useNavigate } from "react-router-dom";
import { Bell, Bot, BarChart3, CheckSquare, LogOut, MoonStar, ShieldCheck, SunMedium, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useAuthStore } from "../store/authStore";
import { useUiStore } from "../store/uiStore";
import { useTranslation } from "../lib/i18n";

const navByRole = {
	Admin: [
		{ to: "/home", label: "nav.home", icon: BarChart3 },
		{ to: "/", label: "nav.dashboard", icon: BarChart3 },
		{ to: "/admin", label: "nav.admin", icon: ShieldCheck },
		{ to: "/tasks", label: "nav.tasks", icon: CheckSquare },
		{ to: "/task-form", label: "nav.task_form" },
		{ to: "/task-detail", label: "nav.task_detail" },
		{ to: "/kpis", label: "nav.kpis", icon: Users },
		{ to: "/leave", label: "nav.leave" },
		{ to: "/attendance", label: "nav.attendance" },
		{ to: "/expense-claims", label: "nav.expense_claim" },
		{ to: "/employee-advances", label: "nav.employee_advance" },
		{ to: "/salary-slip", label: "nav.salary_slip" },
		{ to: "/profile", label: "nav.profile" },
		{ to: "/settings", label: "nav.settings" },
		{ to: "/notifications", label: "nav.notifications", icon: Bell },
		{ to: "/assistant", label: "nav.assistant", icon: Bot },
		{ to: "/reports", label: "nav.reports", icon: Bell }
	],
	Manager: [
		{ to: "/home", label: "nav.home", icon: BarChart3 },
		{ to: "/", label: "nav.dashboard", icon: BarChart3 },
		{ to: "/tasks", label: "nav.tasks", icon: CheckSquare },
		{ to: "/task-form", label: "nav.task_form" },
		{ to: "/task-detail", label: "nav.task_detail" },
		{ to: "/kpis", label: "nav.team_kpi", icon: Users },
		{ to: "/leave", label: "nav.leave" },
		{ to: "/attendance", label: "nav.attendance" },
		{ to: "/expense-claims", label: "nav.expense_claim" },
		{ to: "/salary-slip", label: "nav.salary_slip" },
		{ to: "/profile", label: "nav.profile" },
		{ to: "/notifications", label: "nav.notifications", icon: Bell },
		{ to: "/assistant", label: "nav.assistant", icon: Bot }
	],
	Employee: [
		{ to: "/home", label: "nav.home", icon: BarChart3 },
		{ to: "/", label: "nav.dashboard", icon: BarChart3 },
		{ to: "/tasks", label: "nav.tasks", icon: CheckSquare },
		{ to: "/kpis", label: "nav.my_kpi", icon: Users },
		{ to: "/leave", label: "nav.leave" },
		{ to: "/attendance", label: "nav.attendance" },
		{ to: "/expense-claims", label: "nav.expense_claim" },
		{ to: "/employee-advances", label: "nav.employee_advance" },
		{ to: "/salary-slip", label: "nav.salary_slip" },
		{ to: "/profile", label: "nav.profile" },
		{ to: "/notifications", label: "nav.notifications", icon: Bell },
		{ to: "/assistant", label: "nav.assistant", icon: Bot }
	]
};

export const AppShell = ({ children }) => {
	const user = useAuthStore((state) => state.user);
	const clearSession = useAuthStore((state) => state.clearSession);
	const theme = useUiStore((state) => state.theme);
	const setTheme = useUiStore((state) => state.setTheme);
	const { t, locale, setLocale } = useTranslation();
	const navigate = useNavigate();

	const navItems = navByRole[user?.role] || navByRole.Employee;

	return (
		<div className="min-h-full xl:grid xl:grid-cols-[280px_1fr]">
			<aside className="border-r border-border/60 bg-card/70 p-5 backdrop-blur-xl">
				<div className="mb-8 flex items-center justify-between">
					<div>
						<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("app.title")}</p>
						<h1 className="text-xl font-semibold">{t("app.name")}</h1>
					</div>
					<div className="flex flex-col items-end gap-2">
						<Badge variant="outline">{user?.role || "Guest"}</Badge>
						<Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">Demo mode</Badge>
					</div>
				</div>
				<nav className="space-y-1">
					{navItems.map((item) => {
						const Icon = item.icon;
						return (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${isActive ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground hover:bg-muted"}`
								}
							>
								{Icon ? <Icon size={18} /> : null}
								<span>{t(item.label)}</span>
							</NavLink>
						);
					})}
				</nav>
				<div className="mt-8 rounded-3xl bg-gradient-to-br from-primary/15 to-cyan-500/10 p-4">
					<p className="text-sm font-medium">{t("ai.title")}</p>
					<p className="mt-2 text-sm text-muted-foreground">{t("ai.description")}</p>
				</div>
			</aside>

			<div className="flex min-h-screen flex-col">
				<header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/85 px-6 py-4 backdrop-blur-xl">
					<div>
						<p className="text-sm text-muted-foreground">Welcome back</p>
						<h2 className="text-lg font-semibold">{user?.fullName || "Guest"}</h2>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="secondary" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark") }>
							{theme === "dark" ? <SunMedium size={16} /> : <MoonStar size={16} />}
						</Button>
						<Button variant="secondary" size="sm" onClick={() => navigate("/assistant") }>
							<Bot size={16} />
						</Button>
						<Button variant="secondary" size="sm" onClick={() => setLocale(locale === "en" ? "vi" : "en") }>
							{locale === "en" ? t("buttons.vi") : t("buttons.en")}
						</Button>
						<Button variant="ghost" size="sm" onClick={clearSession}>
							<LogOut size={16} />
						</Button>
					</div>
				</header>
				<main className="flex-1 p-6 xl:p-8">{children}</main>
			</div>
		</div>
	);
};