/* =========================================================
   Configurações — persistência + painel
   ========================================================= */
(() => {
  'use strict';

  const KEY = 'dash:settings:v1';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const DEFAULTS = {
    theme: 'violeta',
    density: 'normal',
    'reduce-motion': false,
    'compact-numbers': false,
    'hide-values': false,
    'notify-stock': true,
    'notify-daily': false,
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : { ...DEFAULTS };
    } catch { return { ...DEFAULTS }; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }

  /* ---------------------------------------------------------
     APLICAÇÃO
     --------------------------------------------------------- */
  function apply() {
    const html = document.documentElement;
    html.dataset.theme        = state.theme;
    html.dataset.density      = state.density;
    html.dataset.reduceMotion = String(state['reduce-motion']);
    html.dataset.hideValues   = String(state['hide-values']);

    // debug temporário — remova quando estiver tudo ok
    // console.log('[configs] tema aplicado:', html.dataset.theme);

    syncUI();
    document.dispatchEvent(new CustomEvent('settings:change', { detail: state }));
    if (window.Dash?.chart?.render) window.Dash.chart.render();
  }

  function syncUI() {
    $$('.theme-card').forEach(c => {
      const on = c.dataset.themeValue === state.theme;
      c.setAttribute('aria-checked', String(on));
      const check = c.querySelector('.theme-check');
      if (check) check.style.opacity = on ? '1' : '0';
    });
    $$('.segmented [data-density]').forEach(b => {
      b.setAttribute('aria-checked', String(b.dataset.density === state.density));
    });
    $$('input[data-pref]').forEach(input => {
      input.checked = !!state[input.dataset.pref];
    });
  }

  /* ---------------------------------------------------------
     PAINEL (abrir / fechar)
     --------------------------------------------------------- */
  const panel    = $('#settings');
  const overlay  = $('#settingsOverlay');
  const openBtn  = $('#settingsBtn');
  const closeBtn = $('#settingsClose');

  function setPanel(open) {
    if (!panel) return;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('settings-open', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));

    if (open) {
      requestAnimationFrame(() => {
        panel.querySelector('.theme-card')?.focus({ preventScroll: true });
      });
    }
  }

  function togglePanel() {
    const isOpen = panel?.classList.contains('is-open');
    setPanel(!isOpen);
  }

  // ✅ toggle no botão da engrenagem (abre E fecha)
  openBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanel();
  });

  // ✅ fecha no X
  closeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    setPanel(false);
  });

  // ✅ fecha clicando fora (overlay)
  overlay?.addEventListener('click', () => setPanel(false));

  // ✅ fecha com Esc
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setPanel(false);
  });

  /* ---------------------------------------------------------
     INTERAÇÕES DO PAINEL
     --------------------------------------------------------- */
  panel?.addEventListener('click', e => {
    const themeCard = e.target.closest('.theme-card');
    if (themeCard) {
      const value = themeCard.dataset.themeValue;
      if (!value) return;
      state.theme = value;
      save();
      apply();
      return;
    }

    const densityBtn = e.target.closest('.segmented [data-density]');
    if (densityBtn) {
      state.density = densityBtn.dataset.density;
      save();
      apply();
    }
  });

  panel?.addEventListener('change', e => {
    const input = e.target.closest('input[data-pref]');
    if (input) {
      state[input.dataset.pref] = input.checked;
      save();
      apply();
    }
  });

  $('#resetSettings')?.addEventListener('click', () => {
    state = { ...DEFAULTS };
    save();
    apply();
  });

  /* ---------------------------------------------------------
     API PÚBLICA
     --------------------------------------------------------- */
  window.Settings = {
    get:    (k) => (k ? state[k] : { ...state }),
    set:    (k, v) => { state[k] = v; save(); apply(); },
    reset:  () => { state = { ...DEFAULTS }; save(); apply(); },
    open:   () => setPanel(true),
    close:  () => setPanel(false),
    toggle: togglePanel,
  };

  /* BOOT */
  apply();
})();