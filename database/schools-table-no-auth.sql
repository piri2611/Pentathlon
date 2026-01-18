-- Simpler schools table that works without authentication
DROP TABLE IF EXISTS public.schools CASCADE;

create table if not exists public.schools (
  id bigserial primary key,

  -- data you store
  school_name text not null unique,
  login_at timestamptz not null default now(),      -- saved on "Next"
  pressed_at timestamptz,                           -- updated on buzzer press
  press_count bigint not null default 0,            -- optional but useful

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- indexes
create index if not exists idx_schools_school_name on public.schools(school_name);
create index if not exists idx_schools_pressed_at on public.schools(pressed_at);

-- TRIGGER: Auto-update pressed_at and press_count on buzzer press
create or replace function public.on_buzzer_press()
returns trigger as $$
begin
  -- If client is updating pressed_at, force it to NOW()
  if new.pressed_at is distinct from old.pressed_at then
    new.pressed_at = now();
    new.press_count = old.press_count + 1;
  end if;

  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_on_buzzer_press on public.schools;

create trigger trg_on_buzzer_press
before update on public.schools
for each row
execute function public.on_buzzer_press();

-- TRIGGER: Auto-update updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_set_updated_at on public.schools;

create trigger trg_set_updated_at
before update on public.schools
for each row
execute function public.set_updated_at();

-- DISABLE RLS - allow public inserts/updates (no authentication required)
alter table public.schools disable row level security;

-- VIEW: Get all schools ordered by press time (for leaderboard)
create or replace view public.schools_leaderboard as
select 
  id,
  school_name,
  login_at,
  pressed_at,
  press_count,
  created_at
from public.schools
where pressed_at is not null
order by pressed_at asc;
