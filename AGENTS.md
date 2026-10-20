# Development guidance

- Keep migration and hosting work on a separate branch until reviewed.
- Never force-push or rewrite published history.
- Never commit secrets, service-role keys, patient data, or production exports.
- Supabase client keys exposed to the browser must be publishable keys; authorization must be enforced with Row Level Security.
- Do not import demo data into production.
