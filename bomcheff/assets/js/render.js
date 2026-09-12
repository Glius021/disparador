/**
 * Camada de renderização: transforma `data.js` em DOM.
 * Nenhum texto de conteúdo vive no HTML — tudo vem do objeto de dados,
 * então atualizar o site é editar um arquivo só.
 */
import { BOM_CHEFF as D } from './data.js';

/* --- utilitários -------------------------------------------------------- */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* SVG vive em outro namespace: criado com createElement puro, o elemento nasce
   como HTML desconhecido e não desenha nada. */
const SVG_NS = 'http://www.w3.org/2000/svg';
const SVG_TAGS = new Set(['svg', 'path', 'g', 'circle', 'rect', 'line', 'polygon', 'polyline', 'ellipse', 'defs', 'use', 'title']);

function el(tag, props = {}, ...kids) {
  const n = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k === 'dataset') Object.assign(n.dataset, v);
    else if (k.startsWith('on')) n.addEventListener(k.slice(2).toLowerCase(), v);
    else n.setAttribute(k, v === true ? '' : String(v)); // serve a HTML e SVG
  }
  for (const kid of kids.flat()) {
    if (kid === null || kid === undefined || kid === false) continue;
    n.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return n;
}

/**
 * Slot de imagem tolerante a falhas.
 * Desenha primeiro a moldura tratada, tenta carregar o arquivo real em
 * segundo plano e só troca quando ele existe. Resultado: nunca há ícone de
 * imagem quebrada, nem salto de layout, nem seção vazia.
 */
function mediaSlot(src, alt, { eager = false, className = '' } = {}) {
  const file = src ? src.split('/').pop() : 'arquivo ainda não definido';
  const ph = el('div', { class: `ph ${className}`.trim(), role: 'img', 'aria-label': alt || 'Foto em breve' },
    el('span', { class: 'ph__label' },
      el('b', { text: 'Foto em breve' }),
      el('span', { class: 'ph__file', text: file }),
    ),
  );
  if (!src) return ph;

  const probe = new Image();
  probe.decoding = 'async';
  probe.addEventListener('load', () => {
    const img = el('img', {
      src, alt: alt || '', class: className,
      decoding: 'async',
      loading: eager ? 'eager' : 'lazy',
      fetchpriority: eager ? 'high' : null,
      width: probe.naturalWidth, height: probe.naturalHeight,
    });
    // Herda classes adicionadas em tempo de execução para o estado não se perder na troca.
    img.classList.add(...[...ph.classList].filter(c => c !== 'ph'));
    img.style.opacity = '0';
    img.style.transition = 'opacity .6s cubic-bezier(.33,1,.68,1)';
    ph.replaceWith(img);
    requestAnimationFrame(() => { img.style.opacity = ''; });
  }, { once: true });
  probe.src = src;
  return ph;
}

const arrow = () => el('svg', {
  class: 'btn__arrow', width: '14', height: '10', viewBox: '0 0 14 10',
  fill: 'none', 'aria-hidden': 'true',
}, el('path', {
  d: 'M9 1l4 4-4 4M13 5H0', stroke: 'currentColor',
  'stroke-width': '1.4', 'stroke-linecap': 'square',
}));

const star = () => el('svg', { viewBox: '0 0 20 19', fill: 'currentColor', 'aria-hidden': 'true' },
  el('path', { d: 'M10 0l2.6 6.3 6.8.5-5.2 4.4 1.6 6.6L10 14.3 4.2 17.8l1.6-6.6L.6 6.8l6.8-.5L10 0z' }));

function btn(label, href, { ghost = false, extra = {} } = {}) {
  const cls = `btn${ghost ? ' btn--ghost' : ''}`;
  return el('a', { class: cls, href, 'data-cursor': 'hot', ...extra }, el('span', { text: label }), arrow());
}

const nf1 = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const nf0 = new Intl.NumberFormat('pt-BR');

/* Link do WhatsApp com mensagem pré-preenchida (se houver WhatsApp). */
const waHref = () => D.contact.whatsapp
  ? `${D.contact.whatsapp}?text=${encodeURIComponent(D.contact.whatsappMessage || '')}`
  : null;

/* Navegação — as âncoras existem de verdade; nada de botão sem função. */
const NAV = [
  { href: '#inicio',    label: 'Início' },
  { href: '#a-metro',   label: 'A Metro' },
  { href: '#cardapio',  label: 'Cardápio' },
  { href: '#doces',     label: 'Doces' },
  { href: '#ambiente',  label: 'Ambiente' },
  { href: '#visitar',   label: 'Visitar' },
];

/* --- 1. NAVEGAÇÃO ------------------------------------------------------- */
function renderNav() {
  const brand = $('#navBrand');
  brand.replaceChildren(
    D.brand.logo
      ? el('img', { src: D.brand.logo, alt: D.brand.legalName, height: '40' })
      : el('span', { class: 'nav__brand-mark', text: D.brand.name }),
    el('span', { class: 'nav__brand-sub', text: D.brand.tagline }),
  );
  brand.setAttribute('aria-label', `${D.brand.legalName} — ir para o início`);

  $('#navLinks').replaceChildren(...NAV.map(i =>
    el('li', {}, el('a', { class: 'nav__link', href: i.href, text: i.label, 'data-cursor': 'hot' }))));

  const cta = waHref() || D.contact.phoneHref;
  $('#navCta').replaceChildren(btn('Peça a sua', cta, { extra: cta.startsWith('http') ? { target: '_blank', rel: 'noopener' } : {} }));

  $('#navMenuList').replaceChildren(...NAV.map((i, k) =>
    el('li', { class: 'navmenu__item', style: `--i:${k}` },
      el('a', { class: 'navmenu__link', href: i.href, text: i.label }))));

  $('#navMenuFoot').replaceChildren(
    D.contact.phone && el('a', { href: D.contact.phoneHref, text: D.contact.phone }),
    waHref() && el('a', { href: waHref(), target: '_blank', rel: 'noopener', text: 'WhatsApp' }),
    el('a', { href: D.location.mapsUrl, target: '_blank', rel: 'noopener', text: `${D.location.street} — ${D.location.city}/${D.location.state}` }),
  );
}

/* --- 2. HERO ------------------------------------------------------------ */
function renderHero() {
  /* Régua: 0 → 100 cm. É o elemento-assinatura da marca no site. */
  $$('.ruler__labels').forEach(row => {
    row.replaceChildren(...[0, 25, 50, 75, 100].map(n =>
      el('span', { text: n === 100 ? '100 cm' : String(n) })));
  });

  $('#heroQuote').replaceChildren(
    el('p', { text: `“${D.visitorQuote.text}”` }),
    el('cite', { text: D.visitorQuote.when }),
  );

  const wa = waHref();
  $('#heroActions').replaceChildren(
    btn('Ver o cardápio', '#cardapio'),
    wa
      ? btn('Chamar no WhatsApp', wa, { ghost: true, extra: { target: '_blank', rel: 'noopener' } })
      : btn(D.contact.phone, D.contact.phoneHref, { ghost: true }),
  );

  $('#heroStage').replaceChildren(mediaSlot(
    D.seo.ogImage,
    'Pizza a metro da Pizzaria Bom Cheff servida na caixa alongada',
    { eager: true },
  ));

  const sep = () => el('span', { class: 'sep', 'aria-hidden': 'true', text: '/' });
  $('#heroMeta').replaceChildren(
    el('span', {}, el('b', { text: nf1.format(D.rating.value).replace('.', ',') }), ` no Google · ${D.rating.count} avaliações`),
    sep(),
    el('span', {}, el('b', { text: `${D.metro.sizeFrom} a ${D.metro.sizeTo}` })),
    sep(),
    el('span', {}, el('b', { text: `${D.priceRange.display}` }), ` ${D.priceRange.per}`),
    sep(),
    el('span', {}, 'Abre às ', el('b', { text: `${D.hours.opensAt.replace(':00', 'h')}` })),
  );
}

/* --- 3. MARQUEE --------------------------------------------------------- */
function renderMarquee() {
  const words = [
    'Pizza a metro', 'Forno quente', `${D.location.city}`, 'Salgadas e doces',
    '4 fatias a 1 metro', 'Salão, retirada e entrega',
  ];
  const group = () => el('div', { class: 'marquee__group', 'aria-hidden': 'true' },
    ...words.map(w => el('span', { class: 'marquee__item', text: w })));
  const track = $('#marqueeTrack');
  track.replaceChildren(group(), group());
  track.setAttribute('aria-hidden', 'true');
}

/* --- 4. SEÇÃO A METRO --------------------------------------------------- */
/* Narração da sequência. Cada etapa se apoia no que a ficha do Google e as
   avaliações públicas confirmam: os tamanhos vão de 4 fatias a 1 metro. */
const METRO_STEPS = [
  { t: 'Começa em 4 fatias', d: 'O tamanho de quem chegou sozinho.' },
  { t: 'Cresce no meio', d: 'Tamanhos intermediários para a mesa que você trouxe.' },
  { t: 'Termina em 1 metro', d: 'A maior da casa atravessa a mesa inteira.' },
];

function renderMetro() {
  $('#metroSteps').replaceChildren(...METRO_STEPS.map((s, i) =>
    el('article', { class: 'metro__step', 'data-step': i },
      el('span', { class: 'idx', text: String(i + 1).padStart(2, '0') }),
      el('h3', { text: s.t }),
      el('p', { text: s.d }),
    )));

  // `prepend` e não `replaceChildren`: o degradê lateral do palco é do HTML
  // e precisa continuar por cima da foto.
  $('#metroMedia').prepend(mediaSlot(
    'assets/img/hero/pizza-a-metro-mesa.webp',
    'Pizza a metro inteira sobre a mesa',
  ));

  /* Especificações só aparecem se forem preenchidas com dado confirmado. */
  const specs = $('#metroSpecs');
  if (D.metro.specs?.length) {
    specs.replaceChildren(...D.metro.specs.map(s =>
      el('div', { class: 'place__fact' }, el('dt', { text: s.label }), el('dd', { text: s.value }))));
  } else {
    specs.remove();
  }
}

/* --- 5. CARDÁPIO -------------------------------------------------------- */
function renderMenu() {
  const tabs = $('#menuTabs');
  const list = $('#menuList');
  const frame = $('#menuFrame');
  const capName = $('#menuCapName');
  const capCat = $('#menuCapCat');

  /* Uma moldura por sabor, criada uma vez; a troca é só opacidade. */
  const frames = new Map();
  if (frame) {
    D.menu.items.forEach(item => {
      // Casca estável: a foto pode ser trocada por dentro sem perder o estado.
      const shot = el('div', { class: 'menu__shot' },
        mediaSlot(item.image, `${item.name} — Pizzaria Bom Cheff`));
      frames.set(item.id, shot);
      frame.append(shot);
    });
  }

  let current = null;
  function showcase(item) {
    if (!frame || current === item.id) return;
    current = item.id;
    [...frame.children].forEach(c => c.classList.remove('is-shown'));
    frames.get(item.id)?.classList.add('is-shown');
    capName.textContent = item.name;
    capCat.textContent = D.menu.categories.find(c => c.id === item.cat)?.label ?? '';
  }

  function paint(catId) {
    const items = D.menu.items.filter(i => i.cat === catId);
    list.replaceChildren(...items.map((item, i) => {
      const row = el('a', {
        class: 'menu__row', href: '#visitar', id: `sabor-${item.id}`,
        'data-cursor': 'hot', 'data-reveal': '', style: `--d:${Math.min(i, 8)}`,
        'aria-label': `${item.name} — ver como pedir`,
      },
        el('span', { class: 'menu__idx', 'aria-hidden': 'true', text: String(i + 1).padStart(2, '0') }),
        el('span', {},
          el('span', { class: 'menu__name', text: item.name }),
          item.note ? el('span', { class: 'menu__note', text: item.note }) : null,
        ),
        item.badge ? el('span', { class: 'menu__tag', text: item.badge }) : null,
        item.price ? el('span', { class: 'menu__price', text: item.price }) : null,
      );
      const on = () => { showcase(item); $$('.menu__row', list).forEach(r => r.classList.remove('is-active')); row.classList.add('is-active'); };
      row.addEventListener('pointerenter', on);
      row.addEventListener('focus', on);
      return row;
    }));
    if (items[0]) showcase(items[0]);
    window.__revealScan?.(list);
  }

  tabs.replaceChildren(...D.menu.categories.map((c, i) => {
    const t = el('button', {
      type: 'button', class: 'menu__tab', role: 'tab', id: `tab-${c.id}`,
      'aria-selected': i === 0 ? 'true' : 'false', 'aria-controls': 'menuList',
      'data-cursor': 'hot', text: c.label,
    });
    t.addEventListener('click', () => {
      $$('.menu__tab', tabs).forEach(x => x.setAttribute('aria-selected', 'false'));
      t.setAttribute('aria-selected', 'true');
      $('#menuKicker').textContent = c.kicker;
      current = null;
      paint(c.id);
    });
    return t;
  }));

  /* Setas do teclado navegam entre as abas (padrão WAI-ARIA de tablist). */
  tabs.addEventListener('keydown', e => {
    const keys = { ArrowRight: 1, ArrowLeft: -1 };
    if (!(e.key in keys)) return;
    e.preventDefault();
    const all = $$('.menu__tab', tabs);
    const idx = all.findIndex(t => t.getAttribute('aria-selected') === 'true');
    const next = all[(idx + keys[e.key] + all.length) % all.length];
    next.focus(); next.click();
  });

  $('#menuKicker').textContent = D.menu.categories[0].kicker;
  paint(D.menu.categories[0].id);
}

/* --- 6. DOCES ----------------------------------------------------------- */
function renderSweet() {
  const items = D.menu.items.filter(i => i.cat === 'doces');
  $('#sweetGrid').replaceChildren(...items.map((item, i) =>
    el('article', { class: 'sweet__card', 'data-reveal': '', style: `--d:${i}` },
      el('div', { class: 'sweet__media' }, mediaSlot(item.image, `${item.name} — Pizzaria Bom Cheff`)),
      el('div', {},
        el('span', { class: 'sweet__idx', text: `D${String(i + 1).padStart(2, '0')}` }),
        el('h3', { class: 'sweet__name', text: item.name }),
        item.note ? el('p', { class: 'menu__note', text: item.note }) : null,
      ),
    )));
}

/* --- 7. GALERIA --------------------------------------------------------- */
function renderGallery() {
  $('#galleryGrid').replaceChildren(...D.gallery.map((g, i) =>
    el('figure', {
      class: `gallery__item${g.span ? ` gallery__item--${g.span}` : ''}`,
      'data-reveal': '', style: `--d:${i}`, 'data-parallax': '0.06',
    }, mediaSlot(g.src, g.alt))));
}

/* --- 8. PROVA SOCIAL ---------------------------------------------------- */
function renderProof() {
  $('#proofValue').textContent = nf1.format(0).replace('.', ',');
  $('#proofValue').dataset.countTo = String(D.rating.value);
  $('#proofStars').replaceChildren(...Array.from({ length: D.rating.scale }, star));
  $('#proofStars').setAttribute('aria-label', `${nf1.format(D.rating.value).replace('.', ',')} de ${D.rating.scale} estrelas`);
  $('#proofCount').textContent = `${nf0.format(D.rating.count)} avaliações no Google`;

  $('#proofPills').replaceChildren(...D.reviewHighlights.map((t, i) =>
    el('li', { class: 'proof__pill', text: t, 'data-reveal': '', style: `--d:${i}` })));

  const shown = D.reviews.filter(r => r.published);
  $('#proofReviews').replaceChildren(...shown.map((r, i) =>
    el('blockquote', { class: 'review', 'data-reveal': '', style: `--d:${i}` },
      el('p', { class: 'review__text' }, `“${r.text}`, r.truncated ? el('span', { class: 'trunc', text: '…' }) : null, '”'),
      el('footer', { class: 'review__foot' }, el('b', { text: r.author }), `${r.meta} · ${r.when}`),
    )));

  const t = D.transparency;
  $('#transparency').replaceChildren(
    el('div', { class: 'transparency__body' },
      el('h3', { text: t.title }),
      el('p', { text: t.text }),
    ),
    btn(t.ctaLabel, D.contact.phoneHref, { ghost: true }),
  );

  $('#proofSource').replaceChildren(
    'Dados e textos reproduzidos da ficha pública da pizzaria no Google. ',
    el('a', { href: D.location.mapsUrl, target: '_blank', rel: 'noopener', text: 'Ver no Google' }),
  );
}

/* --- 9. LOCALIZAÇÃO ----------------------------------------------------- */
function renderPlace() {
  const L = D.location;
  $('#placeAddress').replaceChildren(
    L.street, el('br'), `${L.city} — ${L.state}`, el('br'),
    el('span', { class: 'gold', text: L.postalCode }),
  );

  $('#placeServices').replaceChildren(...D.services.map(s =>
    el('li', { class: 'place__service', text: s.label })));

  const facts = [
    ['Horário', D.hours.note],
    ['Faixa de preço', `${D.priceRange.display} ${D.priceRange.per}`],
    ['Telefone', null],
    ['Plus Code', L.plusCode],
  ];
  $('#placeFacts').replaceChildren(...facts.map(([k, v]) =>
    el('div', { class: 'place__fact' },
      el('dt', { text: k }),
      el('dd', {}, k === 'Telefone'
        ? el('a', { href: D.contact.phoneHref, text: D.contact.phone, 'data-cursor': 'hot' })
        : v),
    )));

  $('#placeActions').replaceChildren(
    btn('Como chegar', L.directionsUrl, { extra: { target: '_blank', rel: 'noopener' } }),
    waHref()
      ? btn('WhatsApp', waHref(), { ghost: true, extra: { target: '_blank', rel: 'noopener' } })
      : btn('Ligar', D.contact.phoneHref, { ghost: true }),
    D.contact.menuUrl ? btn('Cardápio completo', D.contact.menuUrl, { ghost: true, extra: { target: '_blank', rel: 'noopener' } }) : null,
  );

  /* Mapa carregado sob demanda: nenhum iframe do Google pesa no first load. */
  const map = $('#placeMap');
  const q = encodeURIComponent(`${L.street}, ${L.city} - ${L.state}, ${L.postalCode}`);
  const io = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    io.disconnect();
    map.replaceChildren(el('iframe', {
      title: `Mapa: ${D.brand.legalName}`, loading: 'lazy',
      referrerpolicy: 'no-referrer-when-downgrade',
      src: `https://www.google.com/maps?q=${q}&z=17&output=embed`,
    }));
  }, { rootMargin: '300px' });
  io.observe(map);
}

/* --- 10. CTA + RODAPÉ --------------------------------------------------- */
function renderFooter() {
  const wa = waHref();
  $('#ctaActions').replaceChildren(
    wa ? btn('Pedir no WhatsApp', wa, { extra: { target: '_blank', rel: 'noopener' } })
       : btn('Ligar agora', D.contact.phoneHref),
    btn('Como chegar', D.location.directionsUrl, { ghost: true, extra: { target: '_blank', rel: 'noopener' } }),
  );

  $('#footerBrand').textContent = D.brand.legalName;

  const cols = [
    { h: 'Endereço', rows: [
      el('a', { href: D.location.mapsUrl, target: '_blank', rel: 'noopener' },
        D.location.street, el('br'), `${D.location.city} — ${D.location.state}`, el('br'), D.location.postalCode),
    ] },
    { h: 'Contato', rows: [
      el('a', { href: D.contact.phoneHref, text: D.contact.phone }),
      wa && el('a', { href: wa, target: '_blank', rel: 'noopener', text: 'WhatsApp' }),
      D.contact.email && el('a', { href: `mailto:${D.contact.email}`, text: D.contact.email }),
      D.contact.instagram && el('a', { href: D.contact.instagram, target: '_blank', rel: 'noopener', text: 'Instagram' }),
    ] },
    { h: 'Horário', rows: [
      el('p', { text: D.hours.note }),
      ...(D.hours.weekly ?? []).map(w => el('p', { text: `${w.day} · ${w.time}` })),
    ] },
    { h: 'Navegar', rows: NAV.map(i => el('a', { href: i.href, text: i.label })) },
  ];
  $('#footerCols').replaceChildren(...cols.map(c =>
    el('nav', { class: 'footer__col' }, el('h4', { text: c.h }), ...c.rows.filter(Boolean))));

  $('#footerYear').textContent = String(new Date().getFullYear());
}

/* --- 11. DADOS ESTRUTURADOS (SEO) --------------------------------------- */
function renderSchema() {
  const L = D.location;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: D.brand.legalName,
    servesCuisine: 'Pizza',
    priceRange: D.priceRange.schema,
    telephone: D.contact.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: L.street,
      addressLocality: L.city,
      addressRegion: L.state,
      postalCode: L.postalCode,
      addressCountry: L.country,
    },
    geo: { '@type': 'GeoCoordinates', latitude: L.lat, longitude: L.lng },
    hasMap: L.mapsUrl,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: D.rating.value,
      reviewCount: D.rating.count,
      bestRating: D.rating.scale,
    },
    /* Só declaramos o que foi confirmado: os três serviços da ficha. */
    ...(D.services.some(s => s.label.includes('Entrega')) && { hasDeliveryMethod: 'https://schema.org/OnSitePickup' }),
  };
  if (D.seo.url) data.url = D.seo.url;
  if (D.contact.menuUrl) data.hasMenu = D.contact.menuUrl;
  document.head.append(el('script', { type: 'application/ld+json', text: JSON.stringify(data) }));
}

/* --- boot --------------------------------------------------------------- */
export function renderAll() {
  document.title = D.seo.title;
  $('meta[name="description"]')?.setAttribute('content', D.seo.description);
  renderNav(); renderHero(); renderMarquee(); renderMetro(); renderMenu();
  renderSweet(); renderGallery(); renderProof(); renderPlace(); renderFooter();
  renderSchema();
}
