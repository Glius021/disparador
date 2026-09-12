# Pizzaria Bom Cheff — site

Site institucional da Pizzaria Bom Cheff (São João Nepomuceno — MG).
Estático, sem build, sem dependências: HTML + CSS + ES Modules.

```
bomcheff/
├── index.html              estrutura semântica (não guarda conteúdo)
├── favicon.svg
├── assets/
│   ├── css/style.css       sistema visual completo
│   ├── js/
│   │   ├── data.js         ← TODO O CONTEÚDO DO SITE MORA AQUI
│   │   ├── render.js       monta a página a partir do data.js
│   │   ├── motion.js       movimento ligado ao scroll
│   │   └── main.js         inicialização
│   └── img/                fotos (ver assets/img/README.md)
```

## Atualizar o site

Praticamente tudo se resolve em **`assets/js/data.js`**: telefone, endereço,
horário, sabores, avaliações, textos e caminhos das imagens. Não é preciso
tocar em HTML, CSS ou JavaScript para o dia a dia.

Exemplos comuns:

| Quero… | Onde mexer |
|---|---|
| Trocar o telefone | `contact.phone` e `contact.phoneHref` |
| Desligar o botão de WhatsApp | `contact.whatsapp: null` (o botão some do site inteiro) |
| Adicionar link do cardápio (iFood, PDF…) | `contact.menuUrl` |
| Incluir um sabor | novo objeto em `menu.items` |
| Escrever a descrição de um sabor | campo `note` daquele item |
| Publicar preços | campo `price` de cada item |
| Publicar o horário completo | `hours.weekly` |
| Adicionar/ocultar uma avaliação | `reviews[].published` |
| Usar o logotipo oficial | `brand.logo` |

Campos em `null` ou `""` são **lacunas conhecidas** e propositais: o bloco
correspondente simplesmente não aparece, em vez de exibir informação inventada.

## Fotos

Veja **`assets/img/README.md`** — lista o nome exato de cada arquivo.
Enquanto uma foto não existe, o site mostra uma moldura tratada no lugar (nunca
uma imagem quebrada). Salvou o arquivo com o nome certo, ele aparece sozinho.

## Rodar localmente

O site usa ES Modules, então precisa de um servidor HTTP (abrir o arquivo
direto pelo `file://` não funciona):

```bash
cd bomcheff
python3 -m http.server 8080
# abra http://localhost:8080
```

## Publicar

São arquivos estáticos: qualquer hospedagem serve (GitHub Pages, Vercel,
Netlify, Cloudflare Pages). Basta apontar a raiz do site para a pasta
`bomcheff/`. Não há passo de build.

> Atenção: o GitHub Pages deste repositório já publica a pasta `site/`
> (outro projeto) pelo fluxo `.github/workflows/deploy-pages.yml`. Um
> repositório só pode ter **um** site no Pages, então publicar este aqui pelo
> Pages substituiria aquele. Para manter os dois no ar, use uma hospedagem
> separada para este site.

## Decisões técnicas

- **Sem framework.** O conteúdo é pequeno e estável; evitar build mantém o
  carregamento rápido e a manutenção acessível a quem não é desenvolvedor.
- **Um único `requestAnimationFrame`** cuida de todo o movimento ligado ao
  scroll. Os efeitos usam apenas `transform` e `opacity`, então não há reflow
  nem deslocamento de layout.
- **`prefers-reduced-motion`** desliga o movimento de verdade: o bloco fixo
  vira conteúdo empilhado, o cursor personalizado some e nada mais anima.
- **O mapa do Google só carrega quando entra na tela**, para não pesar no
  primeiro carregamento.
