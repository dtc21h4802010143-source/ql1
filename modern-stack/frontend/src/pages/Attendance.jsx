import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useTranslation } from "../lib/i18n";

export const Attendance = () => {
	const [checkins, setCheckins] = useState([]);
	const [shifts, setShifts] = useState([]);
	const [note, setNote] = useState("");

	const load = async () => {
		const [checkinsResponse, shiftsResponse] = await Promise.all([api.get("/attendance/checkins"), api.get("/attendance/shifts")]);
		setCheckins(checkinsResponse.data);
		setShifts(shiftsResponse.data);
	};

	useEffect(() => {
		load();
	}, []);

	const checkIn = async () => {
		await api.post("/attendance/checkins", { note });
		setNote("");
		load();
	};

	const { t } = useTranslation();

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>{t("pages.attendance.title") || "Attendance"}</CardTitle>
					<CardDescription>{t("pages.attendance.description") || "Fast review for employee and manager."}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-3">
					{checkins.map((row) => (
						<div key={row.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
							<div>
								<p className="font-semibold">{new Date(row.checkInAt).toLocaleDateString("vi-VN")}</p>
								<p className="text-sm text-muted-foreground">{new Date(row.checkInAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} - {row.note}</p>
							</div>
							<Badge variant="secondary">{row.status}</Badge>
						</div>
					))}
				</CardContent>
			</Card>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card>
					<CardHeader>
							<CardTitle>{t("pages.attendance.checkin_title") || "Check-in"}</CardTitle>
							<CardDescription>{t("pages.attendance.checkin_desc") || "Quick self check-in for demo flow."}</CardDescription>
						</CardHeader>
					<CardContent className="flex gap-3">
						<Input value={note} onChange={(event) => setNote(event.target.value)} placeholder={t("pages.attendance.note_placeholder") || "Note"} />
						<Button onClick={checkIn}>{t("pages.attendance.checkin_button") || "Check in"}</Button>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("pages.attendance.shifts_title") || "Shift assignments"}</CardTitle>
						<CardDescription>{t("pages.attendance.shifts_desc") || "Manager assignment and employee request flow."}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{shifts.map((shift) => (
							<div key={shift.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
								<div>
									<p className="font-semibold">{shift.title}</p>
									<p className="text-sm text-muted-foreground">{shift.assigneeName} - {shift.shiftDate}</p>
								</div>
								<Badge variant="secondary">{shift.status}</Badge>
							</div>
						))}
					</CardContent>
				</Card>
			</div>
		</div>
	);
};