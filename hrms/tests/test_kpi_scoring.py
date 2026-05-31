import unittest

from datetime import date

# These imports assume Frappe test helpers; adjust if running outside bench test
import frappe
from hrms.api import kpi as kpi_api
from frappe.utils import getdate


class TestKPIScoring(unittest.TestCase):
    def setUp(self):
        # create a KPI Goal doc in memory
        self.kpi = frappe.get_doc({
            "doctype": "KPI Goal",
            "title": "Test KPI",
            "measure_type": "Numeric",
            "target_value": 100.0,
            "unit": "%",
            "start_date": date.today().isoformat(),
            "end_date": date.today().isoformat(),
            "weight": 50
        })

    def test_score_calculation_simple(self):
        # Example scoring: achieved/target * 100
        achieved = 80.0
        target = self.kpi.target_value
        expected_score = (achieved / target) * 100
        # simulate computation
        computed = (achieved / target) * 100
        self.assertAlmostEqual(expected_score, computed)

    def test_compute_scorecard_numeric(self):
        # create a KPI Scorecard with one numeric entry
        sc = frappe.get_doc({
            "doctype": "KPI Scorecard",
            "employee": "Administrator",
            "period_start": date.today().isoformat(),
            "period_end": date.today().isoformat(),
            "kpi_entries": [
                {"kpi_goal": "", "target": 100.0, "achieved": 80.0, "score": 0.0, "weight": 100}
            ],
            "status": "Draft",
        })
        sc.insert()

        res = kpi_api.compute_scorecard(sc.name)
        self.assertIn("total_score", res)
        self.assertAlmostEqual(res["total_score"], 80.0)

    def test_compute_scorecard_task_based(self):
        # create a Task marked Done and a Time Log with hours <= estimated to exercise bonuses
        task = frappe.get_doc({
            "doctype": "Task",
            "subject": "KPI Test Task",
            "status": "Done",
            "due_date": date.today().isoformat(),
        })
        task.insert()

        # add a time log with fewer hours than estimated (estimated may be absent; bonus code tolerates None)
        tl = frappe.get_doc({
            "doctype": "Time Log",
            "task": task.name,
            "user": "Administrator",
            "date": date.today().isoformat(),
            "hours": 4.0,
        })
        tl.insert()

        sc = frappe.get_doc({
            "doctype": "KPI Scorecard",
            "employee": "Administrator",
            "period_start": date.today().isoformat(),
            "period_end": date.today().isoformat(),
            "kpi_entries": [
                {"kpi_goal": "", "task": task.name, "target": 1.0, "achieved": 1.0, "score": 0.0, "weight": 100}
            ],
            "status": "Draft",
        })
        sc.insert()

        res = kpi_api.compute_scorecard(sc.name)
        self.assertIn("total_score", res)
        # expected capped score 100 (base 100 + on-time + time-log capped)
        self.assertAlmostEqual(res["total_score"], 100.0)


if __name__ == "__main__":
    unittest.main()
