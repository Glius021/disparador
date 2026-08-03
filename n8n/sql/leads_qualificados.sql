-- Tabela dos leads qualificados pela Isis antes do encaminhamento ao vendedor.
-- Rode no SQL Editor do Supabase.

create table if not exists leads_qualificados (
  id                 bigserial primary key,
  created_at         timestamptz not null default now(),

  -- identificacao
  telefone           text not null,
  session_id         text,
  nome               text,

  -- as 12 perguntas da qualificacao
  tipo_imovel        text,
  regiao             text,
  faixa_valor        text,
  finalidade         text,   -- Compra | Locacao
  urgencia           text,
  financiamento      text,
  moradores          text,
  garagem            text,
  suite              text,
  pets               text,
  area_lazer         text,
  metragem_minima    text,

  -- consolidado
  observacoes        text,
  resumo             text,
  campos_preenchidos int default 0,

  -- acompanhamento comercial
  status             text default 'novo',  -- novo | em_atendimento | visita | proposta | fechado | perdido
  corretor           text
);

create index if not exists idx_leads_qualificados_telefone   on leads_qualificados (telefone);
create index if not exists idx_leads_qualificados_created_at on leads_qualificados (created_at desc);
create index if not exists idx_leads_qualificados_status     on leads_qualificados (status);

-- Leads mais quentes primeiro: qualificacao mais completa e com urgencia declarada.
create or replace view leads_prioritarios as
select
  id, created_at, nome, telefone, finalidade, tipo_imovel, regiao,
  faixa_valor, urgencia, campos_preenchidos, status
from leads_qualificados
where status = 'novo'
order by
  case
    when urgencia ilike '%imediat%'  then 1
    when urgencia ilike '%dias%'     then 2
    when urgencia ilike '%30%'       then 3
    else 4
  end,
  campos_preenchidos desc,
  created_at desc;
