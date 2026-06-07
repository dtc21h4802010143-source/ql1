import unittest
from types import SimpleNamespace


import sys
import types

# Provide a minimal fake `frappe` package so `hrms.api.kpi` can be imported outside bench
fake_frappe = types.ModuleType("frappe")
utils_mod = types.ModuleType("frappe.utils")
def _fake_getdate(x=None):
    from datetime import date
    return date.today()
utils_mod.getdate = _fake_getdate
utils_mod.nowdate = lambda: _fake_getdate()
fake_frappe.utils = utils_mod
sys.modules["frappe"] = fake_frappe
sys.modules["frappe.utils"] = utils_mod

import importlib
kpi_api = importlib.import_module("hrms.api.kpi")


class FakeFrappe:
    def __init__(self):
        pass

    def get_doc(self, doctype, name=None):
        # Return fake docs per doctype
        if doctype == "KPI Scorecard":
            entry = SimpleNamespace(kpi_goal="", task="TASK-1", target=1.0, achieved=1.0, score=0.0, weight=100)
            sc = SimpleNamespace(name="SC-1", kpi_entries=[entry], total_score=0.0)

            def save():
                sc.total_score = sc.total_score

            sc.save = save
            return sc

        if doctype == "Task":
            # Completed on time, estimated hours 5, actual 4 returned by get_all Time Log
            task = SimpleNamespace(name="TASK-1", status="Done", due_date="2026-06-01", modified="2026-06-01", estimated_hours=5.0)
            return task

        raise Exception(f"Unexpected doctype {doctype}")

    def get_all(self, doctype, filters=None, fields=None):
        if doctype == "Time Log":
            return [{"hours": 4.0}]
        return []


class TestKPIScoringMock(unittest.TestCase):
    def test_compute_scorecard_mocked(self):
        # Inject fake frappe into module
        original_frappe = kpi_api.frappe
        try:
            kpi_api.frappe = FakeFrappe()
            res = kpi_api.compute_scorecard("SC-1")
            self.assertIn("total_score", res)
            self.assertAlmostEqual(res["total_score"], 100.0)
        finally:
            kpi_api.frappe = original_frappe


if __name__ == "__main__":
    unittest.main()
