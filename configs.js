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
    html.dataset.theme         = state.theme;
    html.dataset.density       = state.density;
    html.dataset.reduceMotion  = String(state['reduce-motion']);
    html.dataset.hideValues    = String(state['hide-values']);
    // outras prefs usadas por outros módulos via window.Settings.get()

    syncUI();

    // avisa o resto da app (gráfico redesenha, por ex.)
    document.dispatchEvent(new CustomEvent('settings:change', { detail: state }));
    // compatibilidade com o app.js que já existe
    if (window.Dash?.chart?.render) window.Dash.chart.render();
  }

  /* ---------------------------------------------------------
     UI — sincroniza controles com o state
     --------------------------------------------------------- */
  function syncUI() {
    // tema
    $$('.theme-card').forEach(c => {
      const on = c.dataset.themeValue === state.theme;
      c.setAttribute('aria-checked', String(on));
      const check = c.querySelector('.theme-check');
      if (check) check.style.opacity = on ? '1' : '0';
    });
    // densidade
    $$('.segmented [data-density]').forEach(b => {
      b.setAttribute('aria-checked', String(b.dataset.density === state.density));
    });
    // toggles
    $$('input[data-pref]').forEach(input => {
      input.checked = !!state[input.dataset.pref];
    });
  }

  /* ---------------------------------------------------------
     PAINEL (abrir / fechar)
     --------------------------------------------------------- */
  const panel = $('#settings');
  const overlay = $('#settingsOverlay');
  const openBtn = $('#settingsBtn');
  const closeBtn = $('#settingsClose');

  function setPanel(open) {
    if (!panel) return;
    panel.classList.toggle('is-open', open);
    panel.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('settings-open', open);
    if (openBtn) openBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      // foca o primeiro controle para acessibilidade
      requestAnimationFrame(() => {
        const first = panel.querySelector('.theme-card');
        first?.focus({ preventScroll: true });
      });
    }
  }

  openBtn?.addEventListener('click', () => setPanel(true));
  closeBtn?.addEventListener('click', () => setPanel(false));
  overlay?.addEventListener('click', () => setPanel(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setPanel(false);
  });

  /* ---------------------------------------------------------
     INTERAÇÕES DO PAINEL
     --------------------------------------------------------- */
  panel?.addEventListener('click', e => {
    const themeCard = e.target.closest('.theme-card');
    if (themeCard) {
      state.theme = themeCard.dataset.themeValue;
      save(); apply();
      return;
    }
    const densityBtn = e.target.closest('.segmented [data-density]');
    if (densityBtn) {
      state.density = densityBtn.dataset.density;
      save(); apply();
    }
  });

  panel?.addEventListener('change', e => {
    const input = e.target.closest('input[data-pref]');
    if (input) {
      state[input.dataset.pref] = input.checked;
      save(); apply();
    }
  });

  $('#resetSettings')?.addEventListener('click', () => {
    state = { ...DEFAULTS };
    save(); apply();
  });

  /* ---------------------------------------------------------
     API PÚBLICA
     --------------------------------------------------------- */
  window.Settings = {
    get: (k) => (k ? state[k] : { ...state }),
    set: (k, v) => { state[k] = v; save(); apply(); },
    reset: () => { state = { ...DEFAULTS }; save(); apply(); },
    open: () => setPanel(true),
    close: () => setPanel(false),
  };

  /* ---------------------------------------------------------
     BOOT — aplica antes do primeiro paint visível
     --------------------------------------------------------- */
  apply();
})();