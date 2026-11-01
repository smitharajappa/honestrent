# Leasing office call sheet

Use a made-up name. Never give an SSN, ID or real credit details. Ask each question the same
way at every building and write down the exact answer and the date.

## Questions

1. What is the application fee, and is it per adult?
2. Is there an administrative or lease fee? How much?
3. What is the security deposit? Is it different for someone with no US credit history?
4. Do you accept an applicant with no SSN (ITIN, passport only)?
5. Do you accept a guarantor or lease guarantor company? Which ones, by name?
6. What do you need as proof of income (offer letter, I-20 and bank statements)?
7. Do you accept an international credit report (for example Nova Credit)?
8. Are the monthly fees on your website the full list (technology, trash, pest, valet)?

## Who to call

| Community                     | City       | Phone        |
| ----------------------------- | ---------- | ------------ |
| Cutters Point Apartment Homes | Richardson | 945-203-5392 |
| Camden Buckingham             | Richardson | 469-772-8909 |
| Camden Legacy Park            | Plano      | 469-649-7776 |
| Camden Legacy Creek           | Plano      | 469-717-4407 |
| Maya at White Rock            | Dallas     | 254-282-5811 |

## Entering the answers (Supabase SQL editor)

Only fill what was confirmed; leave the rest out (it stays "ask the leasing office").

```sql
update public.buildings set
  application_fee_usd = 50,
  admin_fee_usd = 150,
  security_deposit_usd = 300,
  deposit_no_credit_usd = 600,
  guarantor_companies = array['Name of company'],
  terms_verified_on = '2026-11-02'
where name = 'Camden Legacy Creek';
```

Approval answers (questions 4, 5, 7) go in `approval_known`, `accepts_no_ssn`,
`accepts_guarantor`, `accepts_international_credit`, `min_income_multiple`, `min_credit_score`
the same way, then set `approval_known = true`. Ask the team to review them first.
