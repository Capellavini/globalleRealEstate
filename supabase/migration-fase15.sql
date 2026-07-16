-- Globalle — Fase 1.5 (Blocos 2 e 4). Rodar UMA vez no SQL Editor,
-- depois de migration-portfolio.sql.

-- ============================================================
-- Bloco 2 — Perfil do cliente
-- ============================================================
alter table profiles
  add column avatar_url text,
  add column phone text,
  add column company text,
  add column residence_country text,     -- ISO alpha-2
  add column preferred_language text;    -- 'pt' | 'en' | 'it' | 'es'

-- Cliente edita o próprio perfil (o papel fica protegido pelo trigger abaixo).
create policy "update own profile" on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- Ninguém muda o próprio papel a não ser a equipe. auth.uid() null = service
-- role (Admin API do /admin/users) — passa.
create or replace function public.prevent_self_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not is_team() then
    raise exception 'Apenas a equipe pode alterar papéis.';
  end if;
  return new;
end;
$$;

create trigger profiles_role_guard
  before update on profiles
  for each row execute function public.prevent_self_role_change();

-- Bucket de avatares: leitura pública, upload só na pasta do próprio usuário
-- (caminho {uid}/arquivo).
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "public read avatars" on storage.objects for select
  using (bucket_id = 'avatars');
create policy "own avatar insert" on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own avatar update" on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "own avatar delete" on storage.objects for delete
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================
-- Bloco 4 — Objetivo da tese: novos valores
-- morar→moradia, arrendar→para_renda, valorizar→revenda,
-- desenvolver→desenvolvimento, + patrimonial (novo)
-- ============================================================
alter table theses drop constraint theses_objective_check;

update theses set objective = case objective
  when 'morar' then 'moradia'
  when 'arrendar' then 'para_renda'
  when 'valorizar' then 'revenda'
  when 'desenvolver' then 'desenvolvimento'
  else objective
end;

alter table theses add constraint theses_objective_check
  check (objective in ('moradia', 'para_renda', 'revenda', 'patrimonial', 'desenvolvimento'));

-- Motor de custos: regras que distinguiam habitação própria ('morar')
-- passam a usar 'moradia'.
update cost_rules set applies_to_objective = 'moradia' where applies_to_objective = 'morar';
