/* ==========================================================================
   docs.js — Pop-up de documentação
   ========================================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);

  const overlay = $('#docsOverlay');
  const closeBtn = $('#docsClose');
  const doneBtn = $('#docsDone');

  if (!overlay) return;

  function openDocs() {
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('docs-open');
    // Foca o botão de fechar para acessibilidade
    requestAnimationFrame(() => closeBtn?.focus({ preventScroll: true }));
  }

  function closeDocs() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('docs-open');
  }

  // A abertura é acionada pelo prototipo.js via window.Docs.open()
  // (o handler do pop-item chama stopPropagation, então não dá para
  //  escutar o clique em document aqui).

  closeBtn?.addEventListener('click', closeDocs);
  doneBtn?.addEventListener('click', closeDocs);

  // Fecha ao clicar fora do card (no overlay)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDocs();
  });

  // Fecha com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
      closeDocs();
    }
  });

  window.Docs = { open: openDocs, close: closeDocs };
})();