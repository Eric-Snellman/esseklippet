-- Kör hela filen i Supabase: SQL Editor -> New query -> Run

create table public.bookings (
  id          uuid primary key default gen_random_uuid(),
  date        date not null,
  time        text not null check (time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  staff       text not null check (staff in ('Ciina','Kerstin')),
  service     text not null check (char_length(service) between 1 and 60),
  name        text not null check (char_length(name) between 1 and 100),
  phone       text not null check (char_length(phone) between 5 and 30),
  created_at  timestamptz not null default now(),
  unique (date, time, staff)          -- omöjligt att dubbelboka
);

alter table public.bookings enable row level security;

-- Vem som helst (anon) får SKAPA en bokning, men inte läsa några
create policy "anon kan boka" on public.bookings
  for insert to anon
  with check (date >= current_date);

-- Inloggade (ägarna) får läsa och avboka
create policy "admin läser" on public.bookings
  for select to authenticated using (true);
create policy "admin avbokar" on public.bookings
  for delete to authenticated using (true);

-- Publik funktion som ENDAST returnerar upptagna tider, inga kunduppgifter
create or replace function public.taken_slots(d date)
returns table (staff text, "time" text)
language sql security definer set search_path = public as $$
  select b.staff, b."time" from bookings b where b.date = d;
$$;
revoke all on function public.taken_slots(date) from public;
grant execute on function public.taken_slots(date) to anon, authenticated;
