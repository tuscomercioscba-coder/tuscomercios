-- Campos necesarios para asociar de forma segura Mercado Pago con la base.

alter table public.banners
  add column if not exists mp_subscription_id text;

create unique index if not exists subscriptions_mp_subscription_id_uidx
  on public.subscriptions (mp_subscription_id)
  where mp_subscription_id is not null;

create unique index if not exists banners_mp_subscription_id_uidx
  on public.banners (mp_subscription_id)
  where mp_subscription_id is not null;
