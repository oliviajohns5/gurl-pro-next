create table if not exists links (
  slug text primary key,
  destination_url text not null,
  title text not null default '',
  created_at text not null default (datetime('now')),
  updated_at text not null default (datetime('now')),
  creator_ip_hash text,
  clicks integer not null default 0,
  status text not null default 'active' check (status in ('active','blocked','deleted')),
  blocked_reason text
);
create index if not exists links_created_at_idx on links(created_at desc);
create index if not exists links_status_idx on links(status);
create index if not exists links_clicks_idx on links(clicks desc);

create table if not exists daily_clicks (
  slug text not null references links(slug) on delete cascade,
  day text not null,
  clicks integer not null default 0,
  primary key (slug, day)
);
create index if not exists daily_clicks_day_idx on daily_clicks(day desc);

create table if not exists recent_clicks (
  id integer primary key autoincrement,
  slug text not null references links(slug) on delete cascade,
  clicked_at text not null default (datetime('now')),
  referrer text,
  user_agent text,
  ip_hash text
);
create index if not exists recent_clicks_slug_time_idx on recent_clicks(slug, clicked_at desc);

create table if not exists reports (
  id integer primary key autoincrement,
  slug text not null,
  reason text not null,
  email text,
  message text,
  status text not null default 'new',
  created_at text not null default (datetime('now'))
);
create index if not exists reports_status_created_idx on reports(status, created_at desc);

create table if not exists blocked_domains (
  domain text primary key,
  reason text,
  created_at text not null default (datetime('now'))
);

create table if not exists blocked_ips (
  ip_hash text primary key,
  reason text,
  created_at text not null default (datetime('now'))
);

create table if not exists admin_settings (
  key text primary key,
  value text not null,
  updated_at text not null default (datetime('now'))
);

create table if not exists rate_limits (
  key text primary key,
  hits integer not null default 0,
  updated_at text not null default (datetime('now'))
);
