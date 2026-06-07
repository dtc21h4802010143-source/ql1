import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { socket } from "../lib/socket";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "../lib/i18n";

export const Notifications = () => {
	const [items, setItems] = useState([]);

	const refreshNotifications = async () => {
		const { data } = await api.get("/notifications");
		setItems(data);
	};

	const markAsRead = async (notificationId) => {
		await api.patch(`/notifications/${notificationId}/read`);
		setItems((current) => current.map((item) => item.id === notificationId ? { ...item, isRead: true } : item));
	};

	const markAllAsRead = async () => {
		const { data } = await api.patch("/notifications/read-all");
		setItems(data);
	};

	useEffect(() => {
		refreshNotifications();
		socket.connect();
		const handleNotification = (notification) => {
			toast(notification.title);
			setItems((current) => [{ ...notification, id: notification.id || Date.now(), isRead: false, createdAt: new Date().toISOString() }, ...current]);
		};
		socket.on("notification", handleNotification);
		return () => {
			socket.off("notification", handleNotification);
			socket.disconnect();
		};
	}, []);

	const { t } = useTranslation();

	return (
		<Card>
			<CardHeader>
				<CardTitle>{t("pages.notifications.title")}</CardTitle>
				<CardDescription>{t("pages.notifications.description")}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex flex-wrap gap-2">
					<Button variant="secondary" onClick={markAllAsRead}>{t("pages.notifications.mark_all")}</Button>
					<Button variant="ghost" onClick={refreshNotifications}>{t("pages.notifications.refresh")}</Button>
				</div>
				{items.map((notification) => (
					<div key={notification.id} className="rounded-2xl border border-border/60 p-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<p className="font-medium">{notification.title}</p>
								<p className="text-sm text-muted-foreground">{notification.message}</p>
							</div>
							<div className="flex items-center gap-2">
								<span className={`rounded-full px-2 py-1 text-xs ${notification.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"}`}>{notification.isRead ? t("pages.notifications.read") : t("pages.notifications.unread")}</span>
								{!notification.isRead ? <Button variant="secondary" onClick={() => markAsRead(notification.id)}>{t("pages.notifications.mark_read")}</Button> : null}
							</div>
						</div>
					</div>
				))}
				{!items.length ? <p className="text-sm text-muted-foreground">{t("pages.notifications.no_items")}</p> : null}
			</CardContent>
		</Card>
	);
};