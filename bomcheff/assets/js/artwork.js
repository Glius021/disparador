/**
 * Arte vetorial da casa.
 *
 * A pizzaria ainda não forneceu fotografias, e preencher o site com imagens
 * genéricas de banco ou geradas por IA seria vender um produto que não é o
 * dela. A saída foi desenhar: ilustração assumida, em traço de gravura, feita
 * sob medida para esta marca — a pizza a metro é o próprio logotipo da ideia.
 *
 * O desenho é gerado por código a partir de uma semente fixa, então cada
 * sabor ganha uma distribuição de ingredientes própria e estável (recarregar
 * a página não embaralha nada), sem precisar de doze arquivos SVG na pasta.
 *
 * Quando as fotos reais chegarem, elas entram no lugar da ilustração sem
 * mudar uma linha de layout.
 */

const NS = 'http://www.w3.org/2000/svg';
const TAU = Math.PI * 2;

/* PRNG com semente: mesma entrada, mesmo desenho, sempre. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Semente derivada do nome do sabor: a Marguerita sempre sai igual a ela mesma. */
function seedOf(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

const node = (tag, attrs) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
  return n;
};

/* ------------------------------------------------------------------ *
 * Geometria do "estádio": retângulo de pontas redondas — a forma real
 * de uma pizza a metro, que não é redonda nem retangular.
 * ------------------------------------------------------------------ */
function stadium(x, y, w, h) {
  const r = h / 2;
  return { x, y, w, h, r, ax: x + r, bx: x + w - r, cy: y + r };
}

function insideStadium(s, px, py, margin = 0) {
  const cx = Math.min(Math.max(px, s.ax), s.bx);
  return Math.hypot(px - cx, py - s.cy) <= s.r - margin;
}

function stadiumPath(s) {
  return `M${s.ax} ${s.y}H${s.bx}A${s.r} ${s.r} 0 0 1 ${s.bx} ${s.y + s.h}H${s.ax}A${s.r} ${s.r} 0 0 1 ${s.ax} ${s.y}Z`;
}

/* Traços curtos apontando para dentro ao longo da borda: é o que dá à massa
   o aspecto de gravura em vez de contorno chapado. */
function crustHatch(g, s, step, len) {
  const mk = (x1, y1, x2, y2, o) => g.append(node('line', {
    x1, y1, x2, y2, stroke: 'currentColor', 'stroke-width': 1.1,
    'stroke-linecap': 'round', opacity: o,
  }));
  for (let x = s.ax; x <= s.bx; x += step) {
    mk(x, s.y, x, s.y + len, .5);
    mk(x, s.y + s.h, x, s.y + s.h - len, .5);
  }
  const arcStep = step / s.r;
  for (let a = -Math.PI / 2; a <= Math.PI / 2; a += arcStep) {
    const c = Math.cos(a), sn = Math.sin(a);
    mk(s.bx + c * s.r, s.cy + sn * s.r, s.bx + c * (s.r - len), s.cy + sn * (s.r - len), .5);
    mk(s.ax - c * s.r, s.cy + sn * s.r, s.ax - c * (s.r - len), s.cy + sn * (s.r - len), .5);
  }
}

/* Ingredientes espalhados sem se sobrepor (amostragem por rejeição).
   A variedade de formas é o que separa uma ilustração de uma bolinha
   repetida: rodelas, argolas, tirinhas, folhas e granulado, em escalas
   bem diferentes entre si. */
function scatter(g, rand, accept, count, scale, palette) {
  const placed = [];
  let tries = 0;
  while (placed.length < count && tries < count * 240) {
    tries++;
    const p = accept(rand);
    if (!p) continue;
    const k = rand();
    const r = k < .18 ? scale * 1.55        // rodela grande
            : k < .34 ? scale * 1.05        // rodela média
            : k < .52 ? scale * .8          // argola
            : k < .68 ? scale * 1.25        // tirinha
            : k < .8  ? scale * .95         // folha
            : scale * .34;                  // granulado
    if (placed.some(q => Math.hypot(q.x - p.x, q.y - p.y) < (q.r + r) * 1.45)) continue;
    placed.push({ x: p.x, y: p.y, r });
    const rot = (rand() * 360).toFixed(1);

    if (k < .34) {
      g.append(node('circle', { cx: p.x, cy: p.y, r, fill: palette.a, 'fill-opacity': .5 }));
      g.append(node('circle', { cx: p.x, cy: p.y, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.2, opacity: .72 }));
      g.append(node('circle', { cx: p.x - r * .3, cy: p.y - r * .26, r: r * .19, fill: 'currentColor', opacity: .26 }));
    } else if (k < .52) {
      g.append(node('circle', { cx: p.x, cy: p.y, r, fill: 'none', stroke: 'currentColor', 'stroke-width': 2, opacity: .78 }));
      g.append(node('circle', { cx: p.x, cy: p.y, r: r * .36, fill: palette.b, 'fill-opacity': .62 }));
    } else if (k < .68) {
      g.append(node('rect', {
        x: p.x - r, y: p.y - r * .34, width: r * 2, height: r * .68, rx: r * .3,
        fill: palette.b, 'fill-opacity': .3, stroke: 'currentColor', 'stroke-width': 1.1,
        opacity: .8, transform: `rotate(${rot} ${p.x} ${p.y})`,
      }));
    } else if (k < .8) {
      g.append(node('path', {
        d: `M${p.x - r} ${p.y}Q${p.x} ${p.y - r * .82} ${p.x + r} ${p.y}Q${p.x} ${p.y + r * .82} ${p.x - r} ${p.y}Z`,
        fill: 'none', stroke: 'currentColor', 'stroke-width': 1.3, opacity: .62,
        transform: `rotate(${rot} ${p.x} ${p.y})`,
      }));
    } else {
      g.append(node('circle', { cx: p.x, cy: p.y, r, fill: 'currentColor', opacity: .4 }));
    }
  }
}

/* ------------------------------------------------------------------ *
 * A PIZZA A METRO — peça de abertura do site.
 * ------------------------------------------------------------------ */
export function metroPizza({ seed = 7, w = 1600, h = 340, slices = 10 } = {}) {
  const rand = rng(seed);
  const svg = node('svg', {
    viewBox: `0 0 ${w} ${h}`, class: 'art art--metro',
    fill: 'none', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet',
  });
  const g = node('g', { class: 'art__g' });
  svg.append(g);

  const out = stadium(10, 10, w - 20, h - 20);
  const inn = stadium(10 + 26, 10 + 26, w - 20 - 52, h - 20 - 52);

  // Um corpo quente por baixo do traço: sem ele a pizza fica só contorno e
  // não parece comida.
  const defs = node('defs', {});
  const grad = node('radialGradient', { id: `bc-heat-${seed}`, cx: '.5', cy: '.5', r: '.62' });
  grad.append(node('stop', { offset: '0', 'stop-color': 'var(--gold)', 'stop-opacity': '.26' }));
  grad.append(node('stop', { offset: '.55', 'stop-color': 'var(--tomato)', 'stop-opacity': '.2' }));
  grad.append(node('stop', { offset: '1', 'stop-color': 'var(--tomato)', 'stop-opacity': '0' }));
  defs.append(grad);
  svg.append(defs);
  g.append(node('path', { d: stadiumPath(inn), fill: `url(#bc-heat-${seed})` }));

  g.append(node('path', { d: stadiumPath(out), stroke: 'currentColor', 'stroke-width': 2.2, opacity: .95 }));
  g.append(node('path', { d: stadiumPath(inn), stroke: 'currentColor', 'stroke-width': 1.3, opacity: .55 }));
  crustHatch(g, out, 13, 20);

  // cortes: uma pizza de um metro chega à mesa já fatiada.
  // Cada corte para na borda real da forma, e não numa altura fixa —
  // por isso é preciso medir a altura do estádio naquele x.
  const halfAt = x => x < inn.ax ? Math.sqrt(Math.max(0, inn.r ** 2 - (inn.ax - x) ** 2))
                    : x > inn.bx ? Math.sqrt(Math.max(0, inn.r ** 2 - (x - inn.bx) ** 2))
                    : inn.r;
  for (let i = 1; i < slices; i++) {
    const x = inn.x + (inn.w * i) / slices;
    const half = halfAt(x);
    g.append(node('line', {
      x1: x, y1: inn.cy - half, x2: x, y2: inn.cy + half,
      stroke: 'currentColor', 'stroke-width': 1, opacity: .3, 'stroke-dasharray': '5 7',
    }));
  }

  scatter(g, rand, r => {
    const px = inn.x + r() * inn.w, py = inn.y + r() * inn.h;
    return insideStadium(inn, px, py, 16) ? { x: px, y: py } : null;
  }, 66, 12, { a: 'var(--tomato-lt)', b: 'var(--gold-lt)' });

  return svg;
}

/* ------------------------------------------------------------------ *
 * MARCA REDONDA DO SABOR — uma por item do cardápio.
 * A versão doce troca as rodelas por fios de calda.
 * ------------------------------------------------------------------ */
export function flavorMark(name, { sweet = false, size = 560 } = {}) {
  const rand = rng(seedOf(name));
  /* "Metade Banana com Canela, Metade Chocolate" é meio a meio de verdade —
     o desenho mostra isso. */
  const half = /metade/i.test(name);
  const svg = node('svg', {
    viewBox: `0 0 ${size} ${size}`, class: `art art--flavor${sweet ? ' art--sweet' : ''}`,
    fill: 'none', 'aria-hidden': 'true', preserveAspectRatio: 'xMidYMid meet',
  });
  const g = node('g', {});
  svg.append(g);

  const c = size / 2, R = size * .44, Ri = R - size * .055;
  const id = `bc-flavor-${seedOf(name)}`;
  const defs = node('defs', {});
  const grad = node('radialGradient', { id, cx: '.5', cy: '.5', r: '.6' });
  grad.append(node('stop', { offset: '0', 'stop-color': 'var(--gold)', 'stop-opacity': sweet ? '.3' : '.24' }));
  grad.append(node('stop', { offset: '.6', 'stop-color': sweet ? 'var(--cocoa-lt)' : 'var(--tomato)', 'stop-opacity': '.24' }));
  grad.append(node('stop', { offset: '1', 'stop-color': 'var(--tomato)', 'stop-opacity': '0' }));
  defs.append(grad); svg.append(defs);
  g.append(node('circle', { cx: c, cy: c, r: Ri, fill: `url(#${id})` }));

  g.append(node('circle', { cx: c, cy: c, r: R, stroke: 'currentColor', 'stroke-width': 2.2, opacity: .95 }));
  g.append(node('circle', { cx: c, cy: c, r: Ri, stroke: 'currentColor', 'stroke-width': 1.3, opacity: .5 }));

  for (let a = 0; a < TAU; a += TAU / 96) {
    g.append(node('line', {
      x1: c + Math.cos(a) * R, y1: c + Math.sin(a) * R,
      x2: c + Math.cos(a) * (R - size * .038), y2: c + Math.sin(a) * (R - size * .038),
      stroke: 'currentColor', 'stroke-width': 1.1, 'stroke-linecap': 'round', opacity: .5,
    }));
  }
  for (let i = 0; i < 8; i++) {
    const a = (TAU / 8) * i + .2;
    g.append(node('line', {
      x1: c, y1: c, x2: c + Math.cos(a) * Ri, y2: c + Math.sin(a) * Ri,
      stroke: 'currentColor', 'stroke-width': 1, opacity: .26, 'stroke-dasharray': '5 7',
    }));
  }
  if (half) {
    g.append(node('line', {
      x1: c, y1: c - Ri, x2: c, y2: c + Ri,
      stroke: 'currentColor', 'stroke-width': 2.4, opacity: .8,
    }));
    // metade esquerda velada: são dois sabores na mesma pizza
    g.append(node('path', {
      d: `M${c} ${c - Ri}A${Ri} ${Ri} 0 0 0 ${c} ${c + Ri}Z`,
      fill: 'var(--cocoa-lt)', 'fill-opacity': .5,
    }));
  }

  if (sweet) {
    /* Fios de calda em vez de rodelas. A quantidade, a amplitude e a
       inclinação saem da semente, então nenhuma pizza doce sai igual à
       vizinha — que é justamente o que denuncia um padrão gerado. */
    const lines = 5 + Math.floor(rand() * 4);
    const tilt = (rand() - .5) * 16;
    const drizzle = node('g', { transform: `rotate(${tilt.toFixed(1)} ${c} ${c})` });
    for (let i = 0; i < lines; i++) {
      const y = c - Ri * .6 + (Ri * 1.2 / (lines - 1)) * i;
      const amp = Ri * (.07 + rand() * .12);
      const half = Math.sqrt(Math.max(0, Ri * Ri - (y - c) ** 2)) * .84;
      if (half < 8) continue;
      const seg = 3 + Math.floor(rand() * 3);
      let d = `M${c - half} ${y}`;
      for (let s = 0; s < seg; s++) {
        const x0 = -half + (half * 2 / seg) * s, x1 = x0 + (half * 2 / seg);
        d += ` Q${c + (x0 + x1) / 2} ${y + (s % 2 ? amp : -amp)} ${c + x1} ${y}`;
      }
      drizzle.append(node('path', {
        d, stroke: 'currentColor', 'stroke-width': 1.6 + rand(), opacity: .45 + rand() * .25,
        'stroke-linecap': 'round', fill: 'none',
      }));
    }
    g.append(drizzle);
    scatter(g, rand, r => {
      const a = r() * TAU, rr = Math.sqrt(r()) * (Ri - size * .07);
      return { x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr };
    }, 18 + Math.floor(rand() * 12), size * .022, { a: 'var(--gold-lt)', b: 'var(--cream)' });
  } else {
    scatter(g, rand, r => {
      const a = r() * TAU, rr = Math.sqrt(r()) * (Ri - size * .07);
      return { x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr };
    }, 34, size * .026, { a: 'var(--tomato-lt)', b: 'var(--gold-lt)' });
  }

  return svg;
}
