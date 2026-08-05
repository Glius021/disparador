# Relatórios — CRM Hiperpersonalizado

Sincroniza dados do Chatwoot + leads qualificados → tabela `relatorios_leads` no Supabase, pronta pra fazer relatórios customizados, sem depender do Chatwoot.

## Arquitetura

```
┌─ Chatwoot ───────┐
│  conversas,       │
│  contatos,        │     Imobi.IA - Relatorios.json
│  mensagens,       │───→ (n8n, a cada 30min)
│  etiquetas, etc   │
└───────────────────┘
                        ┌─ Supabase ───────────────┐
                        │ relatorios_leads          │
                        │ (consolidacao de tudo)    │
                        │ views de relatorios       │
                        └───────────────────────────┘
```

## Setup

### 1. Cria a tabela no Supabase

Rode `sql/relatorios.sql` no SQL Editor do Supabase.

Isso cria:
- Tabela `relatorios_leads` (consolidacao)
- 4 views pra relatorios prontos:
  - `relatorios_em_andamento` — leads em aberto, ordenados por urgencia + score
  - `relatorios_por_corretor` — performance de cada vendedor
  - `relatorios_funil` — funil de vendas
  - `relatorios_hot_leads` — os mais quentes (score alto + urgencia)

### 2. Importa o workflow no n8n

Importe `Imobi.IA - Relatorios.json`.

### 3. Configura a credencial do Chatwoot

No workflow, node **Puxa Conversas**: seleciona a credencial `Chatwoot API` (Header Auth).

### 4. Seta a env var

No n8n ou no seu servidor, a var `CHATWOOT_TOKEN` precisa ter o `api_access_token` do Chatwoot.

```bash
export CHATWOOT_TOKEN="seu_token_aqui"
```

### 5. Configura o intervalo

O workflow roda manual agora. Pra rodar automático a cada 30min:
1. Clica em **Trigger** no workflow
2. Seleciona **Cron** e coloca `0 */30 * * * *` (a cada 30 min)

Ou deixa manual e chama manualmente quando quiser.

## O que a tabela tem

| Campo | O que é |
|---|---|
| `lead_id` | Link com `leads_qualificados` |
| `conversation_id`, `contact_id`, `inbox_id` | IDs do Chatwoot |
| `nome`, `telefone`, `email` | Dados do contato |
| `canal` | whatsapp \| site |
| `tipo_imovel`, `regiao`, `faixa_valor`, `finalidade`, `urgencia` | Dados da qualificacao |
| `campos_preenchidos` | De 0 a 12, quantos pontos foram coletados |
| `status` | open \| resolved \| snoozed (do Chatwoot) |
| `corretor_id`, `corretor_nome` | Quem esta atribuido |
| `etiquetas` | Labels do Chatwoot |
| `primeira_mensagem`, `ultima_mensagem` | Timestamps |
| `primeira_resposta` | Quando o corretor respondeu pela primeira vez |
| `tempo_resposta_s` | Segundos entre a primeira msg do lead e a resposta do corretor |
| `dias_em_aberto` | Quantos dias a conversa esta aberta |
| `mensagens_lead`, `mensagens_corretor` | Contagem de mensagens |
| `score` | 0-100. Urgencia + qualificacao + tempo resposta + engagement |
| `resultado` | aberto \| visitou \| proposta \| fechado \| perdido \| não interessado |

## Como usar pra relatorios

Agora voce pode fazer queries SQL direto no Supabase pra:

### "Quais sao os leads mais quentes?"

```sql
select * from relatorios_hot_leads;
```

### "Como foi o performance do corretor X no mes?"

```sql
select * from relatorios_por_corretor
where corretor_nome = 'Joao'
and primeira_mensagem >= now() - interval '30 days';
```

### "Qual eh o funil de vendas agora?"

```sql
select * from relatorios_funil;
```

### "Qual a urgencia media dos leads abertos?"

```sql
select 
  urgencia,
  count(*) quantidade,
  round(avg(score), 1) score_medio,
  round(avg(tempo_resposta_s::numeric / 60), 1) resposta_min
from relatorios_leads
where resultado = 'aberto'
group by urgencia
order by quantidade desc;
```

### "Tempo medio de resposta por inbox"

```sql
select
  inbox_id,
  round(avg(tempo_resposta_s::numeric / 60), 1) resposta_min,
  count(*) total_leads
from relatorios_leads
where tempo_resposta_s is not null
and primeira_mensagem >= now() - interval '7 days'
group by inbox_id
order by resposta_min;
```

## Campo `score` — como funciona

Score de 0-100 que calcula o "quão quente" eh um lead:

- **Baseline:** 50
- **Urgencia:** +20 se imediato, +10 se 30 dias
- **Qualificacao:** +2 por campo preenchido (max +20, pois tem 12 campos mas ja tem urgencia/finalidade)
- **Tempo resposta:** +10 se respondemos em menos de 5 min
- **Engagement:** +5 se o lead mandou 5+ mensagens

Total: 50-100

Use pra ordernar leads por prioridade, nao por timestamp.

## Atualizacoes

O workflow rodalado limpa registros mais antigos que 90 dias (opcional, muda na query).

Cada vez que roda, atualiza a tabela toda — se a conversa mudou de status, score recalcula, tudo sincroniza.

Se o lead ja existe em `relatorios_leads`, faz upsert (atualiza). Se eh novo, insere.

## Dashboard

Com essa tabela pronta, voce consegue fazer:
- Metabase: conecta no Supabase e faz dashboards em 5 min
- Superset: mesmo
- React: query a API do Supabase via realtime
- Power BI: export periodico pra CSV

Mas o importante eh ter **os dados seus**, nao presos no Chatwoot. Agora voce consegue.

## Pendente: Resultado e Observacoes

Os campos `resultado` e `observacoes` nao sao preenchidos automaticamente pelo workflow.

Como preencher:
1. Manual: alguem atualiza a tabela conforme negocia
2. Via API: criar um endpoint n8n que puxa do Chatwoot periodico e tenta inferir (ex: se tem "proposta" em uma nota privada recente, marca como "proposta")
3. Via Chatwoot: criar custom fields pra "Resultado" e "Observacoes", que o workflow ja pega via API

A recomendacao eh #3, pra manter tudo centralizado.

## Troubleshooting

### "Nao puxa nenhuma conversa"

- Confere se o `CHATWOOT_TOKEN` ta correto
- Confere se o `account_id` e `chatwoot_url` batem com o seu Chatwoot
- Roda o workflow manualmente pra ver o erro (clica em Execute)

### "Puxa mas nao linka com leads_qualificados"

- O workflow tenta linkar pelo telefone ou pela inbox_id
- Se o telefone nao bateu (numero com/sem DDI, formatacao diferente), o lead fica sem link
- Confere se a tabela `leads_qualificados` tem dados pra aquele contato

### "SQL injection no upsert"

- O workflow usa `updateKey` e `columns` tipados, nao query string livre
- N8n escapa tudo que entra, eh safe

