-- Globalle — apresentação da página do imóvel estilo portal (dossiê do cliente).
-- Rodar UMA vez no SQL Editor.

alter table properties add column if not exists description text;
alter table properties add column if not exists expected_monthly_rent numeric;

comment on column properties.expected_monthly_rent is
  'Renda mensal esperada (mesma moeda de asking_price) — usada só para exibir yield estimado quando preenchida.';
