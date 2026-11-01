# Roommates (first version)

## What renters can do

1. Sign in (required, free; no password).
2. Create a profile: nickname, city, budget, move-in date, languages, interests, sleep,
   cleaning, guests, smoking, pets, study habits and a short note.
3. See people in the same city, best fit first, with reasons ("Both night owls", "Budgets
   within $10"). Seeing matches and asking for an introduction is a Swelt Plus feature (free for
   signed-in renters during demo mode).
4. Ask for an introduction. The other person accepts or declines. **Chat opens only after both
   accept.**
5. Chat about renting a place together. Report or block anyone from inside the chat.

## Rules the system enforces (in the database, not only the page)

- Other renters never see your account id or email, only the profile fields above.
- A renter cannot set their own verified date, create a profile for someone else, accept their
  own request, read someone else's chat, or message someone who blocked them.
- Messages: 1 to 500 characters, no links, email addresses, phone numbers or payment words
  (Zelle, Venmo, wire, gift card, crypto...), 40 messages an hour. The page checks the same
  rules first so the renter gets a clear message.
- Deleting an account removes the profile, introductions and chats with it.

## What we deliberately do not have

- No field, filter or ranking for race, ethnicity, religion, nationality, sex, family status or
  disability. Matching uses habits, budget, move-in date, languages and interests only. Free text
  that rules people out by who they are is rejected. If you ever want a "background" field, get
  fair housing advice first.
- No ID scan is ever stored.

## Verified tag (for now)

Only the team can set it, and only on sample profiles for the demo. To mark a real person after
you have checked them yourself (SQL editor):

```sql
update public.roommate_profiles set verified_at = now() where nickname = 'Name' and not demo;
```

Later an ID-check vendor (a new service: ask first) would set it and send back only
"verified" and a date.

## Sample profiles

`supabase/seed-roommates-demo.sql` adds 8 made-up people in Richardson, Plano and Dallas, labelled
"Sample profile", some with the verified tag. Introductions to them are refused with a clear
message. The "Load data into Supabase" workflow loads them.

## Reports

```sql
select r.created_at, a.nickname as reporter, b.nickname as reported, r.reason, r.note
from public.roommate_reports r
join public.roommate_profiles a on a.id = r.reporter
join public.roommate_profiles b on b.id = r.reported
order by r.created_at desc;
```

Remove a profile: `delete from public.roommate_profiles where nickname = 'Name' and not demo;`

## Not built yet

ID-check vendor, stronger chat moderation (an AI check would be a new service), email alerts for
new matches, photos.
