export const profileSummary = {
	title: "Employee profile",
	description: "Unified profile, status and access summary for demo roles.",
	items: [
		{ label: "Full name", value: "Nguyen Van A" },
		{ label: "Role", value: "Employee" },
		{ label: "Department", value: "Operations" },
		{ label: "Manager", value: "Team Manager" }
	]
};

export const leaveSummary = {
	title: "Leave management",
	description: "Requests, balance and approvals with the same workflow shape as legacy HRMS.",
	stats: [
		{ label: "Remaining annual leave", value: 10 },
		{ label: "Pending approvals", value: 2 },
		{ label: "Approved this month", value: 4 }
	],
	requests: [
		{ id: 1, type: "Annual Leave", dates: "24 May - 26 May", status: "Pending", reason: "Family matter" },
		{ id: 2, type: "Sick Leave", dates: "16 May", status: "Approved", reason: "Medical checkup" },
		{ id: 3, type: "Work from home", dates: "29 May", status: "Requested", reason: "Documentation sprint" }
	]
};

export const attendanceSummary = {
	title: "Attendance and shift flow",
	description: "Daily check-in, shift requests and assignment monitoring.",
	stats: [
		{ label: "On-time rate", value: "96%" },
		{ label: "Late check-ins", value: 3 },
		{ label: "Open shift requests", value: 5 }
	],
	checkins: [
		{ id: 1, date: "22 May", time: "08:03", status: "On time", note: "GPS matched" },
		{ id: 2, date: "21 May", time: "08:17", status: "Late", note: "Traffic delay" },
		{ id: 3, date: "20 May", time: "07:58", status: "On time", note: "Normal" }
	],
	shifts: [
		{ id: 1, title: "Morning shift", assignee: "Nguyen Van A", status: "Assigned" },
		{ id: 2, title: "Weekend shift", assignee: "Team Pool", status: "Pending" }
	]
};

export const expenseSummary = {
	title: "Expense claims",
	description: "Travel, meal and project expense flows ready for demo.",
	items: [
		{ id: 1, title: "Client transport", amount: 420000, status: "Submitted", owner: "Nguyen Van A" },
		{ id: 2, title: "Team lunch", amount: 760000, status: "Approved", owner: "Nguyen Van A" },
		{ id: 3, title: "Stationery", amount: 120000, status: "Paid", owner: "Nguyen Van A" }
	]
};

export const advanceSummary = {
	title: "Employee advance",
	description: "Advance request and reimbursement overview.",
	items: [
		{ id: 1, purpose: "Field trip", amount: 1500000, status: "Pending" },
		{ id: 2, purpose: "Project materials", amount: 800000, status: "Approved" }
	]
};

export const salarySummary = {
	title: "Salary slip",
	description: "Readable salary statement for demo and explanation.",
	slips: [
		{ id: 1, period: "May 2026", gross: 18000000, net: 15200000, status: "Processed" },
		{ id: 2, period: "Apr 2026", gross: 18000000, net: 14950000, status: "Processed" }
	]
};

export const settingsSummary = {
	title: "App settings",
	description: "Theme, notifications and productivity preferences.",
	items: [
		{ label: "Theme", value: "Dark / Light" },
		{ label: "Notifications", value: "Realtime enabled" },
		{ label: "Default dashboard", value: "Role-based" }
	]
};

export const moduleCatalog = {
	Admin: [
		"Dashboard", "Admin Center", "Tasks", "KPI", "Leave", "Attendance", "Expense Claim", "Employee Advance", "Salary Slip", "Profile", "App Settings", "Notifications", "AI Assistant", "Reports"
	],
	Manager: [
		"Dashboard", "Tasks", "KPI", "Leave", "Attendance", "Expense Claim", "Salary Slip", "Profile", "Notifications", "AI Assistant", "Reports"
	],
	Employee: [
		"Dashboard", "Tasks", "KPI", "Leave", "Attendance", "Expense Claim", "Employee Advance", "Salary Slip", "Profile", "Notifications", "AI Assistant"
	]
};