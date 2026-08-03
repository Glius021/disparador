# Imobi.IA — recepção e qualificação de leads

A Isis recepciona o lead no WhatsApp, pede permissão antes de perguntar, qualifica os
12 pontos da busca por imóvel e entrega um resumo pronto para o vendedor no Chatwoot.

## Arquivos

| Arquivo | O que é |
|---|---|
| `Imobi.IA.json` | Workflow principal (webhook Evolution → Isis → resposta no WhatsApp) |
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

## Instalação

### 1. Banco

Rode `sql/leads_qualificados.sql` no SQL Editor do Supabase.

### 2. Importe os dois workflows

Importe `Imobi.IA - Encaminhamento CRM.json` **primeiro** — o principal precisa do ID dele.

### 3. Credencial do Chatwoot

Em n8n → Credentials → **Header Auth**, com o nome exato `Chatwoot API`:

- Name: `api_access_token`
- Value: o token do seu perfil no Chatwoot (Perfil → Access Token)

### 4. Configure o encaminhamento

No workflow `Imobi.IA - Encaminhamento CRM`, abra o node **Config CRM**:

| Campo | O que é |
|---|---|
| `chatwoot_url` | URL do Chatwoot, sem barra no fim |
| `chatwoot_account_id` | ID da conta (aparece na URL: `/app/accounts/1/…`) |
| `chatwoot_inbox_id` | ID da inbox ligada à Evolution |
| `chatwoot_assignee_id` | ID do corretor. **Deixe vazio** para a conversa cair na fila do time |
| `chatwoot_etiquetas` | Labels separadas por vírgula |
| `vendedor_whatsapp` | Número que recebe o aviso, com DDI (`5521999999999`) |
| `evolution_instance` | Nome da instância na Evolution |
| `pausa_isis_segundos` | Quanto tempo a Isis fica calada após o handoff (padrão 24h) |

### 5. Ligue a tool ao sub-workflow

Salve o sub-workflow, copie o ID dele da URL (`/workflow/<ID>`), abra o workflow
principal, node **encaminhamento**, e cole no lugar de
`COLE_AQUI_O_ID_DO_WORKFLOW_ENCAMINHAMENTO`.

### 6. Webhook

Aponte o webhook `messages.upsert` da Evolution para a URL do node `Webhook EVO`.

## O que acontece no encaminhamento

Quando a Isis chama a tool `encaminhamento`, o sub-workflow:

1. Grava o lead em `leads_qualificados` no Supabase.
2. Busca o contato no Chatwoot pelo telefone e cria se não existir.
3. Reaproveita a conversa aberta do lead, ou abre uma nova.
4. Posta o resumo como **nota privada** — o lead não vê.
5. Aplica as etiquetas e atribui ao corretor, se houver um definido.
6. Manda o resumo no WhatsApp do vendedor, com link `wa.me` para responder direto.
7. Pausa a Isis por 24h (chave `<telefone>_block` no Redis), para ela não falar por cima
   do corretor. Isso usa o mesmo mecanismo do `PARAR ISIS1` que já existia no fluxo.

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

## Mudanças feitas no workflow principal

- **Tool `encaminhamento` criada.** O prompt já mandava chamá-la, mas a ferramenta não
  existia no fluxo — o agente nunca conseguiria encaminhar ninguém. Esse era o elo faltante.
- **Prompt da Isis reescrito** com o pedido de permissão, captura de nome, uma pergunta
  por mensagem, reações humanas, sinais de progresso e os parâmetros da tool.
- **Removidas as tools `func_agenda` e `func_consulta_agenda`**, que apontavam para
  workflows de agendamento de banho e tosa de petshop.
- **`Config` corrigido**: o campo `name` lia `$json.response.name`, que não existe nesse
  ponto do fluxo e chegava vazio no agente. Agora usa o `pushName` do WhatsApp. Também
  passei o `telefone` para o agente, que precisa dele no resumo.
- **`Isis Gerente`**: o texto de entrada concatenava `$('Redis').item.json.text`, campo
  que o node Redis de `push` não devolve. Ficou só a lista de mensagens agrupadas.
- **Splitter de mensagens** reescrito — dividia código PIX de petshop.
- **`app: "petshop"` → `"imobiliaria"`** nos nodes da tabela `chats`.

## Antes de colocar no ar

O RAG (`busca_informacao`) ainda aponta para a base `documents` com o conteúdo antigo.
Suba os documentos da imobiliária (regiões atendidas, condições, processo de locação)
para o Supabase Vector Store, senão a Isis vai responder dúvidas com material do petshop.
Os nodes `Deleta Conteúdo Documentos` e `Cria Tabela Documentos` no canto do canvas
ajudam nisso.
