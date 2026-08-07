-- Registro dos follow-ups que a Isis enviou por conta propria.
-- Rode no SQL Editor do Supabase (mesmo banco de leads_qualificados).
--
-- Essa tabela e a memoria do agente de follow-up: e ela que impede o mesmo
-- lead de receber a mesma cutucada duas vezes, e que diz em qual etapa da
-- cadencia cada conversa parou.

create table if not exists followups_enviados (
  id                 bigserial primary key,
  created_at         timestamptz not null default now(),

  -- de quem e a conversa
  conversation_id    text not null,       -- id da conversa no Chatwoot
  canal              text not null,       -- whatsapp | site
  telefone           text,
  nome               text,

  -- o que foi feito
  status             text not null default 'enviado',  -- enviado | alerta
  etapa              int  not null default 0,          -- 1..N na cadencia; 0 = alerta interno
  horas_sem_resposta numeric,
  ultima_de          text,                -- lead | isis | corretor (quem falou por ultimo)
  mensagem           text,

  -- Instante da mensagem que ficou sem resposta. As etapas sao horas contadas
  -- DAQUI, nao de um follow-up para o outro: com 3,8,12 e o lead parando as
  -- 08h, as cutucadas caem 11h, 16h e 20h. O primeiro follow-up da sequencia
  -- grava a ancora e os seguintes reusam ela — sem isso, um follow-up atrasado
  -- empurraria todos os outros para frente e a sequencia escorregaria.
  ancora_em          timestamptz
);

-- A busca do agente e sempre "o que ja fiz nesta conversa, do mais novo pro mais velho".
create index if not exists idx_followups_conversa
  on followups_enviados (conversation_id, canal, created_at desc);
create index if not exists idx_followups_created_at
  on followups_enviados (created_at desc);
create index if not exists idx_followups_status
  on followups_enviados (status);

-- Nao ha unique(conversation_id, canal, etapa) de proposito: se o lead volta a
-- responder e some de novo, a cadencia recomeca do zero e a etapa 1 pode se
-- repetir na mesma conversa. Quem separa uma sequencia da outra e a data da
-- ultima mensagem do lead, comparada em tempo de execucao.

-- Quanto a cadencia esta rendendo: quantos follow-ups foram enviados por etapa
-- e em quantos deles o lead voltou a falar depois.
create or replace view followups_resumo as
select
  f.etapa,
  count(*)                                                     enviados,
  count(*) filter (where r.ultima_mensagem > f.created_at)      responderam,
  round(
    count(*) filter (where r.ultima_mensagem > f.created_at)::numeric
    / nullif(count(*), 0) * 100
  , 1)                                                          taxa_resposta
from followups_enviados f
left join relatorios_leads r
  on r.conversation_id = f.conversation_id and r.canal = f.canal
where f.status = 'enviado'
  and f.created_at >= now() - interval '30 days'
group by f.etapa
order by f.etapa;

-- Leads que receberam a cadencia inteira e mesmo assim nao voltaram:
-- lista boa para o corretor tentar por outro caminho, ou para descartar.
create or replace view followups_sem_retorno as
select
  f.conversation_id,
  f.canal,
  max(f.nome)                nome,
  max(f.telefone)            telefone,
  max(f.etapa)               ultima_etapa,
  max(f.created_at)          ultimo_followup,
  max(f.horas_sem_resposta)  horas_sem_resposta
from followups_enviados f
where f.status = 'enviado'
group by f.conversation_id, f.canal
having max(f.created_at) < now() - interval '3 days'
order by ultimo_followup desc;
