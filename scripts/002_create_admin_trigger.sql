-- Auto-create admin profile when admin user signs up with metadata
create or replace function public.handle_new_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only create admin profile if user metadata indicates admin
  if new.raw_user_meta_data->>'is_admin' = 'true' then
    insert into public.admins (id, email)
    values (new.id, new.email)
    on conflict (id) do nothing;
  end if;
  
  return new;
end;
$$;

drop trigger if exists on_auth_admin_created on auth.users;

create trigger on_auth_admin_created
  after insert on auth.users
  for each row
  execute function public.handle_new_admin();
