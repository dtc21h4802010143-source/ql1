HRMS
====

Minimal README to allow packaging.

Render deploy
-------------

This repo is ready to deploy from Git on Render with the root [render.yaml](render.yaml) blueprint.

The Render service builds both `modern-stack/backend` and `modern-stack/frontend`, then starts the backend. When the frontend build exists, the backend serves the static frontend bundle too, so you only need one Render web service.

Deployment steps:

1. Push this repo to GitHub, GitLab, or Bitbucket.
2. In Render, create a new Blueprint and point it at this repository.
3. Let Render use [render.yaml](render.yaml) to create the web service.
4. Deploy the branch.
5. Open the Render service URL; the backend health check is at `/api/health`.

Notes:

- If you want persistent data instead of the in-memory demo, set `DATABASE_URL` to a MySQL connection in Render.
- The app uses the built-in demo data when `DATABASE_URL` is empty.
