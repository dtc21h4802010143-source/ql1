__version__ = "17.0.0-dev"

try:
	import frappe
except ModuleNotFoundError:
	frappe = None


def refetch_resource(cache_key: str | list, user=None):
	if frappe is None:
		return

	frappe.publish_realtime(
		"hrms:refetch_resource",
		{"cache_key": cache_key},
		user=user or frappe.session.user,
		after_commit=True,
	)
