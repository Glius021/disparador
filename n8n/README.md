# Imobi.IA — recepção e qualificação de leads

A Isis recepciona o lead pelo WhatsApp **ou** pelo chat do site, pede permissão antes de
perguntar, qualifica os 12 pontos da busca por imóvel e entrega um resumo pronto para o
vendedor no Chatwoot.

## Arquitetura

```
Imobi.IA.json  ──────────┐
(webhook Evolution)      │
                          ├──▶  Imobi.IA - Cerebro.json  ──▶  encaminhamento
Imobi.IA -                │     (prompt, memória, RAG)         │
Canal Site.json  ─────────┘                                    ▼
(webhook Chatwoot)                                Imobi.IA - Encaminhamento
        ▲                                           CRM.json (Supabase +
        │                                           Chatwoot + aviso WhatsApp)
        │
Imobi.IA - Follow-up.json
(agenda 30min — lê as conversas
 e cutuca quem parou de responder)
```

Prompt, memória de conversa e a tool `encaminhamento` moraram sempre só no **Cérebro**.
Os dois canais são só encanamento: recebem a mensagem no formato de cada plataforma,
chamam o Cérebro, e devolvem a resposta pelo canal certo. Editar o prompt no Cérebro vale
para WhatsApp e site ao mesmo tempo — sem duas cópias divergindo.

O **Follow-up** é o único que não é disparado por mensagem de ninguém: ele acorda sozinho
de tempos em tempos, lê as conversas que já existem no Chatwoot e decide pelo relógio.
Por isso não passa pelo Cérebro — não há conversa em andamento para continuar, e a
memória do Cérebro é de qualificação, não de reengajamento.

## Arquivos

| Arquivo | O que é |
|---|---|
| `Imobi.IA.json` | Canal WhatsApp (webhook Evolution → Cérebro → resposta) |
| `Imobi.IA - Canal Site.json` | Canal site (webhook Chatwoot → Cérebro → resposta) |
| `Imobi.IA - Cerebro.json` | Agente Isis: prompt, memória, RAG e a tool `encaminhamento` |
| `Imobi.IA - Encaminhamento CRM.json` | Sub-workflow chamado pela tool `encaminhamento` |
| `Imobi.IA - Follow-up.json` | Agente de follow-up: lê as conversas e cutuca quem sumiu |
| `sql/leads_qualificados.sql` | Tabela dos leads no Supabase |
| `sql/followups.sql` | Tabela que registra os follow-ups já enviados |

## O que a Isis coleta

Tipo de imóvel · Região desejada · Faixa de valor · Compra ou locação · Urgência ·
Financiamento · Nº de moradores · Vaga de garagem · Suíte · Aceita pets ·
Área de lazer · Metragem mínima

O fluxo da conversa é: recepção e nome → **pedido de permissão** ("vou te fazer algumas
perguntas rápidas para entender melhor a sua busca, tudo bem?") → uma pergunta por
mensagem, com reação humana entre elas → resumo → encaminhamento.

Regras que evitam o efeito formulário:

- Nunca pergunta o que o lead já respondeu. Se ele diz "quero comprar um apartamento de
  até 500 mil na Barra, somos 3 e precisamos de 2 vagas", a Isis registra os 5 campos de
  uma vez e continua do ponto seguinte.
- Uma pergunta por mensagem, nunca duas juntas.
- Sinal de progresso a cada 4–5 perguntas ("faltam pouquinhas, viu?").
- Se o lead não sabe ou não quer responder, registra `Não informado` / `Indiferente` e
  segue. A qualificação incompleta não bloqueia o encaminhamento.
- Se o lead pede um corretor, encaminha na hora com o que já tiver.
- `Financiamento` é pulado quando é locação.
- No canal **site** a Isis não tem o telefone do lead de graça (como tem no WhatsApp), então
  pede o WhatsApp perto do fim da qualificação, explicando o motivo. Se o lead não quiser
  informar, encaminha do mesmo jeito com "Não informado".

## Instalação

### 1. Banco

Rode `sql/leads_qualificados.sql` no SQL Editor do Supabase. Se você já rodou a versão
anterior deste arquivo, role até o bloco `MIGRACAO` no final e rode só ele.

Rode também `sql/followups.sql`, no **mesmo banco** — é a tabela que o agente de follow-up
usa para não cutucar o mesmo lead duas vezes.

### 2. Importe os workflows nesta ordem

1. `Imobi.IA - Encaminhamento CRM.json`
2. `Imobi.IA - Cerebro.json` (a tool `encaminhamento` dentro dele precisa do ID do passo 1)
3. `Imobi.IA.json` e `Imobi.IA - Canal Site.json` (os dois precisam do ID do passo 2)
4. `Imobi.IA - Follow-up.json` (independente — não precisa do ID de ninguém)

### 3. Credencial do Chatwoot

Em n8n → Credentials → **Header Auth**, com o nome exato `Chatwoot API`:

- Name: `api_access_token`
- Value: o token do seu perfil no Chatwoot (Perfil → Access Token)

Essa mesma credencial é usada pelo Encaminhamento CRM, pelo Canal Site e pelo Follow-up.

### 4. Configure o encaminhamento

No workflow `Imobi.IA - Encaminhamento CRM`, abra o node **Config CRM**:

| Campo | O que é |
|---|---|
| `chatwoot_url` | URL do Chatwoot, sem barra no fim |
| `chatwoot_account_id` | ID da conta (aparece na URL: `/app/accounts/1/…`) |
| `chatwoot_inbox_id` | ID da inbox ligada à Evolution (a do WhatsApp) |
| `chatwoot_assignee_id` | ID do corretor. **Deixe vazio** para a conversa cair na fila do time |
| `chatwoot_etiquetas` | Labels separadas por vírgula |
| `vendedor_whatsapp` | Número que recebe o aviso, com DDI (`5521999999999`) |
| `evolution_instance` | Nome da instância na Evolution |
| `pausa_isis_segundos` | Quanto tempo a Isis fica calada após o handoff (padrão 24h) |

### Mapa de IDs — preencha conforme for importando

Cada workflow recebe um ID proprio do n8n (aparece na URL: `/workflow/<ID>`).
Tres campos precisam apontar para o ID **de outro** workflow. Anote aqui para nao trocar:

| Workflow | ID dele | Quem aponta para ele |
|---|---|---|
| `Imobi.IA - Cerebro` | `zyUMRBwNp8S0mEXC` | `Imobi.IA` → node **Isis Gerente**<br>`Imobi.IA - Canal Site` → node **Chama Cérebro** |
| `Imobi.IA - Encaminhamento CRM` | *(preencher)* | `Imobi.IA - Cerebro` → node **encaminhamento** |
| `Imobi.IA - Canal Site` | `9zcCejCbLK1iQbVd` | ninguem (entrada pelo webhook) |
| `Imobi.IA` | — | ninguem (entrada pelo webhook) |
| `Imobi.IA - Follow-up` | — | ninguem (entrada pela agenda) |

> **Atencao:** nunca aponte o node `encaminhamento` para o ID do proprio Cerebro.
> O Cerebro passaria a chamar a si mesmo a cada qualificacao concluida, criando
> recursao infinita — execucao travada e consumo continuo de credito da OpenAI.

### 5. Ligue a tool ao sub-workflow (dentro do Cérebro)

Salve `Imobi.IA - Encaminhamento CRM`, copie o ID dele da URL (`/workflow/<ID>`), abra
`Imobi.IA - Cerebro`, node **encaminhamento**, e cole no lugar de
`COLE_AQUI_O_ID_DO_WORKFLOW_ENCAMINHAMENTO`.

### 6. Ligue os dois canais ao Cérebro

Salve `Imobi.IA - Cerebro`, copie o ID dele, e cole em:

- `Imobi.IA.json`, node **Isis Gerente** → campo `workflowId`
- `Imobi.IA - Canal Site.json`, node **Chama Cérebro** → campo `workflowId`

### 7. Webhook do WhatsApp

Aponte o webhook `messages.upsert` da Evolution para a URL do node `Webhook EVO`.

### 8. Canal do site

No workflow `Imobi.IA - Canal Site`, abra o node **Config Site** e preencha
`chatwoot_url`, `chatwoot_account_id` e `chatwoot_inbox_id` — **desta vez o inbox é o do
widget do site**, não o do WhatsApp (crie um se ainda não tiver: Chatwoot → Settings →
Inboxes → **Website**, e copie o ID dele).

Depois, no Chatwoot: Settings → Integrations → Webhooks → adicione a URL de produção do
node `Webhook Chatwoot` (`.../webhook/chatwoot-site`), marcando **apenas** o evento
`message_created`.

Esse webhook é da conta inteira, não de uma inbox. É proposital: é assim que a resposta de
um corretor na inbox do **WhatsApp** também consegue calar a Isis.

Por fim, cole em seu site o script que o Chatwoot te dá na tela de configuração da inbox
(Settings → Inboxes → sua inbox → **Configuração do widget**). É um `<script>` para colar
antes do `</body>`.

### 9. Agente de follow-up

Abra `Imobi.IA - Follow-up`, node **Config Follow-up**:

| Campo | O que é |
|---|---|
| `chatwoot_url` | Mesma URL do Chatwoot |
| `chatwoot_account_id` | Mesmo ID de conta |
| `inbox_whatsapp_id` | ID da inbox do WhatsApp |
| `inbox_site_id` | ID da inbox do widget do site |
| `chatwoot_status` | Quais conversas varrer (`open`, ou `open,pending`) |
| `chatwoot_paginas` | Quantas páginas de 25 conversas puxar por rodada (2 = 50) |
| `bot_agent_id` | Só se o seu Chatwoot não devolver `content_attributes` — veja abaixo |
| `evolution_instance` | Nome da instância na Evolution |
| `etapas_horas` | A cadência, em **horas acumuladas desde a mensagem sem resposta**. Padrão `3,8,12` |
| `max_horas_conversa` | Depois disso a conversa é velha demais e sai do radar (padrão 336 = 14 dias) |
| `alerta_corretor_horas` | Lead esperando resposta há mais que isso vira nota interna. `0` desliga |
| `horario_inicio` / `horario_fim` | Janela de envio (padrão 8h–20h, com as 20:00 cravadas ainda valendo) |
| `antecipacao_minutos` | Tolerância da rodada de fechamento (padrão 5). Negativo desliga a antecipação |
| `dias_semana` | `1` = segunda … `7` = domingo. Padrão `1,2,3,4,5,6` |
| `timezone` | Fuso do horário comercial (padrão `America/Sao_Paulo`) |
| `limite_conversas` | Teto de conversas avaliadas por rodada |

O workflow roda com `timezone` própria (`America/Sao_Paulo`) nas configurações, e o
gatilho é um cron `0,30 * * * *` — não "a cada 30 minutos". A diferença importa: o
intervalo do n8n ancora no minuto em que o workflow foi ativado, então as rodadas cairiam
em 19:47, 20:17… e nunca em 20:00 cravado. A regra de fechamento depende de existir uma
rodada às 20:00.

Deixar `inbox_whatsapp_id` e `inbox_site_id` vazios funciona: sem eles o canal é inferido
pelo telefone do contato (tem número → WhatsApp). Preencher é mais seguro, porque aí
inboxes que não são da Isis ficam de fora.

Depois é só ativar o workflow. O gatilho é uma agenda de 30 em 30 minutos, não um webhook —
não há nada para configurar no Chatwoot nem na Evolution.

## O que acontece no encaminhamento

Quando a Isis chama a tool `encaminhamento`, o sub-workflow:

1. Grava o lead em `leads_qualificados` no Supabase, com o canal de origem.
2. Busca o contato no Chatwoot pelo telefone e cria se não existir.
3. Reaproveita a conversa aberta do lead, ou abre uma nova.
4. Posta o resumo como **nota privada** — o lead não vê.
5. Aplica as etiquetas e atribui ao corretor, se houver um definido.
6. Manda o resumo no WhatsApp do vendedor, com link `wa.me` para responder direto (se o
   lead não informou telefone, avisa que o retorno precisa ser pela própria conversa do CRM).
7. Pausa a Isis por 24h para ela não falar por cima do corretor.

A chave de pausa no Redis muda por canal: no WhatsApp é `<remoteJid>_block` (mesma que o
fluxo já usava); no site é `site_<conversation_id>_block`, porque não existe remoteJid.

### Quando o corretor assume a conversa

**Qualquer mensagem que um humano mande para o lead cala a Isis por 24h, em qualquer
canal.** Cada nova mensagem do corretor renova o prazo. São três gatilhos, um para cada
lugar de onde a resposta pode sair:

| Onde o corretor responde | Quem detecta |
|---|---|
| Chatwoot, inbox do site | `É Mensagem do Corretor?` (Canal Site) |
| Chatwoot, inbox do WhatsApp | `É Mensagem do Corretor?` (Canal Site) |
| Celular ou WhatsApp Web, direto | `Switch6` → `PARAR ISIS1` (Imobi.IA) |

O webhook do Chatwoot é configurado na conta inteira, então ele entrega eventos de todas
as inboxes — por isso o gatilho do Canal Site não filtra por inbox. Ele só filtra na hora
de **responder**, aí sim apenas o widget do site.

#### A pausa segue o lead, não o canal

`Chaves de Pausa` bloqueia a conversa do Chatwoot **e**, se o contato tiver telefone, o
WhatsApp dele também. Quem foi assumido foi a pessoa: se ela migrar do chat do site para o
WhatsApp, a Isis continua calada. O encaminhamento faz o mesmo, pelo node
`Pausa Isis (outro canal)`.

Números sem DDI são normalizados (`21 97710-6822` → `5521977106822`) antes de virarem
chave. Sem isso a chave não bateria com o `remoteJid` que a Evolution usa, e a pausa no
WhatsApp seria gravada num lugar que ninguém lê.

#### Distinguir a Isis de um humano

No Chatwoot, a resposta dela e a do corretor chegam iguais: `message_type: outgoing`. A
Isis assina as próprias mensagens com `content_attributes.isis_bot` — sem isso ela se
calaria ao ouvir o próprio eco. Se a sua versão do Chatwoot não devolver
`content_attributes` no webhook, preencha `bot_agent_id` no **Config Site** com o ID do
usuário dono do token que o n8n usa.

No WhatsApp o problema é o mesmo: a Evolution reemite como `fromMe` tudo que sai pela
instância, inclusive o que a própria Isis mandou. `Marca Msg da Isis` guarda no Redis o id
de cada mensagem enviada por ela (15 min), e `Eco da Isis?` consulta esse id quando o
`fromMe` volta. Se bater, é eco dela e não pausa.

A pausa **não** é disparada por atribuição de corretor. Inboxes com auto atribuição já
nascem com um responsável definido, então isso travaria a Isis antes da primeira resposta.
O gatilho é a mensagem, não a atribuição.

#### Pausa imediata, mesmo com resposta em andamento

Só checar a pausa na entrada não bastava. Entre o debounce (60s no WhatsApp, 8s no site) e
a resposta do LLM passam vários segundos — se o corretor respondesse nessa janela, a Isis
já tinha passado pela conferência e falava por cima dele. Agora o bloqueio é reconferido
na hora de enviar:

- **Site:** `Corretor Respondeu Enquanto Isso?`, entre o Cérebro e a resposta.
- **WhatsApp:** `Corretor Assumiu?`, dentro do loop de envio. Como roda antes de cada
  parte, ela também interrompe no meio um envio quebrado em várias mensagens.

O `PARAR ISIS1` também estava sem TTL definido — o n8n aplicava o padrão de 60 segundos, o
que dava ao corretor apenas um minuto de silêncio. Agora são 24h, igual ao site.

O resumo chega assim:

```
🏠 *NOVO LEAD QUALIFICADO*

Nome: Cris
Telefone: 5521977106822
Tipo de imóvel: Apartamento
Região desejada: Barra da Tijuca
Faixa de valor: Até R$ 750.000
Compra ou locação: Compra
Urgência: Nos próximos 30 dias
Financiamento: Sim
Nº de moradores: 3
Vaga de garagem: 2 vagas
Suíte: Sim
Aceita pets: Sim, um cachorro
Área de lazer: Piscina e academia
Metragem mínima: Não informado
Observações: Tem FGTS para entrada

📊 Qualificação: 11/12 campos
🕒 03/08/2026, 15:49
💬 Falar com o lead: wa.me/5521977106822
```

Se o Chatwoot estiver fora do ar, os nodes dele estão em `continueRegularOutput`: o lead
ainda é gravado no Supabase e o vendedor ainda recebe o WhatsApp. O handoff não se perde.

## Como o canal site funciona por dentro

1. **Webhook** recebe todo evento do Chatwoot e filtra: só segue para responder se for
   `message_created`, vindo do contato (`message_type: incoming`), não for nota privada, e
   for da inbox certa.
2. **Verifica Pausa** — se a Isis estiver bloqueada para aquela conversa (handoff recente
   ou corretor assumiu), não responde.
3. **Debounce de 8s** — agrupa mensagens digitadas em sequência antes de responder, como o
   WhatsApp faz com 60s. No chat de site o visitante espera resposta rápida, por isso o
   tempo é bem menor — ele existe só para não responder a cada tecla enquanto a pessoa
   ainda está digitando a ideia completa.
4. Chama o **Cérebro** passando `canal: "site"` e `session_id: "site_<conversation_id>"`
   — cada conversa do Chatwoot vira uma sessão de memória própria.
5. **Responde no Chatwoot** via API, como mensagem normal (não nota) — aparece pro
   visitante no widget.

Diferente do WhatsApp, o canal site não duplica o histórico nas tabelas `chats` /
`chat_messages` — a memória de conversa do agente (`n8n_chat_histories`, via
Postgres Chat Memory) já é suficiente, e o próprio Chatwoot já guarda o histórico da
conversa. Se quiser os mesmos relatórios que o WhatsApp tem nessas tabelas, dá para
replicar os nodes `Adiciona/Atualiza CHAT Supabase` e `Cria Histórico Supabase1`.

## O agente de follow-up

Quem responde a Isis até o fim vira lead qualificado. O problema é quem não responde: a
conversa fica pela metade, ninguém é avisado, e o lead simplesmente evapora. Nenhum dos
outros workflows resolve isso, porque todos eles só acordam quando chega uma mensagem — e
o silêncio, por definição, não dispara webhook nenhum.

`Imobi.IA - Follow-up` é o único workflow com gatilho de **agenda**. A cada meia hora ele lê as
conversas abertas do Chatwoot e decide pelo relógio.

### A decisão

Tudo gira em torno de duas perguntas: **quem falou por último** e **há quantas horas**.

| Quem falou por último | O que acontece |
|---|---|
| **Isis** | O lead sumiu no meio da qualificação. É o caso de follow-up: cutuca 3h, 8h e 12h depois |
| **Lead** | Ele perguntou e ninguém respondeu. Não se manda follow-up para quem está esperando — vira nota privada para o corretor |
| **Corretor** | Humano no controle. O agente não faz nada, nem mensagem nem alerta |

A terceira linha é a mesma regra que vale no resto do sistema: a Isis não fala por cima de
um corretor. Aqui ela é aplicada duas vezes, por caminhos independentes — pela leitura de
quem assinou a última mensagem, e pela chave de pausa no Redis, conferida logo antes de
escrever. Se o corretor respondeu no minuto anterior, o follow-up morre na conferência.

### A cadência

`etapas_horas = 3,8,12` são **horas acumuladas desde a mensagem que ficou sem resposta** —
não intervalos de um follow-up para o outro. Lead parou de responder às 8h da manhã:

| | Vence | Sai |
|---|---|---|
| 1ª cutucada | 8h + 3h | **11:00** |
| 2ª cutucada | 8h + 8h | **16:00** |
| 3ª cutucada | 8h + 12h | **20:00** |

Depois disso, silêncio — o agente não insiste mais.

O que segura essas horas no lugar é a **âncora**: o instante da mensagem sem resposta,
gravado em `followups_enviados.ancora_em` pelo primeiro follow-up da sequência e reusado
pelos seguintes. Se cada etapa contasse a partir da anterior, um follow-up atrasado —
por horário comercial, por queda do n8n — empurraria todos os outros, e a sequência
inteira escorregaria para a madrugada.

**A resposta do lead encerra a sequência.** Se ele volta a falar, os follow-ups anteriores
deixam de contar; se sumir de novo, começa outra cadência, com âncora nova, da etapa 1.

Cada envio é gravado em `followups_enviados`. É essa tabela que impede a mesma etapa de
sair duas vezes — inclusive se duas rodadas se cruzarem.

### O horário manda na cadência

Nada sai fora de **8h–20h** (a rodada das 20:00 cravadas ainda conta; 20:01 já não).
Follow-up é mensagem não solicitada: às 3 da manhã ela irrita em vez de recuperar o lead.

Quando uma etapa venceria fora da janela, valem duas regras:

- **Venceria de madrugada → sai às 20:00.** Na rodada do fechamento, o agente olha se a
  próxima etapa vence antes da abertura do dia seguinte; se vencer, manda ali mesmo, em
  vez de deixar o lead sem notícia até de manhã. É o que o `*` marca no exemplo abaixo.
- **As etapas não se amontoam.** Uma etapa atrasada pela janela não faz as seguintes
  saírem em rodadas consecutivas de 30 min: cada uma respeita também o intervalo que a
  cadência previa entre ela e a anterior (com `3,8,12`, 5h e depois 4h).

Lead parou às 14:00, e depois às 19:00:

```
parou 14:00 →  17:00 (1ª)   20:00 (2ª*)   08:00 do dia seguinte (3ª)
parou 19:00 →  20:00 (1ª*)  08:00 (2ª)    12:00 (3ª)
```

Sábado à noite com domingo fora dos `dias_semana`, a conta pula o domingo inteiro:
`Sáb 20:00 (1ª*) → Seg 08:00 (2ª) → Seg 12:00 (3ª)`.

> Na primeira ativação, toda conversa parada dentro de `max_horas_conversa` entra na
> cadência. Se a caixa tiver histórico acumulado, baixe `max_horas_conversa` (para 48,
> por exemplo) na primeira rodada para não cutucar um mês de leads de uma vez.

### O texto

O agente **lê a conversa inteira** (últimas 20 mensagens, com quem falou e quando) e
escreve a mensagem a partir dela. Não há template fixo: a etapa define o tom — cutucada
leve, oferta de atalho, despedida elegante — e o histórico define o conteúdo, para que a
mensagem retome o assunto real em vez de mandar um "oi, tudo bem?" genérico.

O prompt proíbe explicitamente inventar imóvel, valor ou disponibilidade, prometer ligação
de corretor, cobrar o lead ("você sumiu", "estou esperando") e repetir literalmente a
pergunta anterior. Se o modelo devolver algo vazio ou quebrado, `Mensagem Pronta` limpa a
saída e, no pior caso, usa um texto de reserva — nunca se envia mensagem em branco.

### Por que o agente marca a própria mensagem

Esta é a parte que quebra silenciosamente se alguém mexer. O follow-up sai pelos **mesmos
canais** que a Isis usa, então ele volta como um evento de mensagem enviada — e os dois
canais tratam mensagem de saída não reconhecida como "um humano assumiu", pausando a Isis
por 24h. Sem cuidado, o agente calaria a Isis toda vez que cutucasse alguém.

| Canal | Como o follow-up se identifica | Quem confere |
|---|---|---|
| WhatsApp | `Marca Msg da Isis` grava `isis_msg_<id>` no Redis por 15 min | `Eco da Isis?` (Imobi.IA) |
| Site | O POST vai com `content_attributes.isis_bot` | `É Mensagem do Corretor?` (Canal Site) |

São exatamente os mesmos mecanismos que os canais já usavam para não ouvir o próprio eco.
O follow-up só se pendura neles.

### Por que grava na memória do Cérebro

Depois de enviar, `Grava na Memória da Isis` insere a mensagem em `n8n_chat_histories`
como se fosse uma fala normal do agente. Sem isso a Isis não lembraria de ter cutucado: o
lead responderia "pode ser" três dias depois e ela repetiria a pergunta do zero, como se
nada tivesse acontecido.

A sessão é resolvida por canal: no site é `site_<conversation_id>`; no WhatsApp é o uuid
que o fluxo principal guardou em `dados_cliente` na primeira mensagem do lead. Se a sessão
não existir, o insert não grava nada e o envio segue — o `where t.sid is not null` no SQL
existe para isso.

### Quando ele não faz nada

- Fora do horário comercial (`horario_inicio`/`horario_fim`/`dias_semana`). A rodada
  inteira nem chega a consultar o Chatwoot.
- Conversa parada há mais de `max_horas_conversa` (padrão 14 dias).
- Chave de pausa presente no Redis — handoff recente ou corretor respondendo agora.
- Conversa de WhatsApp sem telefone no contato, ou de uma inbox que não é da Isis.
- Etapa já enviada e a próxima janela ainda não venceu.

Cada uma dessas saídas volta ao loop com um `motivo` legível no output do node
`Decide Follow-up` — é por lá que se descobre por que um lead específico não foi cutucado.

### Quando alguma peça cai

Uma conversa com problema é pulada; a rodada continua nas outras. O que muda é a direção
do erro, e ela não é a mesma em todo lugar:

| Peça fora do ar | O que acontece |
|---|---|
| Redis | A conversa é **pulada**. Sem resposta do Redis não dá para afirmar que a Isis está liberada, e o risco de falar por cima de um corretor é pior que o de atrasar um follow-up |
| `followups_enviados` | A conversa é **pulada**. Sem saber o que já foi enviado, seguir em frente reenviaria a etapa 1 para quem já foi cutucado |
| Chatwoot (leitura) | A conversa fica sem mensagens legíveis e cai em "nada a fazer" |
| Evolution / Chatwoot (envio) | O envio falha e nada é gravado — na próxima janela tenta de novo |

O único ponto que falha para o lado permissivo é o registro **depois** do envio: se a
mensagem sai mas o `insert` não grava, o agente perdeu a memória daquele envio. Não há como
desfazer uma mensagem já entregue, então o node segue adiante em vez de travar a rodada. O
estrago é limitado por construção: o follow-up recém-enviado passa a ser a última mensagem
da conversa, o relógio zera, e só depois de vencer a primeira janela de novo é que sairia
uma cutucada repetida.

### O alerta de lead esperando

Quando a última mensagem é do lead e ninguém respondeu em `alerta_corretor_horas`, o
agente posta uma **nota privada** na conversa do Chatwoot. O lead não vê nada; quem vê é
quem abrir a conversa no CRM. O alerta sai uma vez por mensagem do lead — se ele mandar
outra e continuar sem resposta, sai de novo. Pondo `0` no campo, esse caminho é desligado.

### O que dá para acompanhar

`sql/followups.sql` cria duas views:

- `followups_resumo` — quantos follow-ups saíram por etapa nos últimos 30 dias e em quantos
  deles o lead voltou a falar. É o número que diz se a cadência está valendo a pena.
- `followups_sem_retorno` — quem recebeu a sequência inteira e mesmo assim não voltou.

## Mudanças feitas no workflow original

- **Tool `encaminhamento` criada.** O prompt já mandava chamá-la, mas a ferramenta não
  existia no fluxo — o agente nunca conseguiria encaminhar ninguém. Esse era o elo faltante.
- **Prompt da Isis reescrito** com o pedido de permissão, captura de nome, uma pergunta
  por mensagem, reações humanas, sinais de progresso e os parâmetros da tool.
- **Agente extraído para o Cérebro**, compartilhado entre WhatsApp e site.
- **Removidas as tools `func_agenda` e `func_consulta_agenda`**, que apontavam para
  workflows de agendamento de banho e tosa de petshop.
- **`Config` corrigido**: o campo `name` lia `$json.response.name`, que não existe nesse
  ponto do fluxo e chegava vazio no agente. Agora usa o `pushName` do WhatsApp. Também
  passei o `telefone` para o agente, que precisa dele no resumo.
- **`Isis Gerente`**: o texto de entrada concatenava `$('Redis').item.json.text`, campo
  que o node Redis de `push` não devolve. Ficou só a lista de mensagens agrupadas.
- **Splitter de mensagens** reescrito — dividia código PIX de petshop.
- **`app: "petshop"` → `"imobiliaria"`** nos nodes da tabela `chats`.
- **Resumo do encaminhamento**: corrigido caso o telefone venha vazio (lead do site que
  não quis informar) — antes ficava "Telefone: " em branco e o link `wa.me/` quebrado.

## Antes de colocar no ar

O RAG (`busca_informacao`) ainda aponta para a base `documents` com o conteúdo antigo.
Suba os documentos da imobiliária (regiões atendidas, condições, processo de locação)
para o Supabase Vector Store, senão a Isis vai responder dúvidas com material do petshop.
Os nodes `Deleta Conteúdo Documentos` e `Cria Tabela Documentos` no canto do canvas
ajudam nisso.
