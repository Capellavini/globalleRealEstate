-- Globalle — Parte D (itens 1 e 2 do build): templates de etapas por país,
-- custos por etapa, receitas, instanciação + MIGRAÇÃO das transações
-- existentes com relatório final.
-- Rodar UMA vez no SQL Editor, depois de migration-fase23.sql.
-- O resultado do último SELECT é o RELATÓRIO DA MIGRAÇÃO — revisar antes
-- de seguir para os itens 3-5.
--
-- Desvios documentados em relação ao texto da spec:
--   * O enum chama-se process_step_status (o nome step_status já existe no
--     Transaction Room atual: pending/in_progress/done).
--   * "Renomear a tabela antiga de custos para _legacy": NÃO existe tabela de
--     custos por transação no schema atual. A única tabela de custos é
--     cost_rules — o motor de estimativas do PORTFÓLIO (feature do cliente),
--     que não é migrada nem renomeada. Portanto: 0 custos migrados, nada a
--     renomear. transaction_costs_v2 nasce vazia.
--   * A tabela `steps` antiga (4 etapas de advisory) fica intocada — o admin
--     atual ainda depende dela até o item 3 (timeline editável).

-- ============================================================
-- 1. Schema
-- ============================================================
create table process_templates (
  id uuid primary key default gen_random_uuid(),
  country_code text not null unique,       -- 'PT', 'BR' (Itália depois: só inserir template)
  name text not null
);

create table template_steps (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references process_templates(id) on delete cascade,
  name text not null,
  sort_order int not null,
  is_conditional boolean not null default false,
  description text                          -- explicação curta (timeline do cliente)
);

-- step_status já existe (Transaction Room) → nome novo.
create type process_step_status as enum ('pendente', 'em_andamento', 'concluida', 'nao_se_aplica');

create table transaction_steps (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  template_step_id uuid references template_steps(id),
  name text not null,                       -- copiado do template (imune a edições futuras)
  sort_order int not null,
  status process_step_status not null default 'pendente',
  started_at date,
  completed_at date,
  notes text                                -- interno da equipe (NUNCA vai ao participante)
);
create index transaction_steps_tx_idx on transaction_steps (transaction_id, sort_order);

-- Custos SEMPRE vinculados a uma etapa.
create table transaction_costs_v2 (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  step_id uuid not null references transaction_steps(id) on delete cascade,
  label text not null,
  amount numeric not null,
  currency text not null,
  paid_by text not null check (paid_by in ('cliente_direto', 'via_globalle')),
  status text not null default 'estimado' check (status in ('estimado', 'confirmado', 'pago')),
  paid_at date,
  created_by uuid references profiles(id),
  created_at timestamptz default now()
);
create index transaction_costs_v2_tx_idx on transaction_costs_v2 (transaction_id);

-- Previsão de faturamento da Globalle — INTERNO, nunca visível a participante.
create table transaction_revenues (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  step_id uuid references transaction_steps(id),
  label text not null,
  amount numeric not null,
  currency text not null,
  status text not null default 'previsto' check (status in ('previsto', 'faturado', 'recebido')),
  expected_at date,
  received_at date,
  created_at timestamptz default now()
);
create index transaction_revenues_tx_idx on transaction_revenues (transaction_id);

-- ============================================================
-- 2. RLS (seção 3 da spec)
-- ============================================================
alter table process_templates enable row level security;
alter table template_steps enable row level security;
alter table transaction_steps enable row level security;
alter table transaction_costs_v2 enable row level security;
alter table transaction_revenues enable row level security;

create policy "authenticated read templates" on process_templates for select using (auth.role() = 'authenticated');
create policy "team writes templates" on process_templates for all using (is_team()) with check (is_team());
create policy "authenticated read template steps" on template_steps for select using (auth.role() = 'authenticated');
create policy "team writes template steps" on template_steps for all using (is_team()) with check (is_team());

-- transaction_steps: SÓ equipe acessa a tabela direto (a coluna notes é
-- interna). Participante lê pela VIEW abaixo, sem notes.
create policy "team full transaction steps" on transaction_steps for all
  using (is_team()) with check (is_team());

-- View para o participante: sem notes, com a description do template, e o
-- filtro de acesso embutido (a view roda como owner e ignora o RLS da base —
-- por isso o WHERE é a própria política).
create view transaction_steps_public as
  select
    s.id, s.transaction_id, s.name, s.sort_order, s.status,
    s.started_at, s.completed_at,
    ts.description
  from transaction_steps s
  left join template_steps ts on ts.id = s.template_step_id
  where is_team() or is_participant(s.transaction_id);
grant select on transaction_steps_public to authenticated;

-- Custos e receitas: SOMENTE equipe, sem exceção (decisão vigente).
create policy "team only tx costs" on transaction_costs_v2 for all
  using (is_team()) with check (is_team());
create policy "team only tx revenues" on transaction_revenues for all
  using (is_team()) with check (is_team());

-- ============================================================
-- 3. Seed oficial dos templates (nomes EXATOS da seção 1 da spec)
-- ============================================================
insert into process_templates (country_code, name) values
  ('PT', 'Processo de compra — Portugal'),
  ('BR', 'Processo de compra — Brasil');

-- Descrições curtas: primeira versão da equipe Claude — a equipe pode editar
-- depois (aparecem na timeline do cliente no item 5).
insert into template_steps (template_id, name, sort_order, is_conditional, description)
select pt.id, s.name, s.sort_order, s.is_conditional, s.description
from process_templates pt,
lateral (values
  ('Proposta',       1, false, 'Apresentação e negociação da proposta de compra.'),
  ('Reserva',        2, true,  'Reserva do imóvel junto ao vendedor, quando aplicável.'),
  ('Due diligence',  3, false, 'Verificação jurídica e documental do imóvel.'),
  ('CPCV',           4, false, 'Assinatura do contrato-promessa de compra e venda.'),
  ('Financiamento',  5, true,  'Aprovação do crédito bancário, quando aplicável.'),
  ('Escritura',      6, false, 'Assinatura da escritura e pagamento dos impostos.'),
  ('Pós-compra',     7, false, 'Registos finais, contratos de serviços e entrega.')
) as s(name, sort_order, is_conditional, description)
where pt.country_code = 'PT';

insert into template_steps (template_id, name, sort_order, is_conditional, description)
select pt.id, s.name, s.sort_order, s.is_conditional, s.description
from process_templates pt,
lateral (values
  ('Proposta',                        1, false, 'Apresentação e negociação da proposta de compra.'),
  ('Due diligence',                   2, false, 'Verificação jurídica e documental do imóvel.'),
  ('Compromisso de compra e venda',   3, false, 'Assinatura do compromisso de compra e venda.'),
  ('Financiamento',                   4, true,  'Aprovação do crédito bancário, quando aplicável.'),
  ('Escritura pública',               5, false, 'Lavratura da escritura pública em cartório de notas.'),
  ('Registro',                        6, false, 'Registro da escritura no cartório de imóveis.'),
  ('Pós-compra',                      7, false, 'Averbações finais, contratos de serviços e entrega.')
) as s(name, sort_order, is_conditional, description)
where pt.country_code = 'BR';

-- ============================================================
-- 4. Migração das transações existentes
--    País: do imóvel vinculado; sem imóvel → heurística pela tese
--    (yield_real_brasil→BR, demais→PT), marcada no relatório.
--    Status: active → 1ª etapa em_andamento, demais pendente;
--            closed → todas concluida (completed_at = updated_at);
--            cancelled → todas pendente (transação morta, nada a marcar).
--    Custos antigos: NÃO existem (ver cabeçalho) → 0 migrados.
-- ============================================================
with tx as (
  select
    t.id,
    t.status,
    t.updated_at,
    coalesce(p.country_code, case t.thesis when 'yield_real_brasil' then 'BR' else 'PT' end) as cc,
    (p.id is not null) as country_from_property
  from transactions t
  left join properties p on p.id = t.property_id
)
insert into transaction_steps (transaction_id, template_step_id, name, sort_order, status, completed_at)
select
  tx.id,
  ts.id,
  ts.name,
  ts.sort_order,
  case
    when tx.status = 'closed' then 'concluida'::process_step_status
    when tx.status = 'active' and ts.sort_order = 1 then 'em_andamento'::process_step_status
    else 'pendente'::process_step_status
  end,
  case when tx.status = 'closed' then tx.updated_at::date end
from tx
join process_templates pt on pt.country_code = tx.cc
join template_steps ts on ts.template_id = pt.id
where not exists (
  select 1 from transaction_steps existing where existing.transaction_id = tx.id
);

-- ============================================================
-- 5. RELATÓRIO DA MIGRAÇÃO — revisar linha a linha
-- ============================================================
select
  t.client_name                                   as transacao,
  t.status                                        as status_transacao,
  coalesce(p.country_code,
    case t.thesis when 'yield_real_brasil' then 'BR' else 'PT' end) as pais_template,
  case when p.id is not null then 'imóvel vinculado'
       else 'HEURÍSTICA pela tese — revisar' end  as origem_do_pais,
  count(s.id)                                     as etapas_criadas,
  min(s.name) filter (where s.status = 'em_andamento') as etapa_em_andamento,
  count(s.id) filter (where s.status = 'concluida')    as etapas_concluidas,
  0                                               as custos_migrados -- não havia tabela antiga
from transactions t
left join properties p on p.id = t.property_id
left join transaction_steps s on s.transaction_id = t.id
group by t.id, t.client_name, t.status, t.thesis, p.country_code, p.id
order by t.created_at;
