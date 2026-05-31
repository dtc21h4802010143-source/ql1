import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useUiStore } from "../store/uiStore";
import { useTranslation } from "../lib/i18n";

export const AppSettings = () => {
	const theme = useUiStore((state) => state.theme);
	const setTheme = useUiStore((state) => state.setTheme);
	const [settings, setSettings] = useState(null);

	useEffect(() => {
		api.get("/settings").then(({ data }) => {
			setSettings(data);
			setTheme(data.theme || "light");
		});
	}, [setTheme]);

	const toggleNotifications = async () => {
		if (!settings) return;
		const { data } = await api.put("/settings", { ...settings, notificationsEnabled: !settings.notificationsEnabled });
		setSettings(data);
	};

	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.settings.title") || "App settings"}</CardTitle>
				<CardDescription>{t("pages.settings.description") || "Theme, notifications and productivity preferences."}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-3 md:grid-cols-3">
					{[
						{ label: t("pages.settings.theme") || "Theme", value: settings?.theme || theme },
						{ label: t("pages.settings.notifications") || "Notifications", value: settings?.notificationsEnabled ? t("pages.settings.enabled") : t("pages.settings.disabled") },
						{ label: t("pages.settings.default_dashboard") || "Default dashboard", value: settings?.defaultDashboard || "role-based" }
					].map((item) => (
						<div key={item.label} className="rounded-2xl border border-border/60 p-4">
							<p className="text-sm font-medium">{item.label}</p>
							<p className="mt-1 text-sm text-muted-foreground">{item.value}</p>
						</div>
					))}
				</div>
				<div className="flex flex-wrap gap-2">
					<Button variant={theme === "dark" ? "default" : "secondary"} onClick={() => setTheme("dark")}>{t("pages.settings.dark_mode") || "Dark mode"}</Button>
					<Button variant={theme === "light" ? "default" : "secondary"} onClick={() => setTheme("light")}>{t("pages.settings.light_mode") || "Light mode"}</Button>
					<Button variant="secondary" onClick={toggleNotifications}>{t("pages.settings.toggle_notifications") || "Toggle notifications"}</Button>
				</div>
			</CardContent>
		</Card>
	);
};