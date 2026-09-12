import { renderAll } from './render.js';
import { initMotion } from './motion.js';

/* Conteúdo primeiro, movimento depois: se o motion falhar, o site continua
   legível e navegável. */
try {
  renderAll();
} catch (err) {
  console.error('[bom-cheff] falha ao renderizar o conteúdo:', err);
}
try {
  initMotion();
} catch (err) {
  console.error('[bom-cheff] falha ao iniciar o movimento:', err);
  document.querySelectorAll('[data-reveal], .split').forEach(n => n.classList.add('is-in'));
  document.documentElement.classList.add('is-ready');
}
