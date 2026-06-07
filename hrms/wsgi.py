from __future__ import annotations

from typing import Callable

try:
	import frappe  # type: ignore
except ModuleNotFoundError:
	frappe = None


def _fallback_application(environ, start_response):
	path = environ.get("PATH_INFO", "/")
	status = "200 OK"
	body = b"hrms service is running"
	content_type = "text/plain; charset=utf-8"

	if path == "/api/health":
		body = b'{"ok":true,"service":"hrms"}'
		content_type = "application/json"

	start_response(status, [("Content-Type", content_type), ("Content-Length", str(len(body)))])
	return [body]


application: Callable = _fallback_application
