# Passes and the demo checkout

## Strategy (roommates and passes)

|                                                      | Free              | With a Tour, Apply or Move-in pass |
| ---------------------------------------------------- | ----------------- | ---------------------------------- |
| Make a roommate profile                              | yes               |                                    |
| See how many people are in your city                 | yes               |                                    |
| See matches and percentages, ask for an introduction |                   | yes                                |
| Answer an introduction someone sent you              | yes               |                                    |
| Chat after you both accept                           | yes (both people) |                                    |

- Browse (7 days) does not include roommates. Finding someone to sign with takes about two
  weeks, so Tour (14 days, "Most popular") is the entry pass for it. No new pass was added.
- Free profiles keep supply growing. Free answering and chatting means a paying person never
  hits a wall on the other side.
- Test it before building more: the waitlist stays on the Plus page. PRD kill rule: if under 5%
  of renters who see the offer join the waitlist, drop the pass.

## The demo checkout (no real payment)

`/plus/checkout?pass=tour` shows Review, Pay and Done. It shows a made-up test card
(4242 4242 4242 4242) that can't be edited, and never reads real card details. "Pay" calls the
database function `buy_demo_pass()`, which adds a pass to the signed-in account with source
`demo`. Passes stack: a new one starts when the running one ends. Limits: 5 demo purchases a
day per person.

Where the pass shows: the profile menu ("My pass", days left), the Account page, the Plus page.

While `NEXT_PUBLIC_DEMO_MODE` is on (the default), every signed-in renter gets Plus features
free anyway. To see the passes control access, run with `NEXT_PUBLIC_DEMO_MODE=off`.

## Switching to real payments later (Stripe)

Needs your approval (new service), a tax check and a lawyer's look. Then:

1. Turn the demo off: `update public.app_settings set value = 'off' where key = 'demo_payments';`
   (or drop `buy_demo_pass`). From then on the demo "Pay" button fails with a clear message.
2. Replace the "Pay" step with a Stripe Checkout page. Keep Review and Done as they are.
3. A Stripe webhook (server only) inserts the pass with source `stripe`. Never trust the
   browser for this. `plus_passes` still has no insert policy for renters.
4. Keep "One payment, no auto-renew" wording, and add a receipt email and a refund rule.

## Chat checks (no new service)

The app and the database both refuse links, emails, phone numbers, payment apps, chat apps
(WhatsApp, Telegram, WeChat, Snapchat, Instagram), look-alike tricks ("z e l l e", "d0t com",
"name at gmail"), and, in the app, common scam wording ("send the deposit first", "I'm abroad",
cashier's check). The same message can't be sent again within the last 3. Introduction
requests: 10 an hour per person. Email alerts for new matches are not built: they need an email
service (ask first).
