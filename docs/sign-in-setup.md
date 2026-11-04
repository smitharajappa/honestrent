# Sign-in and Honest Rent Plus: setup

Sign-in uses Supabase Auth (the same Supabase project). It is optional for renters.

## Check your settings any time

```bash
npm run check:auth
```

It reads your project's public sign-in settings and tells you what to fix (it never sends an email
or prints your key). Add a site address to check another one: `npm run check:auth -- https://my-site.vercel.app`.

## One-time setup in Supabase (about 10 minutes)

1. **Authentication, URL Configuration**
   - Site URL: your live address (for example `https://honestrent.vercel.app`).
   - Redirect URLs (add each): `http://localhost:3000/auth/callback`,
     `https://honestrent.vercel.app/auth/callback`, and your Vercel preview address ending in
     `/auth/callback`.
2. **Authentication, Providers, Email**: leave on. This is the "email me a sign-in link" button.
   No password is stored. Supabase's built-in email sender is limited to a few emails an hour,
   fine for testing. For real use, add a custom email sender (a new service, so ask first).
3. **Google (optional)**: in Google Cloud, create an OAuth client (Web). Authorised redirect URI:
   `https://<your-project-ref>.supabase.co/auth/v1/callback`. Paste its Client ID and Secret
   into Supabase, Authentication, Providers, Google. Until then the Google button shows
   "Google sign-in isn't switched on yet. Use the email link instead."
4. Run the migration `20261109000000_plus_accounts.sql` (the Supabase workflow does this after
   merge).

## What is free and what needs a pass

- Free, no account: search, real cost, fees, approval fit, building pages, maps, nearby places,
  drive times to UT Dallas.
- Needs sign-in plus a pass: drive times to up to 5 places you add.
- While the site is in demo mode (`NEXT_PUBLIC_DEMO_MODE` not set to `off`), signed-in renters get
  Plus features free. Set it to `off` when real data and payments go live.
- Passes can't be bought yet. The waitlist at `/plus` measures demand first.

## Give someone a pass (SQL editor)

```sql
insert into public.plus_passes (user_id, pass, ends_at)
select id, 'tour', now() + interval '14 days' from auth.users where email = 'name@example.com';
```

## Read the demand test

```sql
select * from public.plus_daily_counts order by day;      -- people who saw /plus, and joins
select pass, count(*) from public.plus_waitlist group by pass order by 2 desc;
```

Kill criterion 4 in `prd.md`: fewer than 5% joining means we drop the pass. Joins divided by
views is the number to watch.

## Privacy

Signing in is optional and uses an email address only. Approval answers still stay in the
browser tab and are never tied to an account. The session lives in the browser; our server
checks the sign-in token and reads only that person's own passes.

## If the app shows "Invalid API key" on your computer

The key in `.env.local` is wrong, or from a different Supabase project. Run:

```bash
npm run check:env
```

It never prints your key. It says what is wrong (quote marks, a space, the secret key by mistake,
or a key that Supabase rejects). Copy the **Publishable** key again from Supabase, Project
Settings, API Keys, from the same project as the URL. Then stop the app (Ctrl+C) and start it
again with `npm run dev`: the file is only read when the app starts. Sign-in uses the same two
values, so it will not work until this passes.
