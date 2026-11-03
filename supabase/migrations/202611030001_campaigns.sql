-- Maxicar campaigns, stories and flash-sale foundation. Apply only to the staging Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  slug text unique,
  description text not null default '' check (char_length(description) <= 2000),
  campaign_type text not null check (campaign_type in ('story','flash_sale','limited_deal','member_offer','bundle')),
  status text not null default 'draft' check (status in ('draft','published','paused','archived')),
  media_url text,
  media_type text not null default 'image' check (media_type in ('image','video')),
  product_ids jsonb not null default '[]'::jsonb check (jsonb_typeof(product_ids) = 'array'),
  discount_type text not null default 'percent' check (discount_type in ('percent','fixed')),
  discount_value bigint not null default 0 check (discount_value >= 0),
  audience text not null default 'all' check (audience in ('all','members','maxima','teana','murano')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  quantity_limit integer check (quantity_limit is null or quantity_limit > 0),
  sold_quantity integer not null default 0 check (sold_quantity >= 0),
  stock_confirmed boolean not null default false,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint campaigns_valid_window check (ends_at > starts_at),
  constraint campaigns_percent_range check (discount_type <> 'percent' or discount_value <= 90)
);
create index if not exists campaigns_public_window_idx on public.campaigns(status, starts_at, ends_at);
create index if not exists campaigns_type_created_idx on public.campaigns(campaign_type, created_at desc);

create table if not exists public.campaign_events (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  event_type text not null check (event_type in ('view','click','order')),
  session_key text,
  created_at timestamptz not null default now()
);
create index if not exists campaign_events_campaign_type_idx on public.campaign_events(campaign_id,event_type,created_at desc);

alter table public.campaigns enable row level security;
alter table public.campaign_events enable row level security;
revoke all on public.campaigns, public.campaign_events from anon, authenticated;
grant all on public.campaigns, public.campaign_events to service_role;

-- Media is uploaded by a server route using the service role; public URLs are read-only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('maxicar-campaign-media','maxicar-campaign-media',true,31457280,
  array['image/jpeg','image/png','image/webp','image/avif','video/mp4','video/webm'])
on conflict (id) do update set public=true, file_size_limit=31457280,
  allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.touch_campaign_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists campaigns_touch_updated_at on public.campaigns;
create trigger campaigns_touch_updated_at before update on public.campaigns
for each row execute function public.touch_campaign_updated_at();

-- Customer opt-ins and in-site campaign notifications.
create table if not exists public.campaign_subscriptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  audience text not null check (audience in ('all','members','maxima','teana','murano')),
  created_at timestamptz not null default now(),
  unique(customer_id,audience)
);
create index if not exists campaign_subscriptions_audience_idx on public.campaign_subscriptions(audience,customer_id);

create table if not exists public.campaign_notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  created_at timestamptz not null default now(),
  read_at timestamptz,
  unique(customer_id,campaign_id)
);
create index if not exists campaign_notifications_customer_idx on public.campaign_notifications(customer_id,created_at desc);

alter table public.campaign_subscriptions enable row level security;
alter table public.campaign_notifications enable row level security;
revoke all on public.campaign_subscriptions,public.campaign_notifications from anon,authenticated;
grant all on public.campaign_subscriptions,public.campaign_notifications to service_role;
