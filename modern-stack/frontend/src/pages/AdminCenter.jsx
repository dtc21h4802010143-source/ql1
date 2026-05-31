import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useTranslation } from "../lib/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { toast } from "sonner";

const departmentInitial = { name: "", code: "", managerId: "" };
const employeeInitial = { fullName: "", email: "", password: "", role: "Employee", departmentId: "", managerId: "" };

export const AdminCenter = () => {
	const { t } = useTranslation();
	const [loading, setLoading] = useState(true);
	const [departments, setDepartments] = useState([]);
	const [employees, setEmployees] = useState([]);
	const [periods, setPeriods] = useState([]);
	const [rankings, setRankings] = useState([]);
	const [summary, setSummary] = useState(null);
	const [departmentForm, setDepartmentForm] = useState(departmentInitial);
	const [departmentEditingId, setDepartmentEditingId] = useState(null);
	const [employeeForm, setEmployeeForm] = useState(employeeInitial);
	const [employeeEditingId, setEmployeeEditingId] = useState(null);
	const [busyPeriodId, setBusyPeriodId] = useState(null);
	const [resetting, setResetting] = useState(false);
	const [savingDepartment, setSavingDepartment] = useState(false);
	const [savingEmployee, setSavingEmployee] = useState(false);
	const [confirmation, setConfirmation] = useState(null);
	const [departmentQuery, setDepartmentQuery] = useState("");
	const [employeeQuery, setEmployeeQuery] = useState("");
	const [departmentPage, setDepartmentPage] = useState(1);
	const [employeePage, setEmployeePage] = useState(1);
	const pageSize = 5;

	const loadData = async () => {
		setLoading(true);
		try {
			const [departmentRes, employeeRes, periodRes, rankingRes, summaryRes] = await Promise.all([
				api.get("/departments"),
				api.get("/employees"),
				api.get("/kpi-periods"),
				api.get("/kpi-rankings"),
				api.get("/dashboard/summary")
			]);
			setDepartments(departmentRes.data || []);
			setEmployees(employeeRes.data || []);
			setPeriods(periodRes.data || []);
			setRankings(rankingRes.data || []);
			setSummary(summaryRes.data || null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadData();
	}, []);

	const lockedPeriods = useMemo(() => periods.filter((item) => item.status === "locked"), [periods]);
	const activePeriods = useMemo(() => periods.filter((item) => item.status !== "locked"), [periods]);
	const filteredDepartments = useMemo(() => {
		const keyword = departmentQuery.trim().toLowerCase();
		return departments.filter((department) => {
			if (!keyword) return true;
			return [department.name, department.code, department.managerName]
				.filter(Boolean)
				.some((field) => String(field).toLowerCase().includes(keyword));
		});
	}, [departments, departmentQuery]);
	const filteredEmployees = useMemo(() => {
		const keyword = employeeQuery.trim().toLowerCase();
		return employees.filter((employee) => {
			if (!keyword) return true;
			return [employee.fullName, employee.email, employee.role, employee.departmentName, employee.managerName]
				.filter(Boolean)
				.some((field) => String(field).toLowerCase().includes(keyword));
		});
	}, [employees, employeeQuery]);
	const departmentPageCount = Math.max(1, Math.ceil(filteredDepartments.length / pageSize));
	const employeePageCount = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
	const visibleDepartments = filteredDepartments.slice((departmentPage - 1) * pageSize, departmentPage * pageSize);
	const visibleEmployees = filteredEmployees.slice((employeePage - 1) * pageSize, employeePage * pageSize);

	useEffect(() => {
		setDepartmentPage((current) => Math.min(current, departmentPageCount));
	}, [departmentPageCount]);

	useEffect(() => {
		setEmployeePage((current) => Math.min(current, employeePageCount));
	}, [employeePageCount]);

	const resetDepartmentForm = () => {
		setDepartmentForm(departmentInitial);
		setDepartmentEditingId(null);
	};

	const resetEmployeeForm = () => {
		setEmployeeForm(employeeInitial);
		setEmployeeEditingId(null);
	};

	const closeConfirmation = () => {
		if (savingDepartment || savingEmployee || resetting || busyPeriodId) {
			return;
		}
		setConfirmation(null);
	};

	const runConfirmedAction = async () => {
		if (!confirmation) {
			return;
		}

		const { type, payload } = confirmation;
		setConfirmation(null);

		if (type === "save-department") {
			setSavingDepartment(true);
			try {
				await api.patch(`/departments/${payload.departmentId}`, payload.form);
				toast.success("Department updated");
				resetDepartmentForm();
				await loadData();
			} catch (error) {
				toast.error(error?.response?.data?.message || "Unable to save department");
			} finally {
				setSavingDepartment(false);
			}
			return;
		}

		if (type === "save-employee") {
			setSavingEmployee(true);
			try {
				await api.patch(`/employees/${payload.employeeId}`, payload.form);
				toast.success("Employee updated");
				resetEmployeeForm();
				await loadData();
			} catch (error) {
				toast.error(error?.response?.data?.message || "Unable to save employee");
			} finally {
				setSavingEmployee(false);
			}
			return;
		}

		if (type === "delete-department") {
			try {
				await api.delete(`/departments/${payload.departmentId}`);
				toast.success("Department deleted");
				await loadData();
			} catch (error) {
				toast.error(error?.response?.data?.message || "Unable to delete department");
			}
			return;
		}

		if (type === "delete-employee") {
			try {
				await api.delete(`/employees/${payload.employeeId}`);
				toast.success("Employee deleted");
				await loadData();
			} catch (error) {
				toast.error(error?.response?.data?.message || "Unable to delete employee");
			}
		}
	};

	const submitDepartment = async (event) => {
		event.preventDefault();
		const payload = {
			name: departmentForm.name,
			code: departmentForm.code,
			managerId: departmentForm.managerId || null
		};
		if (departmentEditingId) {
			setConfirmation({
				type: "save-department",
				title: "Confirm department update",
				message: `Update ${payload.name || "this department"}? This will change the saved record.`,
				confirmLabel: "Update",
				payload: {
					departmentId: departmentEditingId,
					form: payload
				}
			});
			return;
		}

		setSavingDepartment(true);
		try {
			await api.post("/departments", payload);
			toast.success("Department created");
			resetDepartmentForm();
			await loadData();
		} catch (error) {
			toast.error(error?.response?.data?.message || "Unable to save department");
		} finally {
			setSavingDepartment(false);
		}
	};

	const editDepartment = (department) => {
		setDepartmentEditingId(department.id);
		setDepartmentForm({
			name: department.name || "",
			code: department.code || "",
			managerId: department.managerId || ""
		});
	};

	const removeDepartment = async (departmentId) => {
		setConfirmation({
			type: "delete-department",
			title: "Delete department",
			message: "This will remove the department and reassign linked employees if needed.",
			confirmLabel: "Delete",
			payload: { departmentId }
		});
	};

	const submitEmployee = async (event) => {
		event.preventDefault();
		const payload = {
			fullName: employeeForm.fullName,
			email: employeeForm.email,
			password: employeeForm.password || undefined,
			role: employeeForm.role,
			departmentId: employeeForm.departmentId,
			managerId: employeeForm.managerId || null
		};
		if (employeeEditingId) {
			setConfirmation({
				type: "save-employee",
				title: "Confirm employee update",
				message: `Update ${payload.fullName || "this employee"}? This will change the saved record.`,
				confirmLabel: "Update",
				payload: {
					employeeId: employeeEditingId,
					form: payload
				}
			});
			return;
		}

		setSavingEmployee(true);
		try {
			await api.post("/employees", payload);
			toast.success("Employee created");
			resetEmployeeForm();
			await loadData();
		} catch (error) {
			toast.error(error?.response?.data?.message || "Unable to save employee");
		} finally {
			setSavingEmployee(false);
		}
	};

	const editEmployee = (employee) => {
		setEmployeeEditingId(employee.id);
		setEmployeeForm({
			fullName: employee.fullName || "",
			email: employee.email || "",
			password: "",
			role: employee.role || "Employee",
			departmentId: employee.departmentId || "",
			managerId: employee.managerId || ""
		});
	};

	const removeEmployee = async (employeeId) => {
		setConfirmation({
			type: "delete-employee",
			title: "Delete employee",
			message: "This will permanently remove the employee record.",
			confirmLabel: "Delete",
			payload: { employeeId }
		});
	};

	const goToDepartmentPage = (nextPage) => {
		setDepartmentPage(Math.min(Math.max(nextPage, 1), departmentPageCount));
	};

	const goToEmployeePage = (nextPage) => {
		setEmployeePage(Math.min(Math.max(nextPage, 1), employeePageCount));
	};

	const lockPeriod = async (periodId) => {
		setBusyPeriodId(periodId);
		try {
			await api.post(`/kpi-periods/${periodId}/lock`);
			toast.success("KPI period locked");
			await loadData();
		} finally {
			setBusyPeriodId(null);
		}
	};

	const resetDemo = async () => {
		setResetting(true);
		try {
			await api.post("/demo/reset");
			toast.success("Demo data reset");
			await loadData();
		} finally {
			setResetting(false);
		}
	};

	if (loading && !summary) {
		return <div className="grid gap-4 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-3xl bg-card animate-pulse" />)}</div>;
	}

	return (
		<div className="space-y-6">
			{confirmation ? (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm">
					<div className="w-full max-w-lg rounded-3xl border border-border/60 bg-background p-6 shadow-2xl">
						<p className="text-sm font-medium text-destructive">Confirmation required</p>
						<h3 className="mt-2 text-xl font-semibold">{confirmation.title}</h3>
						<p className="mt-2 text-sm text-muted-foreground">{confirmation.message}</p>
						<div className="mt-6 flex flex-wrap justify-end gap-2">
							<Button variant="secondary" onClick={closeConfirmation}>Cancel</Button>
							<Button onClick={runConfirmedAction} className={confirmation.type.startsWith("delete") ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}>{confirmation.confirmLabel}</Button>
						</div>
					</div>
				</div>
			) : null}

			<Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-background to-cyan-500/10">
				<CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
					<div>
						<p className="text-sm text-muted-foreground">{t("pages.admin.overview")}</p>
						<h2 className="text-2xl font-semibold">{t("pages.admin.title")}</h2>
						<p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("pages.admin.description")}</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge variant="secondary">{departments.length} {t("pages.admin.departments")}</Badge>
						<Badge variant="secondary">{employees.length} {t("pages.admin.employees")}</Badge>
						<Badge variant="secondary">{lockedPeriods.length} {t("pages.admin.locked")}</Badge>
						<Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15">{t("pages.admin.protected_data")}</Badge>
					</div>
				</CardContent>
			</Card>

			<div className="grid gap-6 xl:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>{departmentEditingId ? "Edit department" : "Create department"}</CardTitle>
						<CardDescription>Manage department metadata for demo and reporting.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="grid gap-3 md:grid-cols-2" onSubmit={submitDepartment}>
							<Input value={departmentForm.name} onChange={(event) => setDepartmentForm((current) => ({ ...current, name: event.target.value }))} placeholder="Department name" />
							<Input value={departmentForm.code} onChange={(event) => setDepartmentForm((current) => ({ ...current, code: event.target.value }))} placeholder="Code" />
							<Select value={departmentForm.managerId} onChange={(event) => setDepartmentForm((current) => ({ ...current, managerId: event.target.value }))} className="md:col-span-2">
								<option value="">Unassigned manager</option>
								{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName} ({employee.role})</option>)}
							</Select>
							<div className="flex flex-wrap gap-2 md:col-span-2">
								<Button type="submit" disabled={savingDepartment}>{savingDepartment ? "..." : departmentEditingId ? "Update department" : "Create department"}</Button>
								{departmentEditingId ? <Button type="button" variant="secondary" onClick={resetDepartmentForm}>Cancel</Button> : null}
							</div>
						</form>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{employeeEditingId ? "Edit employee" : "Create employee"}</CardTitle>
						<CardDescription>Maintain demo users with role-specific access.</CardDescription>
					</CardHeader>
					<CardContent>
						<form className="grid gap-3 md:grid-cols-2" onSubmit={submitEmployee}>
							<Input value={employeeForm.fullName} onChange={(event) => setEmployeeForm((current) => ({ ...current, fullName: event.target.value }))} placeholder="Full name" />
							<Input value={employeeForm.email} onChange={(event) => setEmployeeForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" />
							<Input value={employeeForm.password} type="password" onChange={(event) => setEmployeeForm((current) => ({ ...current, password: event.target.value }))} placeholder={employeeEditingId ? "Leave blank to keep password" : "Password"} />
							<Select value={employeeForm.role} onChange={(event) => setEmployeeForm((current) => ({ ...current, role: event.target.value }))}>
								<option value="Employee">Employee</option>
								<option value="Manager">Manager</option>
								<option value="Admin">Admin</option>
							</Select>
							<Select value={employeeForm.departmentId} onChange={(event) => setEmployeeForm((current) => ({ ...current, departmentId: event.target.value }))}>
								<option value="">Select department</option>
								{departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
							</Select>
							<Select value={employeeForm.managerId} onChange={(event) => setEmployeeForm((current) => ({ ...current, managerId: event.target.value }))}>
								<option value="">No manager</option>
								{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.fullName}</option>)}
							</Select>
							<div className="flex flex-wrap gap-2 md:col-span-2">
								<Button type="submit" disabled={savingEmployee}>{savingEmployee ? "..." : employeeEditingId ? "Update employee" : "Create employee"}</Button>
								{employeeEditingId ? <Button type="button" variant="secondary" onClick={resetEmployeeForm}>Cancel</Button> : null}
							</div>
						</form>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-4">
				{[
					{ label: t("pages.admin.employees"), value: employees.length },
					{ label: t("pages.admin.departments"), value: departments.length },
					{ label: t("pages.admin.kpi_periods"), value: periods.length },
					{ label: t("pages.admin.ranking"), value: rankings.length }
				].map((item) => (
					<Card key={item.label}>
						<CardHeader className="pb-2">
							<CardDescription>{item.label}</CardDescription>
							<CardTitle className="text-3xl">{item.value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</div>

			<div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
				<Card>
					<CardHeader>
						<CardTitle>{t("pages.admin.employees")}</CardTitle>
						<CardDescription>View, edit and delete employee records.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid gap-3 md:grid-cols-[1fr_auto] mb-4">
							<Input value={employeeQuery} onChange={(event) => { setEmployeeQuery(event.target.value); setEmployeePage(1); }} placeholder="Search employees, departments, roles..." />
							<div className="flex items-center gap-2 justify-end">
								<Button size="sm" variant="secondary" onClick={() => goToEmployeePage(employeePage - 1)} disabled={employeePage <= 1}>Prev</Button>
								<span className="text-sm text-muted-foreground">{employeePage} / {employeePageCount}</span>
								<Button size="sm" variant="secondary" onClick={() => goToEmployeePage(employeePage + 1)} disabled={employeePage >= employeePageCount}>Next</Button>
							</div>
						</div>
						{visibleEmployees.map((employee) => (
							<div key={employee.id} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
								<div>
									<p className="font-medium">{employee.fullName}</p>
									<p className="text-sm text-muted-foreground">{employee.email}</p>
								</div>
								<div className="text-right text-sm text-muted-foreground">
									<p>{employee.departmentName}</p>
									<p>{employee.role}</p>
									<div className="mt-2 flex gap-2 justify-end">
										<Button size="sm" variant="secondary" onClick={() => editEmployee(employee)}>Edit</Button>
										<Button size="sm" variant="ghost" onClick={() => removeEmployee(employee.id)}>Delete</Button>
									</div>
								</div>
							</div>
						))}
						{!visibleEmployees.length ? <p className="text-sm text-muted-foreground">{t("pages.admin.no_employees")}</p> : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("pages.admin.departments")}</CardTitle>
						<CardDescription>View, edit and delete department records.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="grid gap-3 md:grid-cols-[1fr_auto] mb-4">
							<Input value={departmentQuery} onChange={(event) => { setDepartmentQuery(event.target.value); setDepartmentPage(1); }} placeholder="Search departments, code or manager..." />
							<div className="flex items-center gap-2 justify-end">
								<Button size="sm" variant="secondary" onClick={() => goToDepartmentPage(departmentPage - 1)} disabled={departmentPage <= 1}>Prev</Button>
								<span className="text-sm text-muted-foreground">{departmentPage} / {departmentPageCount}</span>
								<Button size="sm" variant="secondary" onClick={() => goToDepartmentPage(departmentPage + 1)} disabled={departmentPage >= departmentPageCount}>Next</Button>
							</div>
						</div>
						{visibleDepartments.map((department) => (
							<div key={department.id} className="rounded-2xl border border-border/60 p-4">
								<div className="flex items-center justify-between">
									<div>
										<p className="font-medium">{department.name}</p>
										<p className="text-sm text-muted-foreground">{department.code}</p>
										<p className="text-xs text-muted-foreground">Manager: {department.managerName}</p>
									</div>
									<div className="flex items-center gap-2">
										<Badge variant="secondary">{department.employeeCount ?? department.headcount ?? 0}</Badge>
										<Button size="sm" variant="secondary" onClick={() => editDepartment(department)}>Edit</Button>
										<Button size="sm" variant="ghost" onClick={() => removeDepartment(department.id)}>Delete</Button>
									</div>
								</div>
							</div>
						))}
						{!visibleDepartments.length ? <p className="text-sm text-muted-foreground">{t("pages.admin.no_departments")}</p> : null}
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
				<Card>
					<CardHeader>
						<CardTitle>{t("pages.admin.kpi_periods")}</CardTitle>
						<CardDescription>{t("pages.admin.period_status")}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{periods.map((period) => (
							<div key={period.id} className="rounded-2xl border border-border/60 p-4">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="font-medium">{period.label}</p>
										<p className="text-sm text-muted-foreground">{period.startDate} - {period.endDate}</p>
									</div>
									<Badge variant={period.status === "locked" ? "secondary" : "outline"}>{t(`pages.admin.${period.status}`) || period.status}</Badge>
								</div>
								<div className="mt-3 flex items-center justify-between">
									<p className="text-sm text-muted-foreground">Weight: {period.weight}%</p>
									<Button disabled={busyPeriodId === period.id || period.status === "locked"} onClick={() => lockPeriod(period.id)}>{busyPeriodId === period.id ? "..." : t("pages.admin.lock_period")}</Button>
								</div>
							</div>
						))}
						{!periods.length ? <p className="text-sm text-muted-foreground">{t("pages.admin.no_periods")}</p> : null}
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>{t("pages.admin.ranking")}</CardTitle>
						<CardDescription>Active period KPI leaderboard</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3">
						{rankings.slice(0, 8).map((item) => (
							<div key={item.userId} className="flex items-center justify-between rounded-2xl border border-border/60 p-4">
								<div>
									<p className="font-medium">#{item.rank} {item.fullName}</p>
									<p className="text-sm text-muted-foreground">{item.departmentName}</p>
								</div>
								<Badge>{item.finalScore}</Badge>
							</div>
						))}
						{!rankings.length ? <p className="text-sm text-muted-foreground">{t("pages.admin.no_ranking")}</p> : null}
						<div className="flex justify-end pt-2">
							<Button variant="secondary" onClick={resetDemo} disabled={resetting}>{resetting ? "..." : t("pages.admin.reset_demo")}</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
};