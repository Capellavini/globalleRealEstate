-- Globalle — chat em tempo real na página do imóvel (comments).
-- Rodar UMA vez no SQL Editor.

-- Sem isso, INSERTs em "comments" não são transmitidos via Realtime e o
-- chat só atualiza ao recarregar a página.
alter publication supabase_realtime add table comments;

-- Bug pré-existente que o chat expõe: só havia "read own profile" (id=auth.uid())
-- e "team reads all profiles" (is_team()) — um CLIENTE nunca conseguia ler o
-- profile de um membro da equipe, então toda mensagem da equipe aparecia sem
-- nome pro cliente (o join "profiles(full_name, role)" voltava nulo por RLS).
-- Nome + papel de um membro da equipe não é dado sensível — é quem está do
-- outro lado da conversa.
create policy "anyone reads team profiles" on profiles for select using (role = 'team');
