import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useTranslation } from "../lib/i18n";

export const Profile = () => {
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		api.get("/profile").then(({ data }) => setProfile(data));
	}, []);

	const { t } = useTranslation();

	if (!profile) return <div className="h-48 rounded-3xl bg-card animate-pulse" />;

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.profile.title") || "Employee profile"}</CardTitle>
				<CardDescription>{t("pages.profile.description") || "Unified profile, status and access summary for demo roles."}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid gap-3 md:grid-cols-2">
					{[
						{ label: t("pages.profile.full_name") || "Full name", value: profile.fullName },
						{ label: t("pages.profile.role") || "Role", value: profile.role },
						{ label: t("pages.profile.email") || "Email", value: profile.email },
						{ label: t("pages.profile.user_id") || "User ID", value: profile.id }
					].map((item) => (
						<div key={item.label} className="rounded-2xl border border-border/60 p-4">
							<p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{item.label}</p>
							<p className="mt-2 font-semibold">{item.value}</p>
						</div>
					))}
				</div>
				<Button variant="secondary">Edit profile</Button>
			</CardContent>
		</Card>
	);
};