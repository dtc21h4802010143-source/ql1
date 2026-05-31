import unittest
import sys
import types

# Minimal fake `frappe` and other modules to allow importing hrms.api.roster
fake_frappe = types.ModuleType("frappe")
fake_frappe._ = lambda s: s
class _Defaults:
    @staticmethod
    def get_user_default(key):
        if key == "Company":
            return "_Test Company"
        return None
fake_frappe.defaults = _Defaults()

# minimal qb placeholder used nowhere in these tests
fake_frappe.qb = types.SimpleNamespace(DocType=lambda name: None)

sys.modules["frappe"] = fake_frappe

# provide minimal frappe submodules used by hrms.api imports
frappe_model = types.ModuleType("frappe.model")
def get_permitted_fields(dt):
    return []
frappe_model.get_permitted_fields = get_permitted_fields
sys.modules["frappe.model"] = frappe_model

frappe_model_workflow = types.ModuleType("frappe.model.workflow")
def get_workflow_name(dt):
    return None
frappe_model_workflow.get_workflow_name = get_workflow_name
sys.modules["frappe.model.workflow"] = frappe_model_workflow

frappe_qb = types.ModuleType("frappe.query_builder")
class Order:
    pass
frappe_qb.Order = Order
sys.modules["frappe.query_builder"] = frappe_qb

frappe_utils = types.ModuleType("frappe.utils")
from datetime import datetime, date, timedelta
def add_days(d, n):
    from datetime import datetime
    try:
        return (datetime.fromisoformat(d) + timedelta(days=n)).date().isoformat()
    except Exception:
        return d
def date_diff(a, b):
    return 0
def getdate(x=None):
    return date.today()
def strip_html(s):
    return s
frappe_utils.add_days = add_days
frappe_utils.date_diff = date_diff
frappe_utils.getdate = getdate
frappe_utils.strip_html = strip_html
sys.modules["frappe.utils"] = frappe_utils

# simple whitelist decorator
def _whitelist(*a, **k):
    def _decorator(f):
        return f
    return _decorator
fake_frappe.whitelist = _whitelist

# fake erpnext helper
erp_employee_mod = types.ModuleType("erpnext.setup.doctype.employee.employee")
def get_holiday_list_for_employee(employee, raise_exception=False, as_on=None):
    return "Salary Slip Test Holiday List"
erp_employee_mod.get_holiday_list_for_employee = get_holiday_list_for_employee
sys.modules["erpnext.setup.doctype.employee.employee"] = erp_employee_mod

# fake hrms hr doctypes used by roster
sa_mod = types.ModuleType("hrms.hr.doctype.shift_assignment.shift_assignment")
class ShiftAssignment:
    pass
sa_mod.ShiftAssignment = ShiftAssignment
sys.modules["hrms.hr.doctype.shift_assignment.shift_assignment"] = sa_mod

sat_mod = types.ModuleType("hrms.hr.doctype.shift_assignment_tool.shift_assignment_tool")
def create_shift_assignment(*args, **kwargs):
    return None
sat_mod.create_shift_assignment = create_shift_assignment
sys.modules["hrms.hr.doctype.shift_assignment_tool.shift_assignment_tool"] = sat_mod

ss_mod = types.ModuleType("hrms.hr.doctype.shift_schedule.shift_schedule")
def get_or_insert_shift_schedule(*args, **kwargs):
    return "SS-1"
ss_mod.get_or_insert_shift_schedule = get_or_insert_shift_schedule
sys.modules["hrms.hr.doctype.shift_schedule.shift_schedule"] = ss_mod

# Now import the roster module
import importlib
roster = importlib.import_module("hrms.api.roster")

class TestRosterMock(unittest.TestCase):
    def test_group_by_employee(self):
        events = [
            {"employee": "E1", "start_date": "2026-06-01", "status": "A"},
            {"employee": "E2", "start_date": "2026-06-02", "status": "B"},
            {"employee": "E1", "start_date": "2026-06-03", "status": "C"},
        ]
        grouped = roster.group_by_employee(events)
        self.assertIn("E1", grouped)
        self.assertIn("E2", grouped)
        self.assertEqual(len(grouped["E1"]), 2)
        self.assertEqual(len(grouped["E2"]), 1)

    def test_get_default_company(self):
        # Should return from fake defaults
        comp = roster.get_default_company()
        self.assertEqual(comp, "_Test Company")

if __name__ == "__main__":
    unittest.main()
