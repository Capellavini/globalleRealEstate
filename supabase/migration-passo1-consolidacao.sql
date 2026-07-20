-- Globalle — Consolidação, Passo 1 (higiene de dados).
-- Rodar UMA vez no SQL Editor, depois de migration-parte-d.sql.
-- O último SELECT é o relatório do backfill.
--
-- O que muda:
--   * transactions ganha client_id e thesis_id (FKs reais; client_name texto
--     vira derivado — a coluna fica até o Passo 3).
--   * profiles ganha advisory_line — a "tese comercial" (Renda em Euro /
--     Yield Real Brasil / Cidadania & Patrimônio) vira ETIQUETA DO CLIENTE.
--     A transação continua guardando uma cópia em transactions.thesis
--     (preenchida automaticamente no Avançar) = atribuição histórica de
--     faturamento por linha, mesmo que o cliente mude de linha depois.

alter table transactions
  add column client_id uuid references profiles(id),
  add column thesis_id uuid references theses(id);

-- Reusa o enum já existente (renda_euro | yield_real_brasil | cidadania_patrimonio).
alter table profiles add column advisory_line transaction_thesis;

-- ============================================================
-- Backfill
-- ============================================================
-- 1. client_id: do participante 'client' (fase 2+3).
update transactions t
set client_id = tp.profile_id
from transaction_participants tp
where tp.transaction_id = t.id
  and tp.role = 'client'
  and t.client_id is null;

-- 2. thesis_id: via portfólio (imóvel → item → tese), preferindo a tese do
--    próprio cliente quando o imóvel estiver em mais de um portfólio.
update transactions t
set thesis_id = pi.thesis_id
from portfolio_items pi
join theses th on th.id = pi.thesis_id
where t.property_id = pi.property_id
  and t.thesis_id is null
  and (t.client_id is null or th.client_id = t.client_id);

-- 3. advisory_line do cliente: herdada da transação mais recente dele.
update profiles p
set advisory_line = sub.thesis
from (
  select distinct on (client_id) client_id, thesis
  from transactions
  where client_id is not null
  order by client_id, created_at desc
) sub
where sub.client_id = p.id
  and p.advisory_line is null;

-- ============================================================
-- Relatório do backfill — revisar
-- ============================================================
select
  t.client_name                                   as transacao,
  t.status                                        as status_tx,
  case when t.client_id is null then '✗ SEM CLIENTE — vincular à mão'
       else coalesce(p.full_name, t.client_id::text) end as cliente_vinculado,
  case when t.thesis_id is null then '(sem tese — ok se transação manual)'
       else coalesce(th.title, t.thesis_id::text) end    as tese_vinculada,
  t.thesis                                        as linha_advisory_snapshot,
  p.advisory_line                                 as linha_advisory_cliente
from transactions t
left join profiles p on p.id = t.client_id
left join theses th on th.id = t.thesis_id
order by t.created_at;
