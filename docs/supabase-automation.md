# Updating Supabase automatically

Three GitHub Actions do the work. You add **one secret** once.

| Workflow                | When it runs                                               | What it does                                        |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| Supabase migrations     | On its own when `supabase/migrations/**` changes on `main` | Applies new table and column changes                |
| Load data into Supabase | When you press "Run workflow"                              | Loads the real data files in the right order        |
| Refresh incident counts | 5th of every month, or by hand                             | Re-counts Dallas incidents and updates the database |

## One-time setup (about 5 minutes)

1. In Supabase: open your project, click **Connect** at the top, choose **Session pooler**,
   and copy the connection string (it starts with `postgresql://` and has `[YOUR-PASSWORD]`
   in it). Replace `[YOUR-PASSWORD]` with your database password. If you forgot it:
   Project Settings, Database, Reset database password.
2. In GitHub: your repo, **Settings**, **Secrets and variables**, **Actions**,
   **New repository secret**. Name: `SUPABASE_DB_URL`. Value: the string from step 1.
   Never put it in a file or in chat.
3. Because you already ran the existing migrations by hand, tell the tool once so it does not
   run them again: Actions tab, **Supabase migrations**, **Run workflow**, tick
   **baseline**, run. Check the log says each version is marked as applied.

After that, every new file in `supabase/migrations` is applied automatically when it is
merged to `main`. To load data: Actions tab, **Load data into Supabase**, **Run workflow**.

## Safety rules

- Migrations never run from a branch, only from `main`, and never two at once.
- The demo data (`seed.sql`) clears all buildings, so it only runs if you tick the box.
- Priced communities are deleted and re-inserted by name, so a building's id changes
  when you reload them. Leads saved for that building would no longer match it.
- The secret is the database password: only repo admins should see the Actions settings.
- A bad migration cannot be undone by the tool. Write a new migration to fix it.
