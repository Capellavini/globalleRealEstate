-- Globalle — marcadores de leitura do chat (mensagens não lidas visíveis
-- nos cards do portfólio e um contador global no menu).
-- Rodar UMA vez no SQL Editor, depois de migration-comments-realtime.sql.

create table comment_reads (
  portfolio_item_id uuid not null references portfolio_items(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (portfolio_item_id, user_id)
);

alter table comment_reads enable row level security;

-- Cada um só lê/escreve o próprio marcador — não é dado que outra pessoa
-- precisa ver.
create policy "user manages own reads" on comment_reads
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
