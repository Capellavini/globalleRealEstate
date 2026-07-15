-- Globalle Transaction Room — schema (fase 1: uso interno da equipe)
-- Rodar UMA vez no SQL Editor do projeto Supabase.

create extension if not exists "pgcrypto";

create type transaction_status as enum ('active', 'closed', 'cancelled');
create type transaction_thesis as enum ('renda_euro', 'yield_real_brasil', 'cidadania_patrimonio');
create type step_status as enum ('pending', 'in_progress', 'done');
create type document_status as enum ('pending', 'received', 'approved');

create table transactions (
  id uuid primary key default gen_random_uuid(),
  client_name text not null,
  thesis transaction_thesis not null,
  status transaction_status not null default 'active',
  target_close_date date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table steps (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  title text not null,
  description text,
  order_index int not null,
  status step_status not null default 'pending',
  due_date date,
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  name text not null,
  status document_status not null default 'pending',
  file_url text,
  due_date date,
  uploaded_at timestamptz,
  created_at timestamptz not null default now()
);

create index steps_transaction_id_idx on steps (transaction_id, order_index);
create index documents_transaction_id_idx on documents (transaction_id);

-- Mantém updated_at correto em qualquer update.
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_updated_at
  before update on transactions
  for each row execute function set_updated_at();

-- RLS: nesta fase, qualquer usuário autenticado (equipe) vê tudo.
-- Fase 2 (acesso do cliente): trocar por policies filtrando por client_user_id
-- numa tabela de convites — o modelo fica aberto para essa coluna entrar sem
-- migração destrutiva.
alter table transactions enable row level security;
alter table steps enable row level security;
alter table documents enable row level security;

create policy "team full access" on transactions for all using (auth.role() = 'authenticated');
create policy "team full access" on steps for all using (auth.role() = 'authenticated');
create policy "team full access" on documents for all using (auth.role() = 'authenticated');
