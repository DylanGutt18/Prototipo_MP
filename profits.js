/* profits.js
   =========================================================
   Página de Lucros
   - Gráficos
   - Tabela
   - Contadores
   - Relógio
   - Menu mobile
   - Sistema de aparência/configurações
   ========================================================= */

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const body = document.body;

  /* =========================================================
     MENU MOBILE
     ========================================================= */

  function setMenu(open) {
    body.classList.toggle('menu-open', open);

    const btn = $('#menuBtn');

    if (btn) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute(
        'aria-label',
        open ? 'Fechar menu' : 'Abrir menu'
      );
    }
  }

  const menuBtn = $('#menuBtn');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      setMenu(!body.classList.contains('menu-open'));
    });
  }

  const overlay = $('#overlay');

  if (overlay) {
    overlay.addEventListener('click', () => setMenu(false));
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      setMenu(false);
      Settings.close();
    }
  });

  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setMenu(false);
  });

  /* =========================================================
     SETTINGS
     ========================================================= */

  const SETTINGS_KEY = 'dash:profits-settings:v1';

  const DEFAULTS = {
    theme: 'violeta',
    density: 'normal',
    reduceMotion: false,
    hideValues: false
  };

  let settingsState = loadSettings();

  function loadSettings() {
    try {
      const saved = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) || '{}'
      );

      return {
        ...DEFAULTS,
        ...saved
      };
    } catch {
      return { ...DEFAULTS };
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify(settingsState)
      );
    } catch {
      /* localStorage pode estar indisponível */
    }
  }

  function applySettings() {
    const root = document.documentElement;

    root.dataset.theme = settingsState.theme;
    root.dataset.density = settingsState.density;
    root.dataset.reduceMotion = String(settingsState.reduceMotion);
    root.dataset.hideValues = String(settingsState.hideValues);

    syncSettingsUI();

    document.dispatchEvent(
      new CustomEvent('settings:change', {
        detail: { ...settingsState }
      })
    );

    if (typeof Chart !== 'undefined') {
      requestAnimationFrame(() => Chart.render());
    }
  }

  function syncSettingsUI() {
    $$('[data-theme-option]').forEach(card => {
      const selected =
        card.dataset.themeOption === settingsState.theme;

      card.setAttribute('aria-checked', String(selected));
    });

    $$('[data-density-option]').forEach(button => {
      const selected =
        button.dataset.densityOption === settingsState.density;

      button.setAttribute('aria-checked', String(selected));
    });

    const reduceMotion = $('#prefReduceMotion');
    const hideValues = $('#prefHideValues');

    if (reduceMotion) {
      reduceMotion.checked = settingsState.reduceMotion;
    }

    if (hideValues) {
      hideValues.checked = settingsState.hideValues;
    }
  }

  function updateSetting(key, value) {
    settingsState[key] = value;
    saveSettings();
    applySettings();
  }

  const Settings = {
    get(key) {
      return key
        ? settingsState[key]
        : { ...settingsState };
    },

    set(key, value) {
      updateSetting(key, value);
    },

    reset() {
      settingsState = { ...DEFAULTS };
      saveSettings();
      applySettings();
    },

    open() {
      const panel = $('#settings');

      if (!panel) return;

      panel.classList.add('is-open');
      body.classList.add('settings-open');

      panel.setAttribute('aria-hidden', 'false');

      const closeBtn = $('#settingsClose');

      if (closeBtn) {
        setTimeout(() => closeBtn.focus(), 50);
      }
    },

    close() {
      const panel = $('#settings');

      if (!panel) return;

      panel.classList.remove('is-open');
      body.classList.remove('settings-open');

      panel.setAttribute('aria-hidden', 'true');
    },

    toggle() {
      const panel = $('#settings');

      if (!panel) return;

      if (panel.classList.contains('is-open')) {
        this.close();
      } else {
        this.open();
      }
    }
  };

  /* =========================================================
     EVENTOS DAS CONFIGURAÇÕES
     ========================================================= */

  const settingsBtn = $('#settingsBtn');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => Settings.toggle());
  }

  const settingsClose = $('#settingsClose');

  if (settingsClose) {
    settingsClose.addEventListener('click', () => Settings.close());
  }

  const settingsOverlay = $('#settingsOverlay');

  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', () => Settings.close());
  }

  $$('[data-theme-option]').forEach(card => {
    card.addEventListener('click', () => {
      updateSetting('theme', card.dataset.themeOption);
    });

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        updateSetting('theme', card.dataset.themeOption);
      }
    });
  });

  $$('[data-density-option]').forEach(button => {
    button.addEventListener('click', () => {
      updateSetting(
        'density',
        button.dataset.densityOption
      );
    });
  });

  const prefReduceMotion = $('#prefReduceMotion');

  if (prefReduceMotion) {
    prefReduceMotion.addEventListener('change', e => {
      updateSetting('reduceMotion', e.target.checked);
    });
  }

  const prefHideValues = $('#prefHideValues');

  if (prefHideValues) {
    prefHideValues.addEventListener('change', e => {
      updateSetting('hideValues', e.target.checked);
    });
  }

  const resetSettings = $('#resetSettings');

  if (resetSettings) {
    resetSettings.addEventListener('click', () => {
      Settings.reset();
    });
  }

  /* =========================================================
     COUNT-UP
     ========================================================= */

  function animateNumber(
    el,
    to,
    { duration = 1100, decimals = 0 } = {}
  ) {
    const from = 0;
    const start = performance.now();

    const ease = t => 1 - Math.pow(1 - t, 3);

    function frame(now) {
      const t = Math.min(
        1,
        (now - start) / duration
      );

      const v =
        from + (to - from) * ease(t);

      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toLocaleString('pt-BR');

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        el.textContent = decimals
          ? to.toFixed(decimals).replace('.', ',')
          : to.toLocaleString('pt-BR');
      }
    }

    requestAnimationFrame(frame);
  }

  function runCounters(root = document) {
    $$('[data-count]', root).forEach(el => {
      const target = parseFloat(el.dataset.count);

      if (Number.isNaN(target)) return;

      animateNumber(el, target, {
        duration: settingsState.reduceMotion
          ? 1
          : 1000 + Math.random() * 250,

        decimals: el.dataset.decimals
          ? +el.dataset.decimals
          : 0
      });
    });
  }

  /* =========================================================
     GRÁFICO
     ========================================================= */

  const Chart = (() => {
    const host = $('#chartProfits');

    if (!host) {
      return {
        render() {}
      };
    }

    const revenue = [
      3200, 4100, 3800, 4600,
      5200, 4900, 5600, 6200,
      5900, 6800, 7100, 7600
    ];

    const costs = [
      1800, 2100, 2000, 2400,
      2600, 2500, 2800, 3100,
      3000, 3400, 3500, 3700
    ];

    const profit = revenue.map(
      (r, i) => r - costs[i]
    );

    const labels = [
      'S1','S2','S3','S4','S5','S6',
      'S7','S8','S9','S10','S11','S12'
    ];

    const ns =
      'http://www.w3.org/2000/svg';

    function svgEl(tag, attrs = {}) {
      const el =
        document.createElementNS(ns, tag);

      for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
      }

      return el;
    }

    function smoothPath(points) {
      if (points.length < 2) return '';

      let d =
        `M ${points[0][0]} ${points[0][1]}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 =
          points[i - 1] || points[i];

        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 =
          points[i + 2] || p2;

        const cp1x =
          p1[0] + (p2[0] - p0[0]) / 6;

        const cp1y =
          p1[1] + (p2[1] - p0[1]) / 6;

        const cp2x =
          p2[0] - (p3[0] - p1[0]) / 6;

        const cp2y =
          p2[1] - (p3[1] - p1[1]) / 6;

        d +=
          ` C ${cp1x} ${cp1y}, ` +
          `${cp2x} ${cp2y}, ` +
          `${p2[0]} ${p2[1]}`;
      }

      return d;
    }

    function build() {
      const rect =
        host.getBoundingClientRect();

      const W = Math.max(
        320,
        rect.width
      );

      const H = Math.max(
        180,
        rect.height
      );

      const pad = {
        t: 16,
        r: 8,
        b: 28,
        l: 8
      };

      const iw =
        W - pad.l - pad.r;

      const ih =
        H - pad.t - pad.b;

      const max =
        Math.max(
          ...revenue,
          ...costs,
          ...profit
        ) * 1.12;

      const stepX =
        iw / (revenue.length - 1);

      const yFor = value =>
        pad.t +
        ih -
        (value / max) * ih;

      const ptsRevenue =
        revenue.map((v, i) => [
          pad.l + i * stepX,
          yFor(v)
        ]);

      const ptsCosts =
        costs.map((v, i) => [
          pad.l + i * stepX,
          yFor(v)
        ]);

      const ptsProfit =
        profit.map((v, i) => [
          pad.l + i * stepX,
          yFor(v)
        ]);

      const svg = svgEl('svg', {
        viewBox: `0 0 ${W} ${H}`,
        preserveAspectRatio: 'none',
        'aria-hidden': 'true'
      });

      const defs = svgEl('defs');

      const grad = svgEl(
        'linearGradient',
        {
          id: 'gProfit',
          x1: '0',
          y1: '0',
          x2: '0',
          y2: '1'
        }
      );

      grad.appendChild(
        svgEl('stop', {
          offset: '0',
          'stop-color': 'var(--chart-3)',
          'stop-opacity': '.25'
        })
      );

      grad.appendChild(
        svgEl('stop', {
          offset: '1',
          'stop-color': 'var(--chart-3)',
          'stop-opacity': '0'
        })
      );

      defs.appendChild(grad);
      svg.appendChild(defs);

      /* GRID */

      const gridG = svgEl('g', {
        stroke: 'var(--chart-grid)',
        'stroke-width': '1'
      });

      for (let i = 0; i <= 4; i++) {
        const y =
          pad.t + (ih / 4) * i;

        gridG.appendChild(
          svgEl('line', {
            x1: pad.l,
            y1: y,
            x2: W - pad.r,
            y2: y
          })
        );
      }

      svg.appendChild(gridG);

      /* ÁREA */

      const areaD =
        smoothPath(ptsProfit) +
        ` L ${ptsProfit.at(-1)[0]} ${pad.t + ih}` +
        ` L ${ptsProfit[0][0]} ${pad.t + ih} Z`;

      const area = svgEl('path', {
        d: areaD,
        fill: 'url(#gProfit)',
        opacity: '0'
      });

      svg.appendChild(area);

      requestAnimationFrame(() => {
        area.style.transition =
          'opacity .8s cubic-bezier(.16,1,.3,1) .25s';

        area.setAttribute('opacity', '1');
      });

      /* LINHAS */

      const lineRevenue = svgEl('path', {
        d: smoothPath(ptsRevenue),
        fill: 'none',
        stroke: 'var(--chart-1)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke'
      });

      const lineCosts = svgEl('path', {
        d: smoothPath(ptsCosts),
        fill: 'none',
        stroke: 'var(--chart-2)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke'
      });

      const lineProfit = svgEl('path', {
        d: smoothPath(ptsProfit),
        fill: 'none',
        stroke: 'var(--chart-3)',
        'stroke-width': '2',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'vector-effect': 'non-scaling-stroke'
      });

      [
        lineRevenue,
        lineCosts,
        lineProfit
      ].forEach((line, index) => {
        svg.appendChild(line);

        requestAnimationFrame(() => {
          const len =
            line.getTotalLength();

          line.style.strokeDasharray =
            `${len}`;

          line.style.strokeDashoffset =
            `${len}`;

          line.style.transition =
            `stroke-dashoffset ` +
            `${settingsState.reduceMotion ? '.01' : '1.4'}s ` +
            `cubic-bezier(.16,1,.3,1) ` +
            `${index * .15}s`;

          requestAnimationFrame(() => {
            line.style.strokeDashoffset = '0';
          });
        });
      });

      /* PONTOS */

      ptsProfit.forEach((point, index) => {
        const circle = svgEl('circle', {
          cx: point[0],
          cy: point[1],
          r: '0',
          fill: 'var(--chart-3)',
          stroke: 'var(--bg-1)',
          'stroke-width': '2'
        });

        svg.appendChild(circle);

        circle.style.transition =
          `r .35s cubic-bezier(.16,1,.3,1) ` +
          `${.5 + index * .04}s`;

        requestAnimationFrame(() => {
          circle.setAttribute(
            'r',
            settingsState.reduceMotion
              ? '2.8'
              : '2.8'
          );
        });
      });

      /* LABELS */

      const labelG = svgEl('g', {
        fill: 'var(--chart-label)',
        'font-size': '10',
        'font-family':
          'JetBrains Mono, monospace',
        'text-anchor': 'middle'
      });

      labels.forEach((label, index) => {
        if (
          index % 2 !== 0 &&
          labels.length > 8
        ) {
          return;
        }

        const text = svgEl('text', {
          x: pad.l + index * stepX,
          y: H - 8
        });

        text.textContent = label;
        labelG.appendChild(text);
      });

      svg.appendChild(labelG);

      return svg;
    }

    function render() {
      host.innerHTML = '';
      host.appendChild(build());
    }

    let rafId = null;

    const ro =
      new ResizeObserver(() => {
        if (rafId) {
          cancelAnimationFrame(rafId);
        }

        rafId =
          requestAnimationFrame(render);
      });

    ro.observe(host);

    return {
      render
    };
  })();

  /* =========================================================
     TABELA
     ========================================================= */

  const products = [
    {
      name: 'Plano Pro',
      revenue: 18400,
      cost: 6200,
      margin: 66.3
    },
    {
      name: 'Plano Starter',
      revenue: 12800,
      cost: 5800,
      margin: 54.7
    },
    {
      name: 'Add-on Analytics',
      revenue: 7900,
      cost: 2100,
      margin: 73.4
    },
    {
      name: 'Consultoria',
      revenue: 5600,
      cost: 3200,
      margin: 42.9
    },
    {
      name: 'Treinamento',
      revenue: 3530,
      cost: 1440,
      margin: 59.2
    }
  ];

  function renderProfitTable() {
    const host = $('#profitTable');

    if (!host) return;

    const maxProfit =
      Math.max(
        ...products.map(
          product =>
            product.revenue - product.cost
        )
      );

    const fmtBRL =
      value =>
        'R$ ' +
        value.toLocaleString('pt-BR');

    const head = `
      <div class="profit-row profit-head">
        <span>Produto</span>
        <span class="num">Receita</span>
        <span class="num">Lucro</span>
        <span class="num">Margem</span>
      </div>
    `;

    const rows =
      products.map(product => {
        const profit =
          product.revenue -
          product.cost;

        return `
          <div class="profit-row">
            <span class="profit-name">
              ${product.name}
            </span>

            <span class="num">
              ${fmtBRL(product.revenue)}
            </span>

            <span class="num positive">
              ${fmtBRL(profit)}
            </span>

            <span class="num">
              ${product.margin
                .toFixed(1)
                .replace('.', ',')}%
            </span>
          </div>
        `;
      }).join('');

    host.innerHTML =
      head + rows;
  }

  /* =========================================================
     RELÓGIO
     ========================================================= */

  function startClock() {
    const el = $('#clock');

    if (!el) return;

    const formatter =
      new Intl.DateTimeFormat(
        'pt-BR',
        {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }
      );

    const tick = () => {
      el.textContent =
        formatter.format(new Date());
    };

    tick();

    setInterval(
      tick,
      30_000
    );
  }

  /* =========================================================
     BOOT
     ========================================================= */

  function boot() {
    applySettings();
    runCounters();
    startClock();
    renderProfitTable();

    requestAnimationFrame(() => {
      Chart.render();
    });
  }

  if (
    document.readyState === 'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      boot
    );
  } else {
    boot();
  }

  /* =========================================================
     API PÚBLICA
     ========================================================= */

  window.Profits = {
    animateNumber,
    runCounters,
    chart: Chart,

    table: {
      render: renderProfitTable
    },

    menu: {
      set: setMenu,
      close: () => setMenu(false)
    },

    settings: Settings
  };
})();