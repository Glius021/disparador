/**
 * PIZZARIA BOM CHEFF — fonte única de conteúdo.
 * ---------------------------------------------------------------------------
 * REGRA DE OURO: nada aqui é inventado. Todo campo abaixo veio da ficha do
 * Google Meu Negócio da pizzaria ou foi informado diretamente pelo proprietário.
 *
 * Campos com `null` ou `""` são LACUNAS CONHECIDAS. A interface foi construída
 * para lidar com eles sem quebrar: o bloco correspondente simplesmente não é
 * renderizado. Preencha quando tiver o dado confirmado — não invente.
 *
 * Para atualizar o site você quase nunca precisa tocar em HTML ou CSS.
 * Mexa aqui.
 * ---------------------------------------------------------------------------
 */

export const BOM_CHEFF = {

  /* === MARCA ============================================================ */
  brand: {
    name: 'Bom Cheff',
    legalName: 'Pizzaria Bom Cheff',
    tagline: 'Pizzaria',
    city: 'São João Nepomuceno',
    state: 'MG',
    /* Logo oficial. Deixe `null` para usar o logotipo tipográfico do site.
       Assim que houver um PNG/SVG transparente de boa qualidade, aponte aqui. */
    logo: null, // ex.: 'assets/img/brand/bom-cheff.svg'
  },

  /* === CONTATO ========================================================== */
  contact: {
    /* Telefone informado pelo proprietário. Não consta na ficha do Google. */
    phone: '+55 32 99905-8395',
    phoneHref: 'tel:+5532999058395',
    /* O número acima é um celular. Se NÃO houver WhatsApp nesta linha,
       troque `whatsapp` para null e o botão some do site inteiro. */
    whatsapp: 'https://wa.me/5532999058395',
    whatsappMessage: 'Olá! Vim pelo site e queria fazer um pedido.',
    /* Ainda não informados — deixe null até confirmar. */
    email: null,
    instagram: null,
    /* Link do cardápio externo (iFood, Goomer, PDF...). Null = botão oculto. */
    menuUrl: null,
  },

  /* === ENDEREÇO E LOCALIZAÇÃO =========================================== */
  location: {
    /* A ficha do Google grafa "R. Dr. Gouvea". Confirme com o proprietário se
       a grafia correta é "Gouvea" ou "Gouveia" e ajuste em um lugar só. */
    street: 'R. Dr. Gouvea, 246',
    city: 'São João Nepomuceno',
    state: 'MG',
    postalCode: '36680-078',
    country: 'BR',
    plusCode: 'FX7Q+XR São João Nepomuceno, MG',
    lat: -21.5350944,
    lng: -43.0104001,
    mapsUrl: 'https://www.google.com/maps/place/PIZZARIA+BOM+CHEFF/@-21.5348399,-43.0107421,19z/data=!4m6!3m5!1s0xa2928f91c7da45:0x5a1f51cc0c9ce6c0!8m2!3d-21.5350944!4d-43.0104001!16s%2Fg%2F11dfphx45d',
    directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=-21.5350944,-43.0104001&destination_place_id=ChIJRdrHkY-SKgARwOacDMxRH1o',
  },

  /* === FUNCIONAMENTO ====================================================
     A ficha do Google mostra apenas o horário de ABERTURA ("Abre às 18:00").
     O horário de fechamento e os dias da semana NÃO foram informados —
     por isso não existe uma tabela semanal aqui. Quando o proprietário
     confirmar, preencha `weekly` e a seção passa a exibir a grade completa. */
  hours: {
    opensAt: '18:00',
    note: 'Atendimento a partir das 18h.',
    weekly: null, // ex.: [{ day: 'Terça a domingo', time: '18:00 – 23:30' }]
  },

  /* === SERVIÇOS (conforme ficha do Google) ============================== */
  services: [
    { label: 'Refeição no local', icon: 'table' },
    { label: 'Retirada na porta', icon: 'bag' },
    { label: 'Entrega sem contato', icon: 'moto' },
  ],

  /* === FAIXA DE PREÇO (dado do Google: informado por 28 pessoas) ========= */
  priceRange: {
    display: 'R$ 20–80',
    per: 'por pessoa',
    source: 'Faixa informada por 28 pessoas no Google',
    schema: '$$',
  },

  /* === REPUTAÇÃO (dados reais do Google) ================================ */
  rating: {
    value: 4.7,
    count: 119,
    scale: 5,
  },

  /* === A ASSINATURA: PIZZA A METRO ======================================
     Base factual:
     • "Pizza A Metro" consta nos destaques do cardápio da ficha do Google.
     • A avaliação pública de Natália Gomes (Local Guide) registra: "As pizzas
       têm tamanhos que variam de 4 fatias a 1 metro de comprimento".
     • Uma atualização de visitante publicada na ficha diz, literalmente:
       "Pizza metro ..um metro de pura delícia!!!"
     Nada além disso é afirmado. Número de sabores, peso, bordas e preço
     seguem em aberto — preencha `specs` quando houver confirmação. */
  metro: {
    sizeFrom: '4 fatias',
    sizeTo: '1 metro',
    specs: [], // ex.: [{ label: 'Sabores', value: 'até 3' }]
  },

  /* === CARDÁPIO =========================================================
     Estes são os DESTAQUES DO CARDÁPIO listados na ficha do Google —
     a única lista de sabores confirmada publicamente.

     `note` existe de propósito e está vazio: descrever ingredientes que não
     foram confirmados seria inventar. Escreva uma linha curta por sabor
     quando o proprietário validar, e ela aparece automaticamente no card.

     `image`: caminho dentro de assets/img/pizzas/. Enquanto o arquivo não
     existir, o site exibe uma moldura tratada no lugar (nunca imagem quebrada).
     `price`: mantenha null até ter a tabela oficial. */
  menu: {
    /* Ordem das abas = ordem de leitura. "Salgadas" abre por ter mais itens;
       a pizza a metro já tem a seção inteira dedicada a ela logo acima. */
    categories: [
      { id: 'salgadas', label: 'Salgadas', kicker: 'Os clássicos da casa, do forno para a mesa.' },
      { id: 'doces',    label: 'Doces',    kicker: 'A rodada que ninguém combina e todo mundo pede.' },
      { id: 'metro',    label: 'A Metro',  kicker: 'A assinatura: até um metro de comprimento.' },
    ],
    items: [
      {
        id: 'pizza-a-metro', cat: 'metro', name: 'Pizza a Metro',
        badge: 'Assinatura', note: '', price: null,
        image: 'assets/img/pizzas/pizza-a-metro.webp',
      },
      {
        id: 'seis-queijos', cat: 'salgadas', name: '6 Queijos',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/6-queijos.webp',
      },
      {
        id: 'pizzaiolo', cat: 'salgadas', name: 'Pizzaiolo',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/pizzaiolo.webp',
      },
      {
        id: 'frango-catupiry', cat: 'salgadas',
        name: 'Frango com Catupiry Super Cremoso',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/frango-com-catupiry.webp',
      },
      {
        id: 'portuguesa', cat: 'salgadas',
        name: 'Portuguesa Borda de Cheddar Efeito Trançada',
        badge: 'Borda trançada', note: '', price: null,
        image: 'assets/img/pizzas/portuguesa-borda-cheddar.webp',
      },
      {
        id: 'marguerita', cat: 'salgadas', name: 'Marguerita',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/marguerita.webp',
      },
      {
        id: 'framista', cat: 'salgadas', name: 'Framista',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/framista.webp',
      },
      {
        id: 'lombo-abacaxi', cat: 'salgadas', name: 'Lombo com Abacaxi',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/lombo-com-abacaxi.webp',
      },
      {
        id: 'banana-brigadeiro', cat: 'doces',
        name: 'Banana com Canela e Brigadeiro',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/banana-canela-brigadeiro.webp',
      },
      {
        id: 'acai-ovomaltine', cat: 'doces', name: 'Açaí e Ovo Maltine',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/acai-ovomaltine.webp',
      },
      {
        id: 'ovomaltine-pacoca', cat: 'doces', name: 'Ovo Maltine e Paçoca',
        badge: null, note: '', price: null,
        image: 'assets/img/pizzas/ovomaltine-pacoca.webp',
      },
      {
        id: 'banana-chocolate', cat: 'doces',
        name: 'Metade Banana com Canela, Metade Chocolate',
        badge: 'Meio a meio', note: '', price: null,
        image: 'assets/img/pizzas/banana-canela-chocolate.webp',
      },
    ],
  },

  /* === GALERIA / AMBIENTE ===============================================
     Substitua pelos arquivos reais da pizzaria. Use nomes semânticos e
     mantenha o `alt` descritivo — ele é lido por leitores de tela. */
  gallery: [
    { src: 'assets/img/ambiente/fachada-mural.webp',  alt: 'Salão da Pizzaria Bom Cheff com mural do Coliseu ao fundo', span: 'wide' },
    { src: 'assets/img/ambiente/pizza-a-metro-caixa.webp', alt: 'Pizza a metro servida na caixa alongada', span: 'tall' },
    { src: 'assets/img/ambiente/salao.webp',          alt: 'Mesas do salão da pizzaria', span: null },
    { src: 'assets/img/ambiente/forno.webp',          alt: 'Pizza recém-saída do forno', span: null },
    { src: 'assets/img/ambiente/mesa-servida.webp',   alt: 'Mesa servida com pizza inteira', span: 'wide' },
  ],

  /* === AVALIAÇÕES =======================================================
     Somente avaliações públicas REAIS da ficha do Google. Texto transcrito
     como aparece na ficha, inclusive quando vem truncado pelo próprio Google
     (marcado com `truncated: true`).

     O Google não expõe a nota individual de cada avaliação nesta ficha, então
     o site não exibe estrelas por avaliação — apenas a média geral (4,7).

     `published: false` mantém a avaliação arquivada aqui sem publicá-la. */
  reviews: [
    {
      author: 'Natália Gomes',
      meta: 'Local Guide · 249 avaliações',
      when: '3 anos atrás',
      text: 'Nota 10! Atendimento bom, ambiente bonito, agilidade no pedido, pizza gostosa! As pizzas têm tamanhos que variam de 4 fatias a 1 metro de comprimento 😋.',
      truncated: true,
      published: true,
    },
    {
      author: 'Roberta O Furtado Gomes',
      meta: 'Local Guide · 22 avaliações',
      when: '3 anos atrás',
      text: 'a Pizza estava deliciosa, porém pedimos 3 sabores da pizza de metro e só nos foi entregue 2 sabores, o chefe não leu atentamente o pedido, fiquei um pouco frustrada pois foi a primeira vez que consumi a pizza no local, e com alguns amigos,',
      truncated: true,
      published: true,
    },
    {
      /* Avaliação crítica real (1 avaliação, um ano atrás) sobre demora em
         horário de pico, com resposta pública do proprietário. O conteúdo
         traz ofensa pessoal à equipe, então não é reproduzido no site; o
         problema que ela levanta está tratado, de forma aberta, no bloco
         `transparency` logo abaixo. Mude para `true` se quiser publicá-la. */
      author: 'Gabriel Neves',
      meta: '1 avaliação',
      when: 'um ano atrás',
      text: 'Demora um ano pra ficar pronta a pizza atendente me olhando com cara de bunda nunca mais volto aqui',
      truncated: false,
      published: false,
    },
  ],

  /* Trechos curtos exibidos no resumo de avaliações da própria ficha. */
  reviewHighlights: [
    'Ótimo lugar, pizzas deliciosas, ótimo atendimento, nota 1000',
    'Muitas opções de recheio salgado e tem a opção de doces também.',
    'Vale a pena cada centavo, atendimento mto bom.',
  ],

  /* === TRANSPARÊNCIA ====================================================
     Baseado em avaliação pública real e na resposta pública do proprietário
     na própria ficha do Google, que cita alta demanda em horário de pico e
     compra de mais equipamento para agilizar o atendimento. */
  transparency: {
    title: 'Sábado à noite enche.',
    text: 'Em horário de pico já houve pedidos que demoraram mais do que a gente gostaria — isso aparece nas avaliações e a casa respondeu publicamente, apontando a alta demanda e a compra de mais equipamento para agilizar o preparo. Se for sábado depois das 20h, vale encomendar antes.',
    ctaLabel: 'Encomendar pelo telefone',
  },

  /* Citação real publicada como atualização de visitante na ficha do Google. */
  visitorQuote: {
    text: 'Pizza metro… um metro de pura delícia!!!',
    when: 'Atualização de visitante no Google · 2 anos atrás',
  },

  /* === SEO ============================================================== */
  seo: {
    title: 'Pizzaria Bom Cheff | São João Nepomuceno - MG',
    description: 'Pizzaria em São João Nepomuceno (MG) com pizzas de 4 fatias até 1 metro de comprimento. Sabores salgados e doces, atendimento no salão, retirada e entrega. 4,7 no Google com 119 avaliações.',
    url: '',
    ogImage: 'assets/img/hero/pizza-a-metro.webp',
  },
};

export default BOM_CHEFF;
