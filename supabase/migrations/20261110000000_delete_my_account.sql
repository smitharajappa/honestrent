-- Swelt: let a signed-in renter delete their own account.
-- Their sign-in record and their passes go with it (passes cascade). Waitlist emails are not
-- linked to accounts. A renter can only ever delete themselves: the function uses the
-- signed-in user's own id and nothing the caller passes in.

create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Not signed in';
  end if;
  delete from auth.users where id = me;
end;
$$;

revoke all on function public.delete_my_account() from public;
revoke all on function public.delete_my_account() from anon;
grant execute on function public.delete_my_account() to authenticated;
