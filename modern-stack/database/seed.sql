INSERT INTO roles (id, name) VALUES
  (1, 'Admin'),
  (2, 'Manager'),
  (3, 'Employee')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (id, role_id, full_name, email, password_hash, is_active) VALUES
  (1, 1, 'System Admin', 'admin@hrms.local', 'admin123', 1),
  (2, 2, 'Team Manager', 'manager@hrms.local', 'manager123', 1),
  (3, 3, 'Nguyen Van A', 'employee@hrms.local', 'employee123', 1)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name), email = VALUES(email), password_hash = VALUES(password_hash), is_active = VALUES(is_active);

INSERT INTO tasks (id, assigned_by, assigned_to, title, description, priority, status, due_date, progress, estimated_hours, actual_hours) VALUES
  (1, 2, 3, 'Chuẩn bị báo cáo KPI tháng', 'Tổng hợp số liệu, so sánh tiến độ và đề xuất cải thiện.', 'High', 'In Progress', '2026-05-30', 65, 10, 6),
  (2, 2, 3, 'Rà soát task quá hạn', 'Kiểm tra các công việc chậm tiến độ của team.', 'Urgent', 'Open', '2026-05-24', 20, 4, 1)
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), status = VALUES(status), progress = VALUES(progress);

INSERT INTO kpi_records (id, user_id, cycle_label, productivity_score, quality_score, timeliness_score, final_score, remarks) VALUES
  (1, 3, 'Q2 2026', 82, 88, 79, 83, 'Ổn định, cần cải thiện deadline.')
ON DUPLICATE KEY UPDATE cycle_label = VALUES(cycle_label), final_score = VALUES(final_score), remarks = VALUES(remarks);

INSERT INTO notifications (id, user_id, type, title, message, is_read) VALUES
  (1, 3, 'task_assigned', 'Task mới đã được giao', 'Bạn nhận 1 task KPI cần xử lý hôm nay.', 0),
  (2, 2, 'kpi_alert', 'KPI team giảm', 'Điểm KPI trung bình tuần này giảm 4% so với tuần trước.', 0)
ON DUPLICATE KEY UPDATE title = VALUES(title), message = VALUES(message), is_read = VALUES(is_read);

INSERT INTO leave_requests (id, user_id, leave_type, start_date, end_date, reason, status) VALUES
  (1, 3, 'Annual Leave', '2026-05-24', '2026-05-26', 'Family matter', 'Pending'),
  (2, 3, 'Sick Leave', '2026-05-16', '2026-05-16', 'Medical checkup', 'Approved')
ON DUPLICATE KEY UPDATE leave_type = VALUES(leave_type), start_date = VALUES(start_date), end_date = VALUES(end_date), reason = VALUES(reason), status = VALUES(status);

INSERT INTO attendance_checkins (id, user_id, check_in_at, status, note) VALUES
  (1, 3, '2026-05-22 08:03:00', 'On time', 'GPS matched'),
  (2, 3, '2026-05-21 08:17:00', 'Late', 'Traffic delay')
ON DUPLICATE KEY UPDATE check_in_at = VALUES(check_in_at), status = VALUES(status), note = VALUES(note);

INSERT INTO shift_assignments (id, title, assignee_name, assignee_role, status, shift_date) VALUES
  (1, 'Morning shift', 'Nguyen Van A', 'Employee', 'Assigned', '2026-05-22'),
  (2, 'Weekend shift', 'Team Pool', 'Employee', 'Pending', '2026-05-25')
ON DUPLICATE KEY UPDATE title = VALUES(title), assignee_name = VALUES(assignee_name), status = VALUES(status), shift_date = VALUES(shift_date);

INSERT INTO expense_claims (id, user_id, title, amount, status) VALUES
  (1, 3, 'Client transport', 420000, 'Submitted'),
  (2, 3, 'Team lunch', 760000, 'Approved')
ON DUPLICATE KEY UPDATE title = VALUES(title), amount = VALUES(amount), status = VALUES(status);

INSERT INTO employee_advances (id, user_id, purpose, amount, status) VALUES
  (1, 3, 'Field trip', 1500000, 'Pending'),
  (2, 3, 'Project materials', 800000, 'Approved')
ON DUPLICATE KEY UPDATE purpose = VALUES(purpose), amount = VALUES(amount), status = VALUES(status);

INSERT INTO salary_slips (id, user_id, period_label, gross_amount, net_amount, status) VALUES
  (1, 3, 'May 2026', 18000000, 15200000, 'Processed'),
  (2, 3, 'Apr 2026', 18000000, 14950000, 'Processed')
ON DUPLICATE KEY UPDATE period_label = VALUES(period_label), gross_amount = VALUES(gross_amount), net_amount = VALUES(net_amount), status = VALUES(status);

INSERT INTO user_settings (user_id, theme, notifications_enabled, default_dashboard) VALUES
  (1, 'light', 1, 'role-based'),
  (2, 'light', 1, 'role-based'),
  (3, 'light', 1, 'role-based')
ON DUPLICATE KEY UPDATE theme = VALUES(theme), notifications_enabled = VALUES(notifications_enabled), default_dashboard = VALUES(default_dashboard);