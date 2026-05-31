# Modern HRMS Stack

This folder contains a lightweight migration layer that preserves the current HRMS business workflow while providing a new Node + React implementation path.

## Local development

1. Install root dependencies.
2. Run `npm run dev` from the repository root.
3. If you want MySQL-backed demo data, create the schema from `modern-stack/database/schema.sql` and load `modern-stack/database/seed.sql` once.

The modern stack runs independently from the legacy Frappe modules so the existing roles and workflow can stay intact while the new UI and APIs are introduced gradually.