-- Seed do motor de custos — ESTRUTURA das regras de PT e BR.
-- ⚠️  TODO: equipe confirma os valores vigentes antes de produção.
-- Os números abaixo são aproximações para dar forma às regras; a equipe
-- valida/edita tudo em /admin/cost-rules (nunca no código).

-- ============ PORTUGAL (nacional, EUR) ============

-- IMT — habitação própria e permanente (objective = 'moradia').
-- Formato brackets: taxa sobre o valor total com parcela a abater
-- [{"up_to": teto_do_escalao_ou_null, "marginal_rate": taxa, "deduction": abate}]
-- TODO: equipe confirma escalões IMT vigentes (mudam todo ano no OE).
insert into cost_rules (country_code, municipality, cost_label, calc_type, brackets, applies_to_objective, currency, valid_from) values
('PT', null, 'IMT', 'brackets', '[
  {"up_to": 101917,  "marginal_rate": 0,      "deduction": 0},
  {"up_to": 139412,  "marginal_rate": 0.02,   "deduction": 2038.34},
  {"up_to": 190086,  "marginal_rate": 0.05,   "deduction": 6220.70},
  {"up_to": 316772,  "marginal_rate": 0.07,   "deduction": 10022.42},
  {"up_to": 633453,  "marginal_rate": 0.08,   "deduction": 13190.14},
  {"up_to": 1102920, "marginal_rate": 0.06,   "deduction": 0},
  {"up_to": null,    "marginal_rate": 0.075,  "deduction": 0}
]'::jsonb, 'moradia', 'EUR', current_date);

-- IMT — habitação secundária / investimento (todos os demais objetivos).
-- TODO: equipe confirma escalões IMT de habitação secundária.
insert into cost_rules (country_code, municipality, cost_label, calc_type, brackets, applies_to_objective, currency, valid_from) values
('PT', null, 'IMT', 'brackets', '[
  {"up_to": 101917,  "marginal_rate": 0.01,   "deduction": 0},
  {"up_to": 139412,  "marginal_rate": 0.02,   "deduction": 1019.17},
  {"up_to": 190086,  "marginal_rate": 0.05,   "deduction": 5201.53},
  {"up_to": 316772,  "marginal_rate": 0.07,   "deduction": 9003.25},
  {"up_to": 607528,  "marginal_rate": 0.08,   "deduction": 12170.97},
  {"up_to": 1102920, "marginal_rate": 0.06,   "deduction": 0},
  {"up_to": null,    "marginal_rate": 0.075,  "deduction": 0}
]'::jsonb, null, 'EUR', current_date);

-- Imposto do Selo — 0,8% sobre o preço. TODO: confirmar taxa vigente.
insert into cost_rules (country_code, municipality, cost_label, calc_type, percent_rate, applies_to_objective, currency, valid_from) values
('PT', null, 'Imposto do Selo', 'percent', 0.008, null, 'EUR', current_date);

-- Notariado e registo — estimativa flat. TODO: equipe confirma valor típico.
insert into cost_rules (country_code, municipality, cost_label, calc_type, flat_amount, applies_to_objective, currency, valid_from) values
('PT', null, 'Notariado e registo', 'flat', 1000, null, 'EUR', current_date);

-- ============ BRASIL (BRL) ============

-- ITBI é MUNICIPAL — seed com São Paulo (3%). Outros municípios: adicionar
-- linhas com municipality preenchido em /admin/cost-rules.
-- TODO: equipe confirma alíquota vigente do ITBI de São Paulo.
insert into cost_rules (country_code, municipality, cost_label, calc_type, percent_rate, applies_to_objective, currency, valid_from) values
('BR', 'São Paulo', 'ITBI', 'percent', 0.03, null, 'BRL', current_date);

-- Escritura pública — tabela de emolumentos estadual (aproximação SP).
-- TODO: equipe confirma a tabela de emolumentos vigente do estado.
insert into cost_rules (country_code, municipality, cost_label, calc_type, brackets, applies_to_objective, currency, valid_from) values
('BR', null, 'Escritura pública', 'brackets', '[
  {"up_to": 500000,  "marginal_rate": 0.006,  "deduction": 0},
  {"up_to": 1000000, "marginal_rate": 0.005,  "deduction": 0},
  {"up_to": null,    "marginal_rate": 0.004,  "deduction": 0}
]'::jsonb, null, 'BRL', current_date);

-- Registro em cartório (RGI) — aproximação estadual SP.
-- TODO: equipe confirma a tabela de registro vigente.
insert into cost_rules (country_code, municipality, cost_label, calc_type, brackets, applies_to_objective, currency, valid_from) values
('BR', null, 'Registro em cartório', 'brackets', '[
  {"up_to": 500000,  "marginal_rate": 0.004,  "deduction": 0},
  {"up_to": 1000000, "marginal_rate": 0.003,  "deduction": 0},
  {"up_to": null,    "marginal_rate": 0.0025, "deduction": 0}
]'::jsonb, null, 'BRL', current_date);
