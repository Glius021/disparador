import { createServerFn } from "@tanstack/react-start";

// ============================================================================
// Envio DIRETO para a planilha Google (sem n8n), via Apps Script.
//
// Por que não dá para enviar do navegador direto pela URL da planilha?
// O Google exige autenticação OAuth para gravar em uma Sheets — não existe
// endpoint público de escrita como o link de "compartilhar". A forma mais
// simples e sem servidor externo é um mini-script no próprio editor de
// scripts da planilha (Apps Script), que vira um endpoint HTTP público.
//
// COMO ATIVAR (uma única vez, na planilha):
//   1. Abra: https://docs.google.com/spreadsheets/d/1C9ax2rCwe6DrfR145PUDdCm_C8uh6OS99I7IjDbXbG0/edit
//   2. Menu Extensões > Apps Script.
//   3. Apague o conteúdo e cole o código do bloco abaixo (mais adiante).
//   4. Implantar > Nova implantação > Tipo: "App da Web"
//      - Executar como: Eu
//      - Quem pode acessar: Qualquer pessoa
//   5. Autorize as permissões e copie a URL terminada em /exec.
//   6. Cole essa URL na constante APPS_SCRIPT_URL logo abaixo.
//
// ---------- Código para colar no Apps Script (Code.gs) ----------
/*
function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheets()[0]; // primeira aba
  var d = JSON.parse(e.postData.contents);

  // Lê o cabeçalho da linha 1 e preenche cada coluna pelo nome.
  var headers = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
                    .getValues()[0];
  var row = headers.map(function (h) {
    var key = String(h).toLowerCase().trim();
    if (key.indexOf('nome') === 0) return d.nome || '';
    if (key.indexOf('email') >= 0) return d.email || '';
    if (key.indexOf('empresa') >= 0) return d.empresa || '';
    if (key.indexOf('whats') >= 0 || key.indexOf('telefone') >= 0) return d.whatsapp || '';
    if (key.indexOf('problema') >= 0 || key.indexOf('mensagem') >= 0) return d.mensagem || '';
    if (key.indexOf('data') >= 0 || key.indexOf('timestamp') >= 0) return d.enviadoEm || '';
    return '';
  });
  sheet.appendRow(row);

  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
*/
// ----------------------------------------------------------------
// Observação: na sua planilha a linha de cabeçalho está na linha 2
// ("Nome da empresa", "Canal principal", "Telefone", "Email", "Problema"...).
// Se o script acima gravar na linha errada, ajuste `getRange(1, ...)`
// para `getRange(2, ...)` ou mova os títulos para a linha 1.
// O campo "whatsapp" entra na coluna "Telefone" automaticamente.
// ============================================================================

// URL do App da Web implantado no Apps Script da planilha (termina em /exec).
// Deixe vazio ("") até você implantar o script acima.
// Exemplo do formato esperado:
//   https://script.google.com/macros/s/AKfycbxxxxxxxxXXXXXXXXXXXX/exec
// Dica: você também pode definir a variável de ambiente VITE-ignored "APPS_SCRIPT_URL"
// no painel de hospedagem em vez de editar este arquivo (mais seguro para tokens).
const APPS_SCRIPT_URL =
  (typeof process !== "undefined" && process.env?.APPS_SCRIPT_URL) || "";

export type LeadPayload = {
  nome: string;
  email: string;
  empresa: string;
  whatsapp: string;
  mensagem: string;
};

function clean(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

export const submitLead = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const d = (data ?? {}) as Partial<LeadPayload>;

    const payload: LeadPayload & { origem: string; enviadoEm: string } = {
      nome: clean(d.nome, 120),
      email: clean(d.email, 160),
      empresa: clean(d.empresa, 120),
      whatsapp: clean(d.whatsapp, 24),
      mensagem: clean(d.mensagem, 1500),
      origem: "site-immerse",
      enviadoEm: new Date().toISOString(),
    };

    const problems: string[] = [];
    if (payload.nome.length < 2) problems.push("Informe seu nome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
      problems.push("Informe um e-mail corporativo válido.");
    if (payload.empresa.length < 2) problems.push("Informe o nome da empresa.");
    if (payload.whatsapp.replace(/\D/g, "").length < 10)
      problems.push("Informe um WhatsApp válido (com DDD).");
    if (problems.length > 0) throw new Error(JSON.stringify({ problems }));

    return payload;
  })
  .handler(async (payload) => {
    if (!APPS_SCRIPT_URL) {
      throw new Error(
        "APPS_SCRIPT_URL não configurada. Implante o script do Apps Script na " +
          "planilha (instruções no topo de src/lib/lead.ts) e cole a URL /exec na constante.",
      );
    }

    // O fetch acontece no SERVIDOR: contorna o CORS do Apps Script e mantém
    // a URL do endpoint fora do código visível ao público.
    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      redirect: "follow", // Apps Script responde com 302 para o domínio de execução
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) throw new Error(`Planilha respondeu ${response.status}`);

    const text = await response.text().catch(() => "");
    if (text.includes("<!DOCTYPE") || text.includes("<html")) {
      // Geralmente significa que o app ainda não foi implantado/autorizado.
      throw new Error("O Apps Script retornou uma página de autorização.");
    }

    return { ok: true as const };
  });
