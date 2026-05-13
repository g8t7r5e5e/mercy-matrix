# Mercy Matrix

## Backend Migration Status

- Supabase Auth is connected when environment variables are configured.
- Supabase Projects and the dashboard are connected when the same environment variables are configured.
- If Supabase environment variables are missing, the app keeps the existing local/demo authentication and mock project fallback.
- Donations, blood donor matching, documents, chat expansion, and reporting are still future module phases unless a project-level placeholder action is shown.

## Supabase Environment Variables

Create a local `.env` file when you want to use Supabase locally:

```bash
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not commit real `.env` values or service-role keys. If either variable is missing, the app keeps the demo/local fallback working and logs a browser console warning.

## Testing Project Submission

1. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your local/StackBlitz environment.
2. Sign in with one of the Supabase Auth users that has a matching `public.profiles` row.
3. Open **Submit Project** from the topbar or dashboard.
4. Fill the required requester name, contact number, project title, and consent checkbox.
5. Submit the form.
6. Confirm the success screen shows a generated tracking code such as `WOS-108`.
7. Open **Projects** or the dashboard and confirm totals, pending approvals, activity, and notifications update.

## Demo Login Accounts

The login page keeps the quick demo credentials visible for local development and Supabase Auth testing:

- `admin@welfareos.org`
- `head@welfareos.org`
- `member@welfareos.org`
- `user@welfareos.org`
- Password for all: `password123`
