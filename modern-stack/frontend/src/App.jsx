import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./layouts/AppShell";
import { useAuthStore } from "./store/authStore";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { Projects } from "./pages/Projects";
import { Criteria } from "./pages/Criteria";
import { Kpis } from "./pages/Kpis";
import { KpiReports } from "./pages/KpiReports";
import { Assistant } from "./pages/Assistant";
import { Reports } from "./pages/Reports";
import { Notifications } from "./pages/Notifications";
import { Home } from "./pages/Home";
import { Profile } from "./pages/Profile";
import { AppSettings } from "./pages/AppSettings";
import { Leave } from "./pages/Leave";
import { Attendance } from "./pages/Attendance";
import { ExpenseClaim } from "./pages/ExpenseClaim";
import { EmployeeAdvance } from "./pages/EmployeeAdvance";
import { SalarySlip } from "./pages/SalarySlip";
import { TaskDetail } from "./pages/TaskDetail";
import { TaskForm } from "./pages/TaskForm";
import { AdminCenter } from "./pages/AdminCenter";
import { useEffect } from "react";

const Protected = ({ children, roles }) => {
	const user = useAuthStore((state) => state.user);
	if (!user) return <Navigate to="/login" replace />;
	if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
	return <AppShell>{children}</AppShell>;
};

export const App = () => {
	const isReady = useAuthStore((state) => state.isReady);
	const bootstrap = useAuthStore((state) => state.bootstrap);

	useEffect(() => {
		bootstrap();
	}, [bootstrap]);

	if (!isReady) return null;

	return (
		<Routes>
			<Route path="/login" element={<Login />} />
			<Route path="/home" element={<Protected><Home /></Protected>} />
			<Route path="/" element={<Protected><Dashboard /></Protected>} />
			<Route path="/admin" element={<Protected roles={["Admin"]}><AdminCenter /></Protected>} />
			<Route path="/tasks" element={<Protected><Tasks /></Protected>} />
				<Route path="/projects" element={<Protected roles={["Admin","Manager"]}><Projects /></Protected>} />
				<Route path="/criteria" element={<Protected roles={["Admin"]}><Criteria /></Protected>} />
			<Route path="/task-form" element={<Protected><TaskForm /></Protected>} />
			<Route path="/task-detail" element={<Protected><TaskDetail /></Protected>} />
			<Route path="/kpis" element={<Protected><Kpis /></Protected>} />
			<Route path="/kpi-reports" element={<Protected><KpiReports /></Protected>} />
			<Route path="/leave" element={<Protected><Leave /></Protected>} />
			<Route path="/attendance" element={<Protected><Attendance /></Protected>} />
			<Route path="/expense-claims" element={<Protected><ExpenseClaim /></Protected>} />
			<Route path="/employee-advances" element={<Protected><EmployeeAdvance /></Protected>} />
			<Route path="/salary-slip" element={<Protected><SalarySlip /></Protected>} />
			<Route path="/profile" element={<Protected><Profile /></Protected>} />
			<Route path="/settings" element={<Protected><AppSettings /></Protected>} />
			<Route path="/notifications" element={<Protected><Notifications /></Protected>} />
			<Route path="/assistant" element={<Protected><Assistant /></Protected>} />
			<Route path="/reports" element={<Protected><Reports /></Protected>} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
};