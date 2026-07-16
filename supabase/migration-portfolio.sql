-- Globalle — Fase 1: Portfólio de Imóveis
-- ESTENDE o schema do Transaction Room (supabase/schema.sql). Rodar UMA vez,
-- depois de schema.sql, no SQL Editor do Supabase.

-- ============================================================
-- 1. Papéis
-- ============================================================
create type user_role as enum ('team', 'client');
-- futuro: 'lawyer', 'partner_agent' — alter type user_role add value ...

create table profiles (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null,
  role user_role not null default 'client',
  created_at timestamptz default now()
);

-- Perfil criado automaticamente a cada novo usuário do Auth.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'client'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill: os usuários já existentes são a equipe Globalle.
insert into profiles (id, full_name, role)
select id, coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1)), 'team'
from auth.users
on conflict (id) do nothing;

-- Helper para as policies (security definer evita recursão de RLS em profiles).
create or replace function public.is_team()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'team');
$$;

-- ============================================================
-- 2. Tese de investimento (1 ativa por cliente na v1)
-- ============================================================
create table theses (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  title text not null,
  objective text not null check (objective in ('morar', 'arrendar', 'valorizar', 'desenvolver')),
  budget_min numeric,
  budget_max numeric,
  budget_currency text not null default 'EUR',
  target_countries text[] not null,           -- ISO 3166-1 alpha-2
  target_cities text[],
  property_types text[],
  min_yield numeric,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table thesis_criteria (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references theses(id) on delete cascade,
  label text not null,
  sort_order int not null default 0
);

-- ============================================================
-- 3. Imóveis
-- ============================================================
create table properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  country_code text not null,                 -- ISO alpha-2 — dirige o motor de custos
  city text not null,
  municipality text,                          -- obrigatório para BR (ITBI é municipal)
  address text,
  property_type text not null,
  asking_price numeric not null,
  currency text not null,
  area_m2 numeric,
  bedrooms int,
  listing_url text,
  source_type text not null check (source_type in ('portal', 'partner_agent', 'off_market', 'direct_owner')),
  source_name text,
  cover_photo_url text,
  photos jsonb default '[]',
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- 4. Portfólio (kanban), histórico, comentários, fit
-- ============================================================
create type portfolio_status as enum ('novo', 'favorito', 'em_analise', 'descartado', 'avancar');

create table portfolio_items (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references theses(id),
  property_id uuid not null references properties(id),
  status portfolio_status not null default 'novo',
  sort_order int not null default 0,
  added_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (thesis_id, property_id)
);
create index portfolio_items_thesis_idx on portfolio_items (thesis_id, status, sort_order);

create table status_history (
  id uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid not null references portfolio_items(id) on delete cascade,
  from_status portfolio_status,
  to_status portfolio_status not null,
  reason text,
  changed_by uuid not null references profiles(id),
  changed_at timestamptz default now()
);
create index status_history_item_idx on status_history (portfolio_item_id, changed_at);

create table comments (
  id uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid not null references portfolio_items(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz default now()
);
create index comments_item_idx on comments (portfolio_item_id, created_at);

create type fit_value as enum ('sim', 'parcial', 'nao');

create table criterion_fits (
  id uuid primary key default gen_random_uuid(),
  portfolio_item_id uuid not null references portfolio_items(id) on delete cascade,
  criterion_id uuid not null references thesis_criteria(id) on delete cascade,
  fit fit_value not null,
  note text,
  assessed_by uuid not null references profiles(id),
  assessed_at timestamptz default now(),
  unique (portfolio_item_id, criterion_id)
);

-- ============================================================
-- 5. Motor de custos por país — regras em tabela, nunca hardcoded
-- ============================================================
create table cost_rules (
  id uuid primary key default gen_random_uuid(),
  country_code text not null,
  municipality text,                          -- null = nacional; preenchido = municipal (BR/ITBI)
  cost_label text not null,
  calc_type text not null check (calc_type in ('flat', 'percent', 'brackets')),
  flat_amount numeric,
  percent_rate numeric,
  brackets jsonb,                             -- [{up_to, marginal_rate, deduction}] — up_to null = sem teto
  applies_to_objective text,                  -- null = todos os objetivos
  currency text not null,
  valid_from date not null default current_date,
  valid_to date,
  updated_by uuid references profiles(id)
);
create index cost_rules_country_idx on cost_rules (country_code, valid_from);

-- ============================================================
-- 6. Extensão do Transaction Room (não destrutiva)
-- ============================================================
-- Vínculo do gatilho "Avançar": a transação criada guarda o imóvel de origem.
alter table transactions add column property_id uuid references properties(id);

-- Endurecer RLS existente: as policies antigas ("qualquer autenticado") dariam
-- acesso às transações também aos CLIENTES logados. Agora só a equipe.
drop policy "team full access" on transactions;
drop policy "team full access" on steps;
drop policy "team full access" on documents;
create policy "team only" on transactions for all using (is_team()) with check (is_team());
create policy "team only" on steps for all using (is_team()) with check (is_team());
create policy "team only" on documents for all using (is_team()) with check (is_team());

-- ============================================================
-- 7. RLS do módulo de portfólio
-- ============================================================
alter table profiles enable row level security;
alter table theses enable row level security;
alter table thesis_criteria enable row level security;
alter table properties enable row level security;
alter table portfolio_items enable row level security;
alter table status_history enable row level security;
alter table comments enable row level security;
alter table criterion_fits enable row level security;
alter table cost_rules enable row level security;

-- profiles: cada um lê o próprio; team lê e edita todos.
create policy "read own profile" on profiles for select using (id = auth.uid());
create policy "team reads all profiles" on profiles for select using (is_team());
create policy "team manages profiles" on profiles for update using (is_team()) with check (is_team());

-- theses: cliente lê as suas; team tudo.
create policy "client reads own theses" on theses for select using (client_id = auth.uid());
create policy "team full theses" on theses for all using (is_team()) with check (is_team());

-- thesis_criteria: segue a tese.
create policy "client reads own criteria" on thesis_criteria for select
  using (exists (select 1 from theses t where t.id = thesis_id and t.client_id = auth.uid()));
create policy "team full criteria" on thesis_criteria for all using (is_team()) with check (is_team());

-- properties: team CRUD; cliente lê apenas imóveis em portfólio de tese sua.
create policy "team full properties" on properties for all using (is_team()) with check (is_team());
create policy "client reads portfolio properties" on properties for select
  using (exists (
    select 1 from portfolio_items pi
    join theses t on t.id = pi.thesis_id
    where pi.property_id = properties.id and t.client_id = auth.uid()
  ));

-- portfolio_items: cliente lê/atualiza itens da própria tese (colunas restritas
-- nas server actions); team tudo.
create policy "client reads own items" on portfolio_items for select
  using (exists (select 1 from theses t where t.id = thesis_id and t.client_id = auth.uid()));
create policy "client updates own items" on portfolio_items for update
  using (exists (select 1 from theses t where t.id = thesis_id and t.client_id = auth.uid()))
  with check (exists (select 1 from theses t where t.id = thesis_id and t.client_id = auth.uid()));
create policy "team full items" on portfolio_items for all using (is_team()) with check (is_team());

-- status_history: leitura e insert pelo dono da tese; team tudo.
create policy "client reads own history" on status_history for select
  using (exists (
    select 1 from portfolio_items pi join theses t on t.id = pi.thesis_id
    where pi.id = portfolio_item_id and t.client_id = auth.uid()
  ));
create policy "client logs own history" on status_history for insert
  with check (changed_by = auth.uid() and exists (
    select 1 from portfolio_items pi join theses t on t.id = pi.thesis_id
    where pi.id = portfolio_item_id and t.client_id = auth.uid()
  ));
create policy "team full history" on status_history for all using (is_team()) with check (is_team());

-- comments: dono da tese lê e comenta; team tudo.
create policy "client reads own comments" on comments for select
  using (exists (
    select 1 from portfolio_items pi join theses t on t.id = pi.thesis_id
    where pi.id = portfolio_item_id and t.client_id = auth.uid()
  ));
create policy "client writes own comments" on comments for insert
  with check (author_id = auth.uid() and exists (
    select 1 from portfolio_items pi join theses t on t.id = pi.thesis_id
    where pi.id = portfolio_item_id and t.client_id = auth.uid()
  ));
create policy "team full comments" on comments for all using (is_team()) with check (is_team());

-- criterion_fits: cliente só lê (da própria tese); team escreve.
create policy "client reads own fits" on criterion_fits for select
  using (exists (
    select 1 from portfolio_items pi join theses t on t.id = pi.thesis_id
    where pi.id = portfolio_item_id and t.client_id = auth.uid()
  ));
create policy "team full fits" on criterion_fits for all using (is_team()) with check (is_team());

-- cost_rules: leitura para autenticados; escrita só team.
create policy "authenticated read cost rules" on cost_rules for select using (auth.role() = 'authenticated');
create policy "team writes cost rules" on cost_rules for insert with check (is_team());
create policy "team updates cost rules" on cost_rules for update using (is_team()) with check (is_team());
create policy "team deletes cost rules" on cost_rules for delete using (is_team());

-- ============================================================
-- 8. Storage: bucket de fotos (leitura pública, escrita da equipe)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('property-photos', 'property-photos', true)
on conflict (id) do nothing;

create policy "public read property photos" on storage.objects for select
  using (bucket_id = 'property-photos');
create policy "team uploads property photos" on storage.objects for insert
  with check (bucket_id = 'property-photos' and is_team());
create policy "team deletes property photos" on storage.objects for delete
  using (bucket_id = 'property-photos' and is_team());
