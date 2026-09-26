/**
 * WEB APP — Formulário de Contato → Google Sheets
 * (versão à prova de erros: aceita POST com ou sem corpo JSON)
 *
 * COMO INSTALAR (uma única vez):
 * 1. Abra sua planilha:
 *    https://docs.google.com/spreadsheets/d/1C9ax2rCwe6DrfR145PUDdCm_C8uh6OS99I7IjDbXbG0/edit
 * 2. Menu "Extensões" > "Apps Script"
 * 3. Apague TODO o conteúdo do arquivo Code.gs e cole este código. Salve (Ctrl+S).
 * 4. Menu "Implantar" > "Nova implantação" > ícone de engrenagem > "App da Web"
 *      - Executar como: Eu (sua conta)
 *      - Quem pode acessar: Qualquer pessoa
 * 5. Clique em "Implantar" e autorize as permissões quando solicitado.
 *    Se aparecer "app não verificado": Configurações avançadas > Acessar projeto > Continuar.
 * 6. Copie a "URL do app da web" (termina em /exec) e me envie,
 *    ou cole-a na constante APPS_SCRIPT_URL no arquivo src/lib/lead.ts do site.
 *
 * TESTE (opcional): abra a URL /exec no navegador — deve responder {"ok":true,"ping":"pong"}
 *
 * O script grava cada envio como uma linha nova na aba "Leads",
 * criando a aba e os cabeçalhos automaticamente se não existirem.
 */

var SHEET_NAME = 'Leads';
var HEADERS = ['Timestamp', 'Nome', 'Email', 'Empresa', 'WhatsApp', 'Problema'];

function doPost(e) {
  try {
    var data = {};

    // Aceita JSON no corpo, parâmetros de URL ou formulário — evita
    // erro quando e.postData não existe.
    if (e && e.postData && e.postData.contents) {
      try { data = JSON.parse(e.postData.contents); } catch (ignored) { data = {}; }
    }
    if (e && e.parameter) {
      data.nome      = data.nome      || e.parameter.nome      || '';
      data.email     = data.email     || e.parameter.email     || '';
      data.empresa   = data.empresa   || e.parameter.empresa   || '';
      data.whatsapp  = data.whatsapp  || e.parameter.whatsapp  || '';
      data.mensagem  = data.mensagem  || e.parameter.mensagem  || '';
    }

    if (!data.nome || !data.email) {
      return jsonResponse({ ok: false, error: 'Campos obrigatórios ausentes (nome/email).' });
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Garante os cabeçalhos na 1ª linha
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    }

    sheet.appendRow([
      new Date(),
      String(data.nome).slice(0, 200),
      String(data.email).slice(0, 200),
      String(data.empresa || '').slice(0, 200),
      String(data.whatsapp || '').slice(0, 50),
      String(data.mensagem || '').slice(0, 2000)
    ]);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

// Teste rápido no navegador: <URL>/exec?ping=1 → deve responder {"ok":true,"ping":"pong"}
function doGet(e) {
  try {
    // Permite testar o fluxo de escrita direto pelo navegador:
    // <URL>/exec?nome=Teste&email=t@t.com&empresa=X&whatsapp=11999999999&problema=oi
    if (e && e.parameter && (e.parameter.nome || e.parameter.email)) {
      return doPost(e);
    }
    return jsonResponse({ ok: true, ping: 'pong' });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) });
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
