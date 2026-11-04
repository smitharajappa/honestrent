# Renaming to Honest Rent: what is outside the code

The code, pages, docs and scripts now say **Honest Rent**. These places also carry the old name
and only you can change them. Do them in this order, and read the warning on the first one.

1. **Done: the live address is now `honestrent.vercel.app` (`swelt.vercel.app` still works).** Sign-in links, Supabase's allowed
   addresses and the Google sign-in setup all point at that address. Rename the Vercel project
   or add a new domain only when you are ready to repeat `docs/sign-in-setup.md` (Site URL and
   Redirect URLs in Supabase, then `npm run check:auth`). Until then people simply see the new
   name on the old address.
2. **A real domain.** Searches on 4 Nov 2026 found `honestrent.app` free and `honestrent.com`
   taken. Buy the one you want, add it in Vercel (Settings, Domains), then update Supabase's Site
   URL and Redirect URLs to the new address.
3. **Vercel project name:** Settings, General. Optional. Renaming changes the `*.vercel.app` address.
4. **GitHub repository name** (`smitharajappa/swelt`): Settings, General. GitHub redirects old links,
   but update your local copy's remote afterwards: `git remote set-url origin <new address>`.
5. **Supabase:** project name (Settings, General) and the email templates (Authentication, Email
   Templates) if they mention the old name. The sign-in email's sender name is set under
   Authentication, SMTP, once you add your own email sender.
6. **Google sign-in** (when you set it up): the consent screen app name should be Honest Rent.
7. **Trademark.** Before you spend money on the name, search it at uspto.gov (Trademark Search)
   for "Honest Rent" and similar names in housing or software. We found no business with the name in
   a web search, but that is not a trademark clearance.
8. **Saved items on test devices.** The app reads anything saved under the old name once, so
   testers keep their saved apartments and places.

## Left unchanged on purpose

- Old database migration files still say "Swelt" in their comments. They have already been
  applied, and changing the file would only confuse the history.
