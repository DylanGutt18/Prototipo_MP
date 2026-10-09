/* ==========================================================================
   configs.js
   ========================================================================== */
(() => {
  'use strict';

  const KEY = 'dash:settings:v1';
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  const DEFAULTS = {
    theme: 'violeta',
    currency: 'BRL',
    defaultPeriod: '1a',
    presentation: false,
    'hide-values': false,
    goalBRL: 0,
    selectedBranches: ['campinas', 'jundiai', 'saopaulo'],
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

  function apply() {
    const html = document.documentElement;
    html.dataset.theme      = state.theme;
    html.dataset.hideValues = String(state['hide-values']);
    syncUI();
    document.dispatchEvent(new CustomEvent('settings:change', { detail: { ...state } }));
  }

  function syncUI() {
    $$('.theme-card').forEach(c => {
      const on = c.dataset.themeValue === state.theme;
      c.setAttribute('aria-checked', String(on));
      const check = c.querySelector('.theme-check');
      if (check) check.style.opacity = on ? '1' : '0';
    });
    $$('.segmented [data-currency]').forEach(b => {
      b.setAttribute('aria-checked', String(b.dataset.currency === state.currency));
    });
    $$('.segmented [data-period]').forEach(b => {
      b.setAttribute('aria-checked', String(b.dataset.period === state.defaultPeriod));
    });
    $$('input[data-pref]').forEach(input => {
      input.checked = !!state[input.dataset.pref];
    });
  }

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
  const togglePanel = () => setPanel(!panel?.classList.contains('is-open'));

  openBtn?.addEventListener('click', e => {
    e.stopPropagation();
    togglePanel();
  });
  closeBtn?.addEventListener('click', e => {
    e.stopPropagation();
    setPanel(false);
  });
  overlay?.addEventListener('click', () => setPanel(false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setPanel(false);
  });

  panel?.addEventListener('click', e => {
    const themeCard = e.target.closest('.theme-card');
    if (themeCard) {
      state.theme = themeCard.dataset.themeValue;
      save(); apply();
      return;
    }
    const currencyBtn = e.target.closest('[data-currency]');
    if (currencyBtn) {
      state.currency = currencyBtn.dataset.currency;
      save(); apply();
      return;
    }
    const perBtn = e.target.closest('[data-period]');
    if (perBtn) {
      state.defaultPeriod = perBtn.dataset.period;
      save(); apply();
      return;
    }
    const presBtn = e.target.closest('#enterPresentation');
    if (presBtn) {
      state.presentation = true;
      save();
      setPanel(false);
      apply();
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
    state = { ...DEFAULTS, selectedBranches: [...DEFAULTS.selectedBranches] };
    save(); apply();
  });

  window.Settings = {
    get:    (k) => (k ? state[k] : { ...state }),
    set:    (k, v) => {
      if (k === 'goalBRL') {
        state.goalBRL = typeof v === 'number' ? v : parseFloat(v) || 0;
      } else if (k === 'selectedBranches') {
        state.selectedBranches = Array.isArray(v) && v.length ? [...v] : [...DEFAULTS.selectedBranches];
      } else {
        state[k] = v;
      }
      save(); apply();
    },
    reset:  () => { state = { ...DEFAULTS, selectedBranches: [...DEFAULTS.selectedBranches] }; save(); apply(); },
    open:   () => setPanel(true),
    close:  () => setPanel(false),
    toggle: togglePanel,
  };

  apply();
})();