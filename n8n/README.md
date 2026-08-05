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
                                                    CRM.json (Supabase +
                                                    Chatwoot + aviso WhatsApp)
```

Prompt, memória de conversa e a tool `encaminhamento` moraram sempre só no **Cérebro**.
Os dois canais são só encanamento: recebem a mensagem no formato de cada plataforma,
chamam o Cérebro, e devolvem a resposta pelo canal certo. Editar o prompt no Cérebro vale
para WhatsApp e site ao mesmo tempo — sem duas cópias divergindo.

## Arquivos

| Arquivo | O que é |
|---|---|
| `Imobi.IA.json` | Canal WhatsApp (webhook Evolution → Cérebro → resposta) |
| `Imobi.IA - Canal Site.json` | Canal site (webhook Chatwoot → Cérebro → resposta) |
| `Imobi.IA - Cerebro.json` | Agente Isis: prompt, memória, RAG e a tool `encaminhamento` |
| `Imobi.IA - Encaminhamento CRM.json` | Sub-workflow chamado pela tool `encaminhamento` |
| `sql/leads_qualificados.sql` | Tabela dos leads no Supabase |

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

### 2. Importe os workflows nesta ordem

1. `Imobi.IA - Encaminhamento CRM.json`
2. `Imobi.IA - Cerebro.json` (a tool `encaminhamento` dentro dele precisa do ID do passo 1)
3. `Imobi.IA.json` e `Imobi.IA - Canal Site.json` (os dois precisam do ID do passo 2)

### 3. Credencial do Chatwoot

Em n8n → Credentials → **Header Auth**, com o nome exato `Chatwoot API`:

- Name: `api_access_token`
- Value: o token do seu perfil no Chatwoot (Perfil → Access Token)

Essa mesma credencial é usada pelo Encaminhamento CRM e pelo Canal Site.

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

Por fim, cole em seu site o script que o Chatwoot te dá na tela de configuração da inbox
(Settings → Inboxes → sua inbox → **Configuração do widget**). É um `<script>` para colar
antes do `</body>`.

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

A pausa **não** é disparada por atribuição de corretor no Chatwoot. Inboxes com auto
atribuição já nascem com um responsável definido, então isso travaria a Isis antes dela
responder a primeira mensagem. Se quiser que assumir a conversa manualmente também cale
a Isis, desative a auto atribuição na inbox do widget e me avise que eu religo essa regra.

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
