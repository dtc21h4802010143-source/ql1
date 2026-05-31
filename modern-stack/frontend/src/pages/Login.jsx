import { useState } from "react";
import { Navigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useTranslation } from "../lib/i18n";

export const Login = () => {
	const user = useAuthStore((state) => state.user);
	const setSession = useAuthStore((state) => state.setSession);
	const [form, setForm] = useState({ email: "admin@hrms.local", password: "admin123" });
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	if (user) {
		return <Navigate to="/" replace />;
	}

	const { t } = useTranslation();

	const submit = async (event) => {
		event.preventDefault();
		setLoading(true);
		setError("");
		try {
			const { data } = await api.post("/auth/login", form);
			setSession(data);
		} catch (err) {
			setError(err?.response?.data?.message || "Unable to login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid min-h-full place-items-center p-6">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle>{t("pages.login.title")}</CardTitle>
					<CardDescription>{t("pages.login.description")}</CardDescription>
				</CardHeader>
				<CardContent>
					<form className="space-y-4" onSubmit={submit}>
						<div className="space-y-2">
							<label className="text-sm font-medium">{t("pages.login.email")}</label>
							<Input value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
						</div>
						<div className="space-y-2">
							<label className="text-sm font-medium">{t("pages.login.password")}</label>
							<Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
						</div>
						{error ? <p className="text-sm text-red-500">{error}</p> : null}
						<Button className="w-full" disabled={loading}>{loading ? t("pages.login.signing_in") : t("pages.login.sign_in")}</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};