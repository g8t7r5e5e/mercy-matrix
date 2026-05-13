# Mercy Matrix

## Backend Migration Status

- Supabase Auth is connected when environment variables are configured.
- If Supabase environment variables are missing, the app keeps the existing local/demo authentication fallback.
- Project, dashboard, donor, volunteer, and other app data still use mock/local data until a later migration phase.

## Supabase Auth Environment Variables

Create a local `.env` file when you want to use Supabase Auth locally:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not commit real `.env` values or service-role keys. If either variable is missing, the app keeps the demo/local auth fallback working and logs a browser console warning.

## Demo Login Accounts

The login page keeps the quick demo credentials visible for local development and Supabase Auth testing:

- `admin@welfareos.org`
- `head@welfareos.org`
- `member@welfareos.org`
- `user@welfareos.org`
- Password for all: `password123`
