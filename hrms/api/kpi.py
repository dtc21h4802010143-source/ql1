import frappe
from frappe.utils import nowdate, getdate


@frappe.whitelist()
def get_kpis():
    """Return list of KPI Goal docs"""
    kpis = frappe.get_all("KPI Goal", fields=["name", "title", "owner", "measure_type", "target_value", "unit", "start_date", "end_date", "weight"])
    return kpis


@frappe.whitelist()
def create_scorecard(employee, period_start, period_end):
    """Create KPI Scorecard for an employee for a period and compute initial scores."""
    # gather relevant KPI Goals overlapping the period
    kpi_names = frappe.get_all("KPI Goal", filters={"start_date": ["<=", period_end], "end_date": [">=", period_start]}, fields=["name", "target_value", "weight"])

    scorecard = frappe.get_doc({
        "doctype": "KPI Scorecard",
        "employee": employee,
        "period_start": period_start,
        "period_end": period_end,
        "kpi_entries": [],
        "status": "Draft",
    })

    total_weight = 0.0
    total_score = 0.0

    for k in kpi_names:
        # default achieved = 0.0 (frontend or later processes should update)
        entry = frappe._dict({
            "kpi_goal": k.name,
            "target": k.target_value or 0.0,
            "achieved": 0.0,
            "score": 0.0,
            "weight": k.weight or 0.0,
        })
        scorecard.append("kpi_entries", entry)
        total_weight += entry.weight or 0.0

    # normalize weights if not summing to 100
    if total_weight and total_weight != 100.0:
        # leave as-is; final_score computation will use weights proportionally
        pass

    scorecard.insert()
    return scorecard.name


@frappe.whitelist()
def compute_scorecard(scorecard_name):
    """Compute total_score for a KPI Scorecard based on entries' achieved/target and weights."""
    sc = frappe.get_doc("KPI Scorecard", scorecard_name)
    total_weight = 0.0
    weighted_sum = 0.0
    def compute_entry_percent(entry):
        # Prefer task-linked scoring when a task is present
        percent = 0.0

        # If the entry references a Task (child KPI Entry supports 'task'), use task status and timings
        task_name = getattr(entry, "task", None)
        if task_name:
            try:
                task = frappe.get_doc("Task", task_name)
                # base percent = 100 if task is done, else proportional by achieved/target if provided
                if task.status == "Done":
                    percent = 100.0

                    # check due_date vs completion (use modified as fallback)
                    try:
                        due = getdate(task.due_date) if task.due_date else None
                        # use task.completion_date if available, else modified
                        comp = getdate(task.completion_date) if getattr(task, "completion_date", None) else getdate(task.modified)
                        if due and comp:
                            if comp <= due:
                                percent = min(100.0, percent + 5.0)  # on-time bonus
                            else:
                                percent = max(0.0, percent - 10.0)  # overdue penalty
                    except Exception:
                        # ignore date parsing errors
                        pass

                    # time log bonus: if actual_hours <= estimated_hours, small bonus
                    try:
                        estimated = float(task.estimated_hours or 0.0)
                        time_logs = frappe.get_all("Time Log", filters={"task": task.name}, fields=["hours"]) or []
                        actual_hours = sum([float(t.hours or 0.0) for t in time_logs])
                        if estimated and actual_hours and actual_hours <= estimated:
                            percent = min(100.0, percent + 5.0)
                    except Exception:
                        pass
                else:
                    # not done: try numeric achieved/target if provided
                    target = entry.target or 0.0
                    achieved = entry.achieved or 0.0
                    if target:
                        percent = (achieved / target) * 100.0
            except frappe.DoesNotExistError:
                # fallback to numeric
                target = entry.target or 0.0
                achieved = entry.achieved or 0.0
                if target:
                    percent = (achieved / target) * 100.0
        else:
            # numeric KPI
            target = entry.target or 0.0
            achieved = entry.achieved or 0.0
            if target:
                percent = (achieved / target) * 100.0

        # cap and floor
        if percent > 100.0:
            percent = 100.0
        if percent < 0.0:
            percent = 0.0

        return percent

    for entry in sc.kpi_entries:
        percent = compute_entry_percent(entry)
        entry.score = percent
        weight = entry.weight or 0.0
        weighted_sum += (percent * weight)
        total_weight += weight

    total_score = 0.0
    if total_weight:
        # weighted average normalized to 100
        total_score = weighted_sum / total_weight

    sc.total_score = total_score
    sc.save()
    return {"total_score": total_score}


def compute_scorecard_on_submit(doc, method=None):
    """Hook: compute scorecard when submitted/updated."""
    try:
        compute_scorecard(doc.name)
    except Exception:
        # avoid breaking submit flow
        frappe.log_error(frappe.get_traceback(), "compute_scorecard_on_submit")


def on_task_update(doc, method=None):
    """Hook: when a Task is updated, recompute any KPI Scorecards referencing it."""
    try:
        scorecards = frappe.get_all("KPI Scorecard", fields=["name"])
        for s in scorecards:
            sc = frappe.get_doc("KPI Scorecard", s.name)
            for entry in sc.kpi_entries:
                if getattr(entry, "task", None) == doc.name:
                    compute_scorecard(sc.name)
                    break
    except Exception:
        frappe.log_error(frappe.get_traceback(), "on_task_update")
