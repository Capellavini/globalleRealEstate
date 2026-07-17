-- Globalle — Fase 2+3: Transaction Room com cliente e terceiros.
-- Rodar UMA vez no SQL Editor, depois de migration-fase15.sql.

-- ============================================================
-- Bloco 1 — Papéis e participantes por transação
-- ============================================================
alter type user_role add value if not exists 'lawyer';

create type participant_role as enum ('client', 'lawyer', 'other');

create table transaction_participants (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  profile_id uuid not null references profiles(id),
  role participant_role not null,
  invited_by uuid references profiles(id),
  created_at timestamptz default now(),
  unique (transaction_id, profile_id)
);
create index transaction_participants_profile_idx on transaction_participants (profile_id);

-- Helper (security definer evita recursão de RLS).
create or replace function public.is_participant(tx uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from transaction_participants
    where transaction_id = tx and profile_id = auth.uid()
  );
$$;

-- Participantes da mesma transação podem ler o perfil uns dos outros (nome).
create or replace function public.shares_transaction_with(other uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1
    from transaction_participants a
    join transaction_participants b on b.transaction_id = a.transaction_id
    where a.profile_id = auth.uid() and b.profile_id = other
  );
$$;

-- Migração: transações criadas pelo "Avançar" do portfólio ganham o cliente
-- da tese vinculada como participante.
insert into transaction_participants (transaction_id, profile_id, role)
select t.id, th.client_id, 'client'
from transactions t
join portfolio_items pi on pi.property_id = t.property_id
join theses th on th.id = pi.thesis_id
where t.property_id is not null
on conflict (transaction_id, profile_id) do nothing;

-- ============================================================
-- Bloco 3 — Documentos da transação (bucket PRIVADO)
-- ============================================================
create table transaction_documents (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  name text not null,
  category text,                               -- 'contrato' | 'identificacao' | 'financiamento' | 'outro'
  storage_path text not null,                  -- 'transaction-docs/{transaction_id}/arquivo'
  is_internal boolean not null default false,  -- true = só a equipe vê
  uploaded_by uuid not null references profiles(id),
  created_at timestamptz default now()
);
create index transaction_documents_tx_idx on transaction_documents (transaction_id, created_at);

-- Comentários da transação (mesmo padrão dos comentários do portfólio).
create table transaction_comments (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  author_id uuid not null references profiles(id),
  body text not null,
  created_at timestamptz default now()
);
create index transaction_comments_tx_idx on transaction_comments (transaction_id, created_at);

-- Bucket privado, 25MB, pdf/imagens/docx/xlsx. Download SEMPRE por URL
-- assinada emitida em server action (valida participação + is_internal).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'transaction-docs', 'transaction-docs', false, 26214400,
  array[
    'application/pdf',
    'image/png', 'image/jpeg', 'image/webp',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
on conflict (id) do nothing;

-- Upload: caminho começa com o uuid da transação — participante só sobe na sua.
create or replace function public.can_upload_tx_doc(objname text)
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from transaction_participants tp
    where tp.profile_id = auth.uid()
      and tp.transaction_id::text = (storage.foldername(objname))[1]
  );
$$;

create policy "tx docs team all" on storage.objects for all
  using (bucket_id = 'transaction-docs' and is_team())
  with check (bucket_id = 'transaction-docs' and is_team());
create policy "tx docs participant upload" on storage.objects for insert
  with check (bucket_id = 'transaction-docs' and can_upload_tx_doc(name));
-- SEM policy de select para participantes: leitura só via URL assinada
-- gerada no servidor (service role) após validação.

-- ============================================================
-- Bloco 4 — RLS do portal do participante
-- ============================================================
alter table transaction_participants enable row level security;
alter table transaction_documents enable row level security;
alter table transaction_comments enable row level security;

-- transactions: equipe já tem "team only" (ALL). Participante ganha SELECT.
create policy "participant reads own transactions" on transactions for select
  using (is_participant(id));

-- steps: participante VÊ etapas/status (matriz de visibilidade).
create policy "participant reads steps" on steps for select
  using (is_participant(transaction_id));

-- CUSTOS: hoje não existe tabela de custo por transação (chega na Parte D —
-- custo por etapa). Quando existir, a policy nasce team-only, sem exceções.
-- Nenhuma rota de participante retorna custo. (cost_rules do portfólio segue
-- legível por autenticados: alimenta a estimativa de aquisição na área
-- "Opções", que é feature do cliente.)

-- transaction_participants: equipe gerencia; participante lê a lista das suas.
create policy "team full participants" on transaction_participants for all
  using (is_team()) with check (is_team());
create policy "participant reads co-participants" on transaction_participants for select
  using (is_participant(transaction_id));

-- profiles: participantes da mesma transação leem nome uns dos outros.
create policy "co-participants read profiles" on profiles for select
  using (shares_transaction_with(id));

-- properties: participante vê o imóvel da transação (título/bandeira no card).
create policy "participant reads transaction property" on properties for select
  using (exists (
    select 1 from transactions t
    where t.property_id = properties.id and is_participant(t.id)
  ));

-- transaction_documents: equipe tudo; participante lê NÃO-internos e insere
-- apenas não-internos nas suas transações.
create policy "team full tx documents" on transaction_documents for all
  using (is_team()) with check (is_team());
create policy "participant reads public tx documents" on transaction_documents for select
  using (is_participant(transaction_id) and is_internal = false);
create policy "participant uploads tx documents" on transaction_documents for insert
  with check (is_participant(transaction_id) and is_internal = false and uploaded_by = auth.uid());

-- transaction_comments: participante lê/escreve nas suas; equipe tudo.
create policy "team full tx comments" on transaction_comments for all
  using (is_team()) with check (is_team());
create policy "participant reads tx comments" on transaction_comments for select
  using (is_participant(transaction_id));
create policy "participant writes tx comments" on transaction_comments for insert
  with check (is_participant(transaction_id) and author_id = auth.uid());
