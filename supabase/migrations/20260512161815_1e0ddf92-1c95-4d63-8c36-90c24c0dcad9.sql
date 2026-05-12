
-- Lock down trigger function (only the trigger should run it)
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Tighten support submissions: drop overly permissive policy, add validated one
drop policy if exists "anyone can submit support" on public.support_messages;
create policy "submit support with limits" on public.support_messages
for insert with check (
  length(coalesce(message,'')) between 5 and 4000
  and length(coalesce(subject,'')) <= 200
  and length(coalesce(email,'')) <= 320
);
