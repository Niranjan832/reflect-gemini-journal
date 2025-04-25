
-- Create user_streaks table
create table if not exists public.user_streaks (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references auth.users(id),
    current_streak integer default 0,
    longest_streak integer default 0,
    last_entry_date date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table public.user_streaks enable row level security;

create policy "Users can view their own streak data."
  on public.user_streaks for select
  using ( auth.uid() = user_id );

create policy "Users can update their own streak data."
  on public.user_streaks for update
  using ( auth.uid() = user_id );

create policy "Users can insert their own streak data."
  on public.user_streaks for insert
  with check ( auth.uid() = user_id );

-- Create updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger handle_streaks_updated_at
  before update on public.user_streaks
  for each row
  execute procedure public.handle_updated_at();
