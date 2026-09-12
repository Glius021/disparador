# Fotos do site — onde colocar cada arquivo

O site foi construído para **nunca quebrar por falta de imagem**. Enquanto um
arquivo não existe, aquele espaço exibe uma moldura tratada com o nome do
arquivo esperado. Assim que você salvar o arquivo com o nome certo nesta pasta,
ele aparece sozinho — **sem editar HTML, CSS ou JavaScript**.

## Como preparar as fotos

1. Use as fotos **reais** da pizzaria (as do Google Meu Negócio servem).
2. Converta para **WebP** com qualidade ~80. Exemplos:
   - Online: squoosh.app
   - Terminal: `cwebp -q 80 foto.jpg -o foto.webp`
3. Tamanho recomendado pelo uso:
   - `hero/` e `ambiente/` com destaque: **2000 px** de largura
   - `pizzas/` e demais: **1200 px** de largura
4. Salve com **exatamente** o nome listado abaixo.

## Arquivos esperados

### hero/ — abertura e sequência "1 metro"
| Arquivo | O que deve mostrar |
|---|---|
| `pizza-a-metro.webp` | A pizza a metro na horizontal. É a primeira imagem do site — escolha a melhor. Enquadramento bem largo (panorâmico). |
| `pizza-a-metro-mesa.webp` | A pizza a metro inteira sobre a mesa, vista de cima. Também bem larga. |

### pizzas/ — cardápio e seção de doces
| Arquivo | Sabor |
|---|---|
| `pizza-a-metro.webp` | Pizza a Metro |
| `6-queijos.webp` | 6 Queijos |
| `pizzaiolo.webp` | Pizzaiolo |
| `frango-com-catupiry.webp` | Frango com Catupiry Super Cremoso |
| `portuguesa-borda-cheddar.webp` | Portuguesa Borda de Cheddar Efeito Trançada |
| `marguerita.webp` | Marguerita |
| `framista.webp` | Framista |
| `lombo-com-abacaxi.webp` | Lombo com Abacaxi |
| `banana-canela-brigadeiro.webp` | Banana com Canela e Brigadeiro |
| `acai-ovomaltine.webp` | Açaí e Ovo Maltine |
| `ovomaltine-pacoca.webp` | Ovo Maltine e Paçoca |
| `banana-canela-chocolate.webp` | Metade Banana com Canela, Metade Chocolate |

### ambiente/ — galeria do salão
| Arquivo | O que deve mostrar |
|---|---|
| `fachada-mural.webp` | O salão com o mural do Coliseu ao fundo (foto horizontal) |
| `pizza-a-metro-caixa.webp` | A pizza a metro na caixa alongada (foto vertical) |
| `salao.webp` | Mesas e ambiente |
| `forno.webp` | Pizza saindo do forno |
| `mesa-servida.webp` | Mesa servida com a pizza inteira (foto horizontal) |

### brand/ — logotipo (opcional)
Se a pizzaria tiver o logotipo em **PNG com fundo transparente** ou **SVG**,
salve aqui e aponte o caminho em `assets/js/data.js`:

```js
brand: { logo: 'assets/img/brand/bom-cheff.svg' }
```

Sem isso, o site usa o logotipo tipográfico "Bom Cheff", que já faz parte da
identidade visual criada aqui.

## Quero usar outro nome de arquivo

Sem problema: os caminhos ficam todos em `assets/js/data.js`, nos campos
`image` (cardápio), `gallery[].src` (ambiente) e `seo.ogImage` (abertura).
Mude lá e o site acompanha.
