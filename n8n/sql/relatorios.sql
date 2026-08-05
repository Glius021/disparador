-- Tabela de consolidacao para relatorios: une leads qualificados + dados do Chatwoot
-- Roda a cada 30min via n8n pra manter sincronizado

create table if not exists relatorios_leads (
  id                 bigserial primary key,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- link com leads_qualificados
  lead_id            bigint references leads_qualificados(id) on delete cascade,

  -- identificacao do chatwoot
  conversation_id    text,
  contact_id         bigint,
  inbox_id           bigint,

  -- dados do contato
  nome               text,
  telefone           text,
  email              text,

  -- dados do lead qualificado
  canal              text,           -- whatsapp | site
  tipo_imovel        text,
  regiao             text,
  faixa_valor        text,
  finalidade         text,           -- Compra | Locacao
  urgencia           text,
  campos_preenchidos int,

  -- dados da conversa
  status             text,           -- open | resolved | snoozed | ...
  corretor_id        bigint,
  corretor_nome      text,
  etiquetas          text[],         -- array de labels

  -- timeline
  primeira_mensagem  timestamptz,    -- quando lead enviou a primeira msg
  ultima_mensagem    timestamptz,    -- ultima msg (lead ou corretor)
  primeira_resposta  timestamptz,    -- quando o corretor respondeu pela primeira vez
  tempo_resposta_s   int,            -- segundos entre primeira msg e primeira resposta

  -- resultado
  resultado          text default 'aberto',  -- aberto | visitou | proposta | fechado | perdido | não interessado
  data_resultado     timestamptz,
  observacoes        text,

  -- metricas calculadas
  dias_em_aberto     int,
  mensagens_lead     int,
  mensagens_corretor int,
  score              numeric,        -- 0-100: quanto quente eh esse lead

  unique(conversation_id, canal)
);

create index if not exists idx_relatorios_lead_id on relatorios_leads(lead_id);
create index if not exists idx_relatorios_conversation_id on relatorios_leads(conversation_id);
create index if not exists idx_relatorios_status on relatorios_leads(status);
create index if not exists idx_relatorios_resultado on relatorios_leads(resultado);
create index if not exists idx_relatorios_corretor_id on relatorios_leads(corretor_id);
create index if not exists idx_relatorios_urgencia on relatorios_leads(urgencia);
create index if not exists idx_relatorios_updated_at on relatorios_leads(updated_at desc);

-- Views para relatorios comuns

-- leads em aberto, ordenados por urgencia + tempo
create or replace view relatorios_em_andamento as
select
  id, nome, telefone, corretor_nome, urgencia, tipo_imovel, regiao, faixa_valor,
  dias_em_aberto, tempo_resposta_s, mensagens_lead, mensagens_corretor, score,
  primeira_mensagem, primeira_resposta, ultima_mensagem
from relatorios_leads
where resultado = 'aberto' and status != 'resolved'
order by
  case when urgencia ilike '%imediat%' then 1
       when urgencia ilike '%dias%' then 2
       when urgencia ilike '%30%' then 3
       else 4 end,
  score desc,
  primeira_mensagem asc;

-- performance por corretor no periodo
create or replace view relatorios_por_corretor as
select
  corretor_nome,
  count(*) total_leads,
  count(*) filter (where resultado = 'fechado') fechados,
  round(count(*) filter (where resultado = 'fechado')::numeric / count(*) * 100, 1) taxa_conversao,
  round(avg(tempo_resposta_s)::numeric / 60, 1) tempo_resposta_medio_min,
  round(avg(dias_em_aberto), 1) dias_em_aberto_medio,
  round(avg(score), 1) score_medio
from relatorios_leads
where primeira_mensagem >= now() - interval '30 days'
group by corretor_nome
order by fechados desc;

-- funil de vendas
create or replace view relatorios_funil as
select
  resultado,
  count(*) quantidade,
  round(count(*)::numeric / (select count(*) from relatorios_leads where primeira_mensagem >= now() - interval '30 days') * 100, 1) percentual
from relatorios_leads
where primeira_mensagem >= now() - interval '30 days'
group by resultado
order by
  case when resultado = 'aberto' then 1
       when resultado = 'visitou' then 2
       when resultado = 'proposta' then 3
       when resultado = 'fechado' then 4
       else 5 end;

-- leads mais quentes (score alto + urgencia)
create or replace view relatorios_hot_leads as
select
  id, nome, telefone, corretor_nome, urgencia, tipo_imovel, regiao, faixa_valor,
  score, dias_em_aberto, ultima_mensagem
from relatorios_leads
where resultado = 'aberto' and score >= 70
order by score desc, urgencia desc;
