-- ماکسیکار: زیرساخت پایدار و امن بازگشت وجه
-- اجرا فقط روی پروژه Supabase آزمایشی؛ این migration خودش هیچ پرداختی انجام نمی‌دهد.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  external_order_id text unique,
  total_toman bigint not null check (total_toman >= 0),
  status text not null check (status in ('pending','paid','cancelled','refunded','partially_refunded')),
  cashback_eligible boolean not null default false,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_cashback_customer_paid_idx
  on public.orders(customer_id, paid_at) where status = 'paid' and cashback_eligible = true;

create table if not exists public.cashback_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete restrict,
  period_month date not null,
  eligible_purchase_toman bigint not null check (eligible_purchase_toman >= 0),
  rate_percent integer not null check (rate_percent in (0,5,10,15)),
  amount_toman bigint not null check (amount_toman >= 0),
  status text not null default 'pending' check (status in ('pending','processing','paid','rejected')),
  customer_note text check (char_length(customer_note) <= 1000),
  admin_note text check (char_length(admin_note) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_by uuid references auth.users(id),
  processed_at timestamptz
);
create unique index if not exists cashback_one_open_request_per_month
  on public.cashback_requests(customer_id, period_month)
  where status in ('pending','processing');
create index if not exists cashback_requests_customer_history_idx
  on public.cashback_requests(customer_id, created_at desc);
create index if not exists cashback_requests_admin_queue_idx
  on public.cashback_requests(status, created_at asc);

create table if not exists public.cashback_request_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.cashback_requests(id) on delete restrict,
  actor_id uuid references auth.users(id),
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.orders enable row level security;
alter table public.cashback_requests enable row level security;
alter table public.cashback_request_events enable row level security;
-- Access is intentionally server-mediated; clients cannot write records directly.
revoke all on public.profiles, public.orders, public.cashback_requests, public.cashback_request_events from anon, authenticated;
grant select on public.profiles to authenticated;
create policy "users read own profile" on public.profiles for select to authenticated using (id = auth.uid());
-- Do not allow clients to promote themselves to admin. Admin role changes are service-role only.

create or replace function public.submit_cashback_request(p_customer_id uuid, p_period_month date, p_customer_note text default null)
returns public.cashback_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total bigint;
  v_rate integer;
  v_amount bigint;
  v_row public.cashback_requests;
begin
  if p_customer_id is null or p_period_month is null then raise exception 'invalid_input'; end if;
  if p_period_month <> date_trunc('month', p_period_month)::date then raise exception 'invalid_period'; end if;
  if p_period_month <> date_trunc('month', current_date)::date then raise exception 'current_month_only'; end if;
  if exists (select 1 from public.cashback_requests r where r.customer_id=p_customer_id and r.period_month=p_period_month and r.status in ('pending','processing')) then
    raise exception 'request_already_open';
  end if;
  select coalesce(sum(o.total_toman),0) into v_total
    from public.orders o
   where o.customer_id=p_customer_id
     and o.status='paid'
     and o.cashback_eligible=true
     and o.paid_at >= p_period_month
     and o.paid_at < (p_period_month + interval '1 month');
  v_rate := case when v_total > 1000000000 then 15 when v_total > 500000000 then 10 when v_total > 100000000 then 5 else 0 end;
  v_amount := floor(v_total * v_rate / 100.0)::bigint;
  if v_rate = 0 then raise exception 'minimum_threshold_not_reached'; end if;
  insert into public.cashback_requests(customer_id,period_month,eligible_purchase_toman,rate_percent,amount_toman,customer_note)
  values (p_customer_id,p_period_month,v_total,v_rate,v_amount,nullif(left(coalesce(p_customer_note,''),1000),''))
  returning * into v_row;
  insert into public.cashback_request_events(request_id,actor_id,from_status,to_status,note)
  values (v_row.id,p_customer_id,null,'pending','درخواست توسط مشتری ثبت شد');
  return v_row;
end;
$$;

create or replace function public.admin_update_cashback_request(
  p_request_id uuid, p_actor_id uuid, p_new_status text, p_admin_note text default null
) returns public.cashback_requests
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_row public.cashback_requests;
  v_old text;
begin
  if not exists (select 1 from public.profiles where id=p_actor_id and role='admin') then raise exception 'admin_required'; end if;
  if p_new_status not in ('processing','paid','rejected') then raise exception 'invalid_status'; end if;
  select status into v_old from public.cashback_requests where id=p_request_id for update;
  if not found then raise exception 'request_not_found'; end if;
  if v_old='pending' and p_new_status not in ('processing','rejected') then raise exception 'invalid_transition'; end if;
  if v_old='processing' and p_new_status not in ('paid','rejected') then raise exception 'invalid_transition'; end if;
  if v_old in ('paid','rejected') then raise exception 'request_closed'; end if;
  update public.cashback_requests
     set status=p_new_status, admin_note=nullif(left(coalesce(p_admin_note,''),1000),''),
         updated_at=now(), processed_by=p_actor_id,
         processed_at=case when p_new_status in ('paid','rejected') then now() else null end
   where id=p_request_id returning * into v_row;
  insert into public.cashback_request_events(request_id,actor_id,from_status,to_status,note)
  values (p_request_id,p_actor_id,v_old,p_new_status,nullif(left(coalesce(p_admin_note,''),1000), ''));
  return v_row;
end;
$$;

revoke all on function public.submit_cashback_request(uuid,date,text) from public, anon, authenticated;
revoke all on function public.admin_update_cashback_request(uuid,uuid,text,text) from public, anon, authenticated;
grant execute on function public.submit_cashback_request(uuid,date,text) to service_role;
grant execute on function public.admin_update_cashback_request(uuid,uuid,text,text) to service_role;
