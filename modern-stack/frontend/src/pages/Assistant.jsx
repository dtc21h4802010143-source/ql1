import { useState } from "react";
import { api } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { useTranslation } from "../lib/i18n";

export const Assistant = () => {
	const [messages, setMessages] = useState([
		{ role: "assistant", text: "Tôi có thể tóm tắt công việc, gợi ý ưu tiên task và tạo báo cáo tuần." }
	]);
	const [text, setText] = useState("");

	const submit = async (event) => {
		event.preventDefault();
		if (!text.trim()) return;
		const userMessage = text;
		setMessages((current) => [...current, { role: "user", text: userMessage }]);
		setText("");
		const { data } = await api.post("/assistant/chat", { message: userMessage });
		setMessages((current) => [...current, { role: "assistant", text: data.reply }]);
	};

	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.assistant.title")}</CardTitle>
				<CardDescription>{t("pages.assistant.description")}</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="mb-4 space-y-3 rounded-3xl border border-border/60 p-4">
					{messages.map((message, index) => (
						<div key={index} className={`max-w-2xl rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}>
							{message.text}
						</div>
					))}
				</div>
				<form onSubmit={submit} className="flex gap-3">
					<Input value={text} onChange={(event) => setText(event.target.value)} placeholder={t("pages.assistant.placeholder") || "Hỏi về KPI, deadline, báo cáo tuần..."} />
					<Button>{t("pages.assistant.send") || "Send"}</Button>
				</form>
			</CardContent>
		</Card>
	);
};