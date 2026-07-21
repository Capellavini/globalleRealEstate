-- Globalle — 6ª tese: "Projetos Especiais".
-- Rodar UMA vez no SQL Editor.

alter table theses drop constraint theses_objective_check;
alter table theses add constraint theses_objective_check
  check (objective in ('moradia', 'para_renda', 'revenda', 'patrimonial', 'desenvolvimento', 'projetos_especiais'));
