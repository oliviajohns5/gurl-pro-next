create table if not exists links (
  slug text primary key,
  destination_url text not null,
  title text not null default '',
  created_at timestamptz not null default now(),
  creator_ip_hash text,
  clicks bigint not null default 0,
  status text not null default 'active' check (status in ('active','blocked','deleted')),
  blocked_reason text
);
create index if not exists links_created_at_idx on links(created_at desc);
create index if not exists links_status_idx on links(status);
create table if not exists click_events (
  id bigserial primary key,
  slug text not null references links(slug) on delete cascade,
  clicked_at timestamptz not null default now(),
  referrer text,
  user_agent text,
  ip_hash text,
  country_code char(2)
);
create index if not exists click_events_slug_time_idx on click_events(slug, clicked_at desc);
create table if not exists reports (
  id bigserial primary key,
  slug text not null,
  reason text not null,
  email text,
  message text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
create or replace function record_click(p_slug text, p_referrer text, p_user_agent text, p_ip text)
returns void language plpgsql as $$
begin
  update links set clicks = clicks + 1 where slug = p_slug;
  insert into click_events(slug, referrer, user_agent, ip_hash)
  values (p_slug, left(p_referrer, 500), left(p_user_agent, 500), md5(coalesce(p_ip, '')));
end $$;
