/* ==========================================================================
   prototipo.js — menu · gráficos · filiais · meta · período · popovers · SPA
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

  const MULTIPLICADOR = 4;

  /* ===== MOEDA ===== */
  const CURRENCY_LOCALE = { BRL: 'pt-BR', USD: 'en-US', EUR: 'de-DE' };
  const CURRENCY_SYMBOL = { BRL: 'R$', USD: '$', EUR: '€' };
  const EXCHANGE = { BRL: 1, USD: 0.182, EUR: 0.167 };

  const currentCurrency = () => window.Settings?.get?.('currency') || 'BRL';
  const convertFromBRL = (v, c) => v * (EXCHANGE[c] || 1);

  function formatMoney(valueBRL, opts = {}) {
    const currency = opts.currency || currentCurrency();
    const compact = opts.compact !== false;
    const converted = convertFromBRL(valueBRL, currency);

    const options = {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    };

    if (compact) {
      options.notation = 'compact';
      options.compactDisplay = 'short';
      const abs = Math.abs(converted);
      if (abs >= 1_000_000) {
        options.minimumFractionDigits = 2;
        options.maximumFractionDigits = 2;
      } else if (abs >= 100_000) {
        options.minimumFractionDigits = 1;
        options.maximumFractionDigits = 1;
      }
    }

    return new Intl.NumberFormat(CURRENCY_LOCALE[currency] || 'pt-BR', options).format(converted);
  }

  /* ===== FILIAIS ===== */
  const FILIAIS = {
    campinas: { nome: 'Campinas', pesoReceita: 0.42, pesoDespesa: 0.38 },
    jundiai:  { nome: 'Jundiaí',  pesoReceita: 0.31, pesoDespesa: 0.35 },
    saopaulo: { nome: 'São Paulo', pesoReceita: 0.27, pesoDespesa: 0.27 },
  };
  const FILIAL_ORDER = ['campinas', 'jundiai', 'saopaulo'];

  function getSelectedBranches() {
    const s = window.Settings?.get?.('selectedBranches');
    if (Array.isArray(s) && s.length) return s.filter(k => FILIAIS[k]);
    return [...FILIAL_ORDER];
  }

  /* ===== DATASETS ===== */
  const DATASETS = {
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      receita: [0.9,1.1,0.8,1.3,1.2,1.5,1.4,1.6,1.8,1.5,1.9,1.7,2.0,1.8,1.6,2.1,1.9,2.2,2.0,1.8,2.3,2.1,2.2,2.0,2.4,2.3,2.1,2.5,2.4,2.6],
      despesa: [0.7,0.8,0.6,0.9,0.8,1.0,0.9,1.1,1.2,1.0,1.3,1.1,1.4,1.2,1.1,1.4,1.3,1.5,1.4,1.2,1.5,1.4,1.5,1.3,1.6,1.5,1.4,1.6,1.5,1.7],
      variacaoReceita: 6.2,
      variacaoDespesa: 2.1,
      categorias: [
        { label: 'Marketing', value: 32, color: '--chart-1' },
        { label: 'Operacional', value: 28, color: '--chart-2' },
        { label: 'Salários', value: 26, color: '--chart-3' },
        { label: 'Infraestrutura', value: 14, color: '--chart-4' },
      ],
      origem: [
        { label: 'Recorrente', value: 58, color: '--chart-2' },
        { label: 'Novos', value: 42, color: '--chart-1' },
      ],
      barras: [
        { label: 'Seg', value: 4.5 },{ label: 'Ter', value: 5.2 },{ label: 'Qua', value: 4.8 },
        { label: 'Qui', value: 5.5 },{ label: 'Sex', value: 6.2 },{ label: 'Sáb', value: 3.8 },
        { label: 'Dom', value: 2.1 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 12000 },{ label: 'Monitor 27"', value: 9000 },
        { label: 'Teclado Mec.', value: 7000 },{ label: 'Headset BT', value: 5000 },
        { label: 'Mouse Ergo', value: 3000 },
      ],
    },
    '90d': {
      labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'],
      receita: [8, 9, 11, 10, 12, 14, 13, 15, 16, 14, 17, 18],
      despesa: [6, 7, 8, 7, 9, 10, 9, 11, 12, 11, 13, 14],
      variacaoReceita: 14.8,
      variacaoDespesa: -1.5,
      categorias: [
        { label: 'Marketing', value: 28, color: '--chart-1' },
        { label: 'Operacional', value: 30, color: '--chart-2' },
        { label: 'Salários', value: 27, color: '--chart-3' },
        { label: 'Infraestrutura', value: 15, color: '--chart-4' },
      ],
      origem: [
        { label: 'Recorrente', value: 61, color: '--chart-2' },
        { label: 'Novos', value: 39, color: '--chart-1' },
      ],
      barras: [
        { label: 'Out', value: 24 },{ label: 'Nov', value: 28 },{ label: 'Dez', value: 31 },
        { label: 'Jan', value: 26 },{ label: 'Fev', value: 30 },{ label: 'Mar', value: 34 },
        { label: 'Abr', value: 29 },{ label: 'Mai', value: 33 },{ label: 'Jun', value: 36 },
        { label: 'Jul', value: 31 },{ label: 'Ago', value: 38 },{ label: 'Set', value: 41 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 34000 },{ label: 'Monitor 27"', value: 27000 },
        { label: 'Teclado Mec.', value: 21000 },{ label: 'Headset BT', value: 15000 },
        { label: 'Mouse Ergo', value: 10000 },
      ],
    },
    '1a': {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      receita: [18, 22, 20, 28, 32, 30, 36, 42, 40, 48, 45, 52],
      despesa: [14, 16, 15, 20, 22, 24, 26, 28, 30, 32, 34, 36],
      variacaoReceita: 12.4,
      variacaoDespesa: 3.8,
      categorias: [
        { label: 'Marketing', value: 35, color: '--chart-1' },
        { label: 'Operacional', value: 30, color: '--chart-2' },
        { label: 'Salários', value: 20, color: '--chart-3' },
        { label: 'Infraestrutura', value: 15, color: '--chart-4' },
      ],
      origem: [
        { label: 'Recorrente', value: 64, color: '--chart-2' },
        { label: 'Novos', value: 36, color: '--chart-1' },
      ],
      barras: [
        { label: 'Q1', value: 68 },{ label: 'Q2', value: 90 },
        { label: 'Q3', value: 118 },{ label: 'Q4', value: 137 },
      ],
      topProdutos: [
        { label: 'Notebook Pro 15', value: 128000 },{ label: 'Monitor 27"', value: 96000 },
        { label: 'Teclado Mec.', value: 78000 },{ label: 'Headset BT', value: 54000 },
        { label: 'Mouse Ergo', value: 34000 },
      ],
    },
  };

  const ESTOQUE = [
    { label: 'Notebook Pro 15', value: 3, max: 40 },
    { label: 'Headset BT', value: 5, max: 35 },
    { label: 'Monitor 27"', value: 8, max: 50 },
    { label: 'Teclado Mec.', value: 12, max: 60 },
    { label: 'Mouse Ergo', value: 22, max: 80 },
  ];

  let periodoAtual = '1a';
  const visivel = { receita: true, despesa: true };
  let hasBooted = false;

  /* ===== VIEWS (SPA) ===== */
  let viewAtual = 'geral';
  const viewHandlers = {};

  function registrarView(nome, { onShow } = {}) {
    viewHandlers[nome] = { onShow };
  }

  function setView(nome) {
    if (!nome) return;
    const changed = viewAtual !== nome;
    viewAtual = nome;

    $$('.view').forEach(v => { v.hidden = v.dataset.view !== nome; });
    $$('.menu-item[data-view]').forEach(m =>
      m.classList.toggle('active', m.dataset.view === nome)
    );
    $$('.bottom-nav a[data-view]').forEach(a =>
      a.classList.toggle('active', a.dataset.view === nome)
    );

    if (changed) window.scrollTo({ top: 0, behavior: 'smooth' });

    requestAnimationFrame(() => {
      if (nome === 'geral') {
        renderAll(periodoAtual);
        // Gera o resumo depois que os cards terminarem de animar
        setTimeout(() => window.Insights?.render('geral'), 400);
      } else {
        viewHandlers[nome]?.onShow?.();
        setTimeout(() => window.Insights?.render(nome), 400);
      }
    });
  }

  /* ===== DADOS FILTRADOS ===== */
  function getDados(periodo = periodoAtual) {
    const base = DATASETS[periodo];
    if (!base) return null;

    const selecionadas = getSelectedBranches();
    const pesoR = selecionadas.reduce((s, k) => s + (FILIAIS[k]?.pesoReceita || 0), 0);
    const pesoD = selecionadas.reduce((s, k) => s + (FILIAIS[k]?.pesoDespesa || 0), 0);
    const mult = MULTIPLICADOR;

    return {
      ...base,
      receita: base.receita.map(v => v * pesoR * mult),
      despesa: base.despesa.map(v => v * pesoD * mult),
      barras: base.barras.map(b => ({ ...b, value: b.value * pesoR * mult })),
      topProdutos: base.topProdutos.map(p => ({ ...p, value: p.value * pesoR * mult })),
      categorias: base.categorias,
      origem: base.origem,
      variacaoReceita: base.variacaoReceita,
      variacaoDespesa: base.variacaoDespesa,
      labels: base.labels,
    };
  }

  function receitaBRL(periodo = periodoAtual) {
    const d = getDados(periodo);
    return d ? d.receita.reduce((s, v) => s + v, 0) * 1000 : 0;
  }
  function despesaBRL(periodo = periodoAtual) {
    const d = getDados(periodo);
    return d ? d.despesa.reduce((s, v) => s + v, 0) * 1000 : 0;
  }

  /* ===== MENU MOBILE ===== */
  const body = document.body;
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    const btn = $('#menuBtn');
    if (btn) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }
  };
  $('#menuBtn')?.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  $('#overlay')?.addEventListener('click', () => setMenu(false));

  /* Itens de navegação (menu + bottom-nav) */
  $$('.menu-item[data-view], .bottom-nav a[data-view]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      setView(el.dataset.view);
      setMenu(false);
    });
  });

  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 769px)').addEventListener('change', e => {
    if (e.matches) setMenu(false);
  });

  /* ===== POPOVERS ===== */
  const perfilBtn = $('#perfilBtn');
  const perfilPop = $('#popPerfil');
  const ajudaBtn  = $('#ajudaBtn');
  const ajudaPop  = $('#popAjuda');

  function fecharPops() {
    [perfilPop, ajudaPop].forEach(p => {
      if (!p) return;
      p.classList.remove('is-open');
      p.setAttribute('aria-hidden', 'true');
    });
    [perfilBtn, ajudaBtn].forEach(b => { if (b) b.setAttribute('aria-expanded', 'false'); });
  }
  function abrirPop(pop, btn) {
    fecharPops();
    pop.classList.add('is-open');
    pop.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }
  perfilBtn?.addEventListener('click', e => {
    e.stopPropagation();
    perfilPop.classList.contains('is-open') ? fecharPops() : abrirPop(perfilPop, perfilBtn);
  });
  ajudaBtn?.addEventListener('click', e => {
    e.stopPropagation();
    ajudaPop.classList.contains('is-open') ? fecharPops() : abrirPop(ajudaPop, ajudaBtn);
  });
  perfilPop?.addEventListener('click', e => e.stopPropagation());
  ajudaPop?.addEventListener('click', e => e.stopPropagation());
  document.addEventListener('click', fecharPops);

  /* ===== SETTINGS BTN NO TOPBAR (mobile) ===== */
  $('#topbarSettingsBtn')?.addEventListener('click', () => {
    window.Settings?.open?.();
  });

  /* ===== TOAST ===== */
  const toastHost = document.createElement('div');
  toastHost.className = 'toast-host';
  document.body.appendChild(toastHost);

  function mostrarToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `
      <span class="toast-icon">
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none"
             stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="5 12 10 17 19 7"/>
        </svg>
      </span>
      <span>${msg}</span>
    `;
    toastHost.appendChild(t);
    setTimeout(() => {
      t.classList.add('is-leaving');
      t.addEventListener('animationend', () => t.remove());
    }, 2400);
  }

  const ACOES_AJUDA = {
    docs: 'Abrindo documentação…',
    suporte: 'Conectando com o suporte…',
    atalhos: 'Atalhos: Ctrl+K, Ctrl+/, Shift+?',
    sobre: 'Painel v1.0 · build 2026.10',
  };
  $$('.pop-item[data-action]').forEach(item => {
    item.addEventListener('click', e => {
      e.stopPropagation();
      mostrarToast(ACOES_AJUDA[item.dataset.action] || `Ação: ${item.dataset.action}`);
      fecharPops();
    });
  });

  /* ===== ANIMAÇÃO DE MOEDA ===== */
  function animateMoney(el, toBRL, duration = 700) {
    const from = parseFloat(el.dataset.current || 0);
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (toBRL - from) * ease(t);
      el.textContent = formatMoney(v);
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = formatMoney(toBRL);
        el.dataset.current = toBRL;
      }
    };
    requestAnimationFrame(frame);
  }

  /* ===== COUNT-UP GENÉRICO ===== */
  function animateNumber(el, to, { duration = 700, decimals = 0 } = {}) {
    const from = parseFloat(el.dataset.current || 0);
    const start = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    const frame = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const v = from + (to - from) * ease(t);
      el.textContent = decimals
        ? v.toFixed(decimals).replace('.', ',')
        : Math.round(v).toLocaleString('pt-BR');
      if (t < 1) requestAnimationFrame(frame);
      else {
        el.textContent = decimals
          ? to.toFixed(decimals).replace('.', ',')
          : Math.round(to).toLocaleString('pt-BR');
        el.dataset.current = to;
      }
    };
    requestAnimationFrame(frame);
  }

  /* ===== CURVA SUAVE ===== */
  const smoothPath = (pts) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      d += ` C ${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6},` +
           ` ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6},` +
           ` ${p2[0]} ${p2[1]}`;
    }
    return d;
  };

  /* ===== GRÁFICO DE LINHA (Visão Geral) ===== */
  const Chart = (() => {
    const host = $('#chart');
    if (!host) return { render() {} };
    let chartData = null;

    const build = (data) => {
      const { receita, despesa, labels } = data;
      const max = Math.max(...receita, ...despesa) * 1.12;
      const n = receita.length;
      const xAt = i => (i / (n - 1)) * 100;
      const yAt = v => (1 - v / max) * 100;
      const ptsR = receita.map((v, i) => [xAt(i), yAt(v)]);
      const ptsD = despesa.map((v, i) => [xAt(i), yAt(v)]);

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'gArea', x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-2)', 'stop-opacity': '.30' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-2)', 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      const grid = svgEl('g', { stroke: 'var(--chart-grid)', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke' });
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * 100;
        grid.appendChild(svgEl('line', { x1: '0', y1: y, x2: '100', y2: y }));
      }
      svg.appendChild(grid);

      const areaD = smoothPath(ptsR) + ` L 100 100 L 0 100 Z`;
      const area = svgEl('path', {
        d: areaD, fill: 'url(#gArea)', opacity: '0',
        class: 'serie serie--receita' + (visivel.receita ? '' : ' is-hidden'),
      });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .35s';
        area.style.opacity = '1';
      });

      [
        { key: 'despesa', color: 'var(--chart-1)', pts: ptsD },
        { key: 'receita', color: 'var(--chart-2)', pts: ptsR },
      ].forEach(({ key, color, pts }) => {
        const line = svgEl('path', {
          d: smoothPath(pts), fill: 'none', stroke: color,
          'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
          'vector-effect': 'non-scaling-stroke',
          class: `serie serie--${key}` + (visivel[key] ? '' : ' is-hidden'),
        });
        svg.appendChild(line);
      });

      wrap.appendChild(svg);

      const points = document.createElement('div');
      points.className = 'chart-points' + (visivel.receita ? '' : ' is-hidden');
      ptsR.forEach((p, i) => {
        const dot = document.createElement('span');
        dot.className = 'chart-dot';
        dot.style.left = p[0] + '%';
        dot.style.top = p[1] + '%';
        dot.style.transitionDelay = (0.6 + i * 0.02) + 's';
        points.appendChild(dot);
      });
      wrap.appendChild(points);

      const labelsEl = document.createElement('div');
      labelsEl.className = 'chart-labels';
      const mostrarTodas = labels.length <= 12;
      const step = mostrarTodas ? 1 : Math.ceil(labels.length / 6);
      const ultimo = labels.length - 1;
      labels.forEach((lb, i) => {
        if (!mostrarTodas && i % step !== 0 && i !== ultimo) return;
        const s = document.createElement('span');
        s.textContent = lb;
        s.style.left = (i / ultimo) * 100 + '%';
        labelsEl.appendChild(s);
      });
      wrap.appendChild(labelsEl);

      const hoverLayer = document.createElement('div');
      hoverLayer.className = 'chart-hover';
      const cursor = document.createElement('div');
      cursor.className = 'chart-cursor';
      hoverLayer.appendChild(cursor);
      wrap.appendChild(hoverLayer);

      const tooltip = document.createElement('div');
      tooltip.className = 'chart-tooltip';
      wrap.appendChild(tooltip);

      chartData = { ptsR, ptsD, labels, n, receita, despesa };

      let pinnedIdx = -1;
      let hideTimer = null;

      function idxFromClientX(clientX) {
        const rect = wrap.getBoundingClientRect();
        const padL = 8, padR = 8;
        const innerW = rect.width - padL - padR;
        const x = clientX - rect.left - padL;
        const ratio = Math.max(0, Math.min(1, x / innerW));
        return Math.round(ratio * (chartData.n - 1));
      }

      function showTooltipAt(idx) {
        const pR = chartData.ptsR[idx];
        const pD = chartData.ptsD[idx];
        cursor.style.left = pR[0] + '%';

        const label = chartData.labels[idx];
        const labelPrefix = periodoAtual === '1a' ? 'Mês'
                          : periodoAtual === '90d' ? 'Semana' : 'Dia';

        tooltip.innerHTML = `
          <div class="tt-label">${labelPrefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>Receita</span>
            <span class="tt-val">${formatMoney(chartData.receita[idx] * 1000)}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>Despesa</span>
            <span class="tt-val">${formatMoney(chartData.despesa[idx] * 1000)}</span>
          </div>
        `;

        const rect = wrap.getBoundingClientRect();
        const padT = 16, padB = 28;
        const topY = Math.min(pR[1], pD[1]);
        const padTopPercent = (padT / rect.height) * 100;
        const plotHeightPercent = 100 - padTopPercent - (padB / rect.height) * 100;
        const topPos = padTopPercent + (topY / 100) * plotHeightPercent;

        tooltip.style.left = pR[0] + '%';
        tooltip.style.top = topPos + '%';
        tooltip.classList.add('is-visible');
        hoverLayer.classList.add('is-active');
      }

      function hideTooltip() {
        tooltip.classList.remove('is-visible');
        hoverLayer.classList.remove('is-active');
        pinnedIdx = -1;
      }

      hoverLayer.addEventListener('mousemove', e => {
        if (pinnedIdx !== -1) return;
        showTooltipAt(idxFromClientX(e.clientX));
      });
      hoverLayer.addEventListener('mouseleave', () => {
        if (pinnedIdx !== -1) return;
        hideTooltip();
      });
      hoverLayer.addEventListener('click', e => {
        e.stopPropagation();
        if (pinnedIdx === -1) {
          const idx = idxFromClientX(e.clientX);
          showTooltipAt(idx);
          pinnedIdx = idx;
          clearTimeout(hideTimer);
          hideTimer = setTimeout(hideTooltip, 5000);
        } else {
          hideTooltip();
        }
      });
      hoverLayer.addEventListener('touchstart', e => {
        const t = e.touches[0];
        if (!t) return;
        showTooltipAt(idxFromClientX(t.clientX));
        pinnedIdx = idxFromClientX(t.clientX);
        clearTimeout(hideTimer);
      }, { passive: true });
      hoverLayer.addEventListener('touchmove', e => {
        const t = e.touches[0];
        if (!t) return;
        showTooltipAt(idxFromClientX(t.clientX));
        pinnedIdx = idxFromClientX(t.clientX);
        clearTimeout(hideTimer);
      }, { passive: true });
      hoverLayer.addEventListener('touchend', () => {
        hideTimer = setTimeout(hideTooltip, 2500);
      });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => wrap.classList.add('is-ready'));
      });

      return wrap;
    };

    const render = () => {
      const data = getDados();
      if (!data) return;
      host.innerHTML = '';
      host.appendChild(build(data));
    };

    return { render };
  })();

  /* ===== TOGGLE DE SÉRIES ===== */
  $$('.legend [data-serie]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.serie;
      visivel[key] = !visivel[key];
      el.classList.toggle('off', !visivel[key]);
      $$(`#chart .serie--${key}`).forEach(s => s.classList.toggle('is-hidden', !visivel[key]));
      if (key === 'receita') {
        $('#chart .chart-points')?.classList.toggle('is-hidden', !visivel.receita);
      }
    });
  });

  /* ===== BADGE ===== */
  function atualizarBadge(badgeEl, variacao, invertido) {
    const subiu = variacao > 0;
    const bom = invertido ? !subiu : subiu;
    badgeEl.classList.remove('pos', 'neg', 'up', 'down');
    badgeEl.classList.add(bom ? 'pos' : 'neg');
    const icon = badgeEl.querySelector('.badge-icon');
    if (icon && icon.firstElementChild) {
      icon.firstElementChild.setAttribute(
        'd', subiu ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'
      );
    }
    const valEl = badgeEl.querySelector('.badge-value');
    if (valEl) {
      valEl.textContent = Math.abs(variacao).toFixed(1).replace('.', ',') + '%';
    }
  }

  function atualizarCards() {
    const d = getDados();
    if (!d) return;
    const rEl = $('#cardReceita .num');
    const dEl = $('#cardDespesa .num');
    const rBadge = $('#cardReceita .card-badge');
    const dBadge = $('#cardDespesa .card-badge');

    if (rEl) animateMoney(rEl, receitaBRL());
    if (dEl) animateMoney(dEl, despesaBRL());
    if (rBadge) atualizarBadge(rBadge, d.variacaoReceita, false);
    if (dBadge) atualizarBadge(dBadge, d.variacaoDespesa, true);
  }

  /* ===== DONUT ===== */
  const Donut = (id, data, options = {}) => {
    const host = document.getElementById(id);
    if (!host) return;

    const totalBRL = options.totalBRL || 0;
    const size = 140, stroke = 18;
    const r = (size - stroke) / 2;
    const cx = size / 2, cy = size / 2;
    const circ = 2 * Math.PI * r;
    const totalPct = data.reduce((s, d) => s + d.value, 0) || 1;

    const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}` });
    svg.appendChild(svgEl('circle', {
      cx, cy, r, fill: 'none',
      stroke: 'var(--bg-3)', 'stroke-width': stroke,
    }));

    const groups = [];
    let acc = 0;

    data.forEach((d) => {
      const len = (d.value / totalPct) * circ;
      const midAngle = (-90 + ((acc + len / 2) / circ) * 360) * Math.PI / 180;

      // <g> externo = hitbox fixa (não se move)
      const g = svgEl('g', { class: 'donut-slice-group' });

      // <g> interno = é este que "descola" no hover
      const inner = svgEl('g', { class: 'donut-slice-visual' });

      const slice = svgEl('circle', {
        cx, cy, r, fill: 'none',
        stroke: `var(${d.color})`,
        'stroke-width': stroke,
        'stroke-dasharray': `${len} ${circ - len}`,
        'stroke-dashoffset': -acc,
        transform: `rotate(-90 ${cx} ${cy})`,
        class: 'donut-slice',
      });

      inner.appendChild(slice);
      g.appendChild(inner);
      svg.appendChild(g);

      const actualBRL = (d.value / totalPct) * totalBRL;
      groups.push({
        g, inner, slice, midAngle, actualBRL,
        pct: Math.round((d.value / totalPct) * 100),
        label: d.label,
      });
      acc += len;
    });

    const labelEl = svgEl('text', { x: cx, y: cy - 3, class: 'donut-center-label' });
    labelEl.textContent = 'Total';
    svg.appendChild(labelEl);

    const valueEl = svgEl('text', { x: cx, y: cy + 15, class: 'donut-center-value' });
    valueEl.textContent = formatMoney(totalBRL);
    svg.appendChild(valueEl);

    host.innerHTML = '';
    host.appendChild(svg);

    /* ---------- Destaque por hover (sem clique) ---------- */
    function highlight(i) {
      groups.forEach((grp, idx) => {
        const isActive = idx === i;
        const dimmed = i !== -1 && !isActive;

        // Aplica o transform no <g> INTERNO — a hitbox (<g> externo) fica parada
        if (isActive) {
          const dx = Math.cos(grp.midAngle) * 9;
          const dy = Math.sin(grp.midAngle) * 9;
          grp.inner.style.transform = `translate(${dx}px, ${dy}px)`;
          grp.inner.style.opacity = '1';
          grp.slice.setAttribute('stroke-width', String(stroke + 2));
        } else {
          grp.inner.style.transform = 'translate(0, 0)';
          grp.inner.style.opacity = dimmed ? '0.35' : '1';
          grp.slice.setAttribute('stroke-width', String(stroke));
        }
      });

      if (i === -1) {
        labelEl.textContent = 'Total';
        valueEl.textContent = formatMoney(totalBRL);
      } else {
        labelEl.textContent = groups[i].label;
        valueEl.textContent = formatMoney(groups[i].actualBRL);
      }
    }

    groups.forEach((grp, i) => {
      grp.g.addEventListener('mouseenter', () => highlight(i));
      grp.g.addEventListener('mouseleave', () => highlight(-1));
    });

    const legend = document.createElement('div');
    legend.className = 'donut-legend';
    groups.forEach((grp, i) => {
      const item = document.createElement('span');
      item.innerHTML = `<i style="background:var(${data[i].color})"></i>${grp.label}<b>${grp.pct}%</b>`;
      item.addEventListener('mouseenter', () => highlight(i));
      item.addEventListener('mouseleave', () => highlight(-1));
      legend.appendChild(item);
    });
    host.appendChild(legend);
  };

  /* ===== BARRAS VERTICAIS ===== */
  const Bars = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;

    const VW = 360, VH = 170;
    const pad = { t: 12, r: 4, b: 24, l: 4 };
    const iw = VW - pad.l - pad.r;
    const ih = VH - pad.t - pad.b;
    const max = Math.max(...data.map(d => d.value)) * 1.15;
    const step = iw / data.length;
    const bw = step * 0.55;

    const wrap = document.createElement('div');
    wrap.className = 'bar-inner';

    const svg = svgEl('svg', {
      viewBox: `0 0 ${VW} ${VH}`,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    });

    const grid = svgEl('g', { stroke: 'var(--chart-grid)', 'stroke-width': '1', 'vector-effect': 'non-scaling-stroke' });
    for (let i = 0; i <= 3; i++) {
      const y = pad.t + (ih / 3) * i;
      grid.appendChild(svgEl('line', { x1: pad.l, y1: y, x2: VW - pad.r, y2: y }));
    }
    svg.appendChild(grid);

    const defs = svgEl('defs');
    const gid = `barG-${id}`;
    const grad = svgEl('linearGradient', { id: gid, x1: '0', y1: '0', x2: '0', y2: '1' });
    grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-1)', 'stop-opacity': '1' }));
    grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-1)', 'stop-opacity': '.35' }));
    defs.appendChild(grad);
    svg.appendChild(defs);

    data.forEach((d, i) => {
      const x = pad.l + i * step + (step - bw) / 2;
      const h = (d.value / max) * ih;
      const y = pad.t + ih - h;
      const bar = svgEl('rect', {
        x, y: pad.t + ih, width: bw, height: 0, rx: 3,
        fill: `url(#${gid})`,
      });
      svg.appendChild(bar);
      bar.style.transition = `y .7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s,` +
                             ` height .7s cubic-bezier(.16,1,.3,1) ${i * 0.04}s`;
      requestAnimationFrame(() => {
        bar.setAttribute('y', y);
        bar.setAttribute('height', h);
      });
    });

    const labelG = svgEl('g', {
      fill: 'var(--chart-label)', 'font-size': '10',
      'font-family': 'JetBrains Mono, monospace', 'text-anchor': 'middle',
    });
    data.forEach((d, i) => {
      if (data.length > 8 && i % 2 !== 0) return;
      const t = svgEl('text', { x: pad.l + i * step + step / 2, y: VH - 8 });
      t.textContent = d.label;
      labelG.appendChild(t);
    });
    svg.appendChild(labelG);

    wrap.appendChild(svg);

    const hover = document.createElement('div');
    hover.className = 'bar-hover';

    data.forEach((d, i) => {
      const barX = pad.l + i * step + (step - bw) / 2;
      const h = (d.value / max) * ih;
      const y = pad.t + ih - h;

      const zone = document.createElement('span');
      zone.className = 'bar-hover-zone';
      zone.style.left = (pad.l + i * step) / VW * 100 + '%';
      zone.style.width = step / VW * 100 + '%';
      zone.style.top = Math.max(0, y / VH * 100) + '%';
      zone.style.height = (pad.t + ih - y) / VH * 100 + '%';
      zone.dataset.idx = i;
      zone.dataset.label = d.label;
      zone.dataset.money = formatMoney(d.value * 1000);
      zone.dataset.tipLeft = ((barX + bw / 2) / VW * 100) + '%';
      zone.dataset.tipTop = Math.max(0, y / VH * 100) + '%';
      hover.appendChild(zone);
    });
    wrap.appendChild(hover);

    const tooltip = document.createElement('div');
    tooltip.className = 'bar-tooltip';
    wrap.appendChild(tooltip);

    let pinnedIdx = -1;
    let hideTimer = null;

    function showTooltipFor(zone) {
      tooltip.innerHTML = `
        <div class="tt-label">${zone.dataset.label}</div>
        <div class="tt-val">${zone.dataset.money}</div>
      `;
      tooltip.style.left = zone.dataset.tipLeft;
      tooltip.style.top = zone.dataset.tipTop;
      tooltip.classList.add('is-visible');
    }

    function hideTooltip() {
      tooltip.classList.remove('is-visible');
      pinnedIdx = -1;
      hover.querySelectorAll('.bar-hover-zone').forEach(z => z.classList.remove('is-active'));
    }

    hover.querySelectorAll('.bar-hover-zone').forEach(zone => {
      zone.addEventListener('mouseenter', () => {
        if (pinnedIdx !== -1) return;
        showTooltipFor(zone);
      });
      zone.addEventListener('mouseleave', () => {
        if (pinnedIdx !== -1) return;
        tooltip.classList.remove('is-visible');
      });
      zone.addEventListener('click', e => {
        e.stopPropagation();
        const idx = +zone.dataset.idx;
        if (pinnedIdx === idx) {
          hideTooltip();
        } else {
          hideTooltip();
          showTooltipFor(zone);
          zone.classList.add('is-active');
          pinnedIdx = idx;
          clearTimeout(hideTimer);
          hideTimer = setTimeout(hideTooltip, 5000);
        }
      });
      zone.addEventListener('touchstart', e => {
        e.stopPropagation();
        showTooltipFor(zone);
        zone.classList.add('is-active');
        pinnedIdx = +zone.dataset.idx;
        clearTimeout(hideTimer);
      }, { passive: true });
      zone.addEventListener('touchend', () => {
        hideTimer = setTimeout(hideTooltip, 2500);
      });
    });

    host.innerHTML = '';
    host.appendChild(wrap);
  };

  /* ===== ESTOQUE ===== */
  const StockList = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;
    host.innerHTML = '';
    data.forEach(d => {
      const pct = Math.min(100, (d.value / d.max) * 100);
      const critico = pct < 20;
      const baixo = pct >= 20 && pct < 35;
      const row = document.createElement('div');
      row.className = 'hbar' + (critico ? ' is-critical' : baixo ? ' is-low' : '');
      row.innerHTML = `
        <div class="hbar-head">
          <span class="hbar-label">${d.label}</span>
          <span class="hbar-value">${d.value}<small>/${d.max}</small></span>
        </div>
        <div class="hbar-track"><div class="hbar-fill" style="width:0%"></div></div>
      `;
      host.appendChild(row);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          row.querySelector('.hbar-fill').style.width = pct + '%';
        });
      });
    });
  };

  /* ===== TOP PRODUTOS ===== */
  const TopList = (id, data) => {
    const host = document.getElementById(id);
    if (!host) return;
    const max = Math.max(...data.map(d => d.value));
    host.innerHTML = '';
    data.forEach((d, i) => {
      const pct = (d.value / max) * 100;
      const item = document.createElement('div');
      item.className = 'top-item';
      item.innerHTML = `
        <span class="top-rank">${i + 1}</span>
        <div class="top-info">
          <span class="top-name">${d.label}</span>
          <div class="top-bar"><div class="top-bar-fill" style="width:0%"></div></div>
        </div>
        <span class="top-value">${formatMoney(d.value)}</span>
      `;
      host.appendChild(item);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          item.querySelector('.top-bar-fill').style.width = pct + '%';
        });
      });
    });
  };

  /* ===== CARD DE META ===== */
  function updateGoalUI() {
    const input = $('#goalInput');
    const symbol = $('#goalCurrencySymbol');
    const progress = $('#goalProgress');
    const fill = $('#goalProgressFill');
    const percent = $('#goalPercent');
    const remaining = $('#goalRemaining');

    const metaEmpty = $('#metaEmpty');
    const metaValueWrap = $('#metaValueWrap');
    const metaValue = $('#metaValue');
    const metaSub = $('#metaSub');
    const metaTrack = $('#metaTrack');
    const metaFill = $('#metaFill');
    const metaRemaining = $('#metaRemaining');
    const metaBadge = $('#metaBadge');
    const metaBadgeValue = $('#metaBadgeValue');

    const currency = currentCurrency();
    const goalBRL = window.Settings?.get?.('goalBRL') || 0;

    if (symbol) symbol.textContent = CURRENCY_SYMBOL[currency] || 'R$';

    if (input && document.activeElement !== input) {
      const locale = CURRENCY_LOCALE[currency] || 'pt-BR';
      const displayValue = convertFromBRL(goalBRL, currency);
      input.value = goalBRL > 0
        ? new Intl.NumberFormat(locale).format(Math.round(displayValue))
        : '';
    }

    if (progress) progress.hidden = goalBRL <= 0;

    const revenue = receitaBRL();
    const pct = goalBRL > 0 ? Math.min(100, (revenue / goalBRL) * 100) : 0;
    const remainingBRL = Math.max(0, goalBRL - revenue);
    const complete = goalBRL > 0 && pct >= 100;

    if (fill) {
      fill.style.width = pct + '%';
      fill.classList.toggle('is-complete', complete);
    }
    if (percent) {
      percent.textContent = Math.round(pct) + '%';
      percent.classList.toggle('is-complete', complete);
    }
    if (remaining) {
      remaining.textContent = goalBRL <= 0
        ? ''
        : complete
          ? 'Meta atingida!'
          : `Faltam ${formatMoney(remainingBRL)}`;
    }

    if (!metaEmpty) return;

    if (goalBRL <= 0) {
      metaEmpty.hidden = false;
      metaValueWrap.hidden = true;
      metaTrack.hidden = true;
      metaRemaining.hidden = true;
      if (metaBadge) metaBadge.hidden = true;
      return;
    }

    metaEmpty.hidden = true;
    metaValueWrap.hidden = false;
    metaTrack.hidden = false;
    metaRemaining.hidden = false;
    if (metaBadge) metaBadge.hidden = false;

    if (metaValue) metaValue.textContent = formatMoney(revenue);
    if (metaSub) metaSub.textContent = `de ${formatMoney(goalBRL)}`;
    if (metaFill) {
      metaFill.style.width = pct + '%';
      metaFill.classList.toggle('is-complete', complete);
    }
    if (metaRemaining) {
      metaRemaining.innerHTML = complete
        ? 'Meta atingida!'
        : `Faltam <strong>${formatMoney(remainingBRL)}</strong>`;
    }
    if (metaBadge) {
      metaBadge.classList.remove('accent', 'pos');
      metaBadge.classList.add(complete ? 'pos' : 'accent');
    }
    if (metaBadgeValue) metaBadgeValue.textContent = Math.round(pct) + '%';
  }

  const goalInput = $('#goalInput');
  if (goalInput) {
    goalInput.addEventListener('input', () => {
      const digits = goalInput.value.replace(/\D/g, '');
      if (digits !== goalInput.value) goalInput.value = digits;
      const num = parseInt(digits, 10) || 0;
      const currency = currentCurrency();
      const rate = EXCHANGE[currency] || 1;
      const goalBRL = rate > 0 ? num / rate : 0;
      window.Settings?.set?.('goalBRL', goalBRL);
    });
    goalInput.addEventListener('focus', () => {
      goalInput.value = goalInput.value.replace(/\D/g, '');
    });
    goalInput.addEventListener('blur', () => { updateGoalUI(); });
  }

  /* ===== FILTRO DE FILIAIS ===== */
  const filterBtn = $('#filterBtn');
  const filterMenu = $('#filterMenu');
  const filterCount = $('#filterCount');
  const filterClear = $('#filterClear');

  function updateFiliaisLabel() {
    const sel = getSelectedBranches();
    const label = $('#filiaisLabel');
    if (!label) return;

    if (sel.length === FILIAL_ORDER.length) {
      label.textContent = 'Todas as filiais';
    } else if (sel.length === 1) {
      label.textContent = FILIAIS[sel[0]].nome;
    } else {
      label.textContent = sel.map(k => FILIAIS[k].nome).join(' + ');
    }
    if (filterCount) filterCount.textContent = sel.length;
  }

  function setFilterOpen(open) {
    if (!filterMenu) return;
    filterMenu.hidden = !open;
    filterBtn?.setAttribute('aria-expanded', String(open));
  }

  filterBtn?.addEventListener('click', e => {
    e.stopPropagation();
    setFilterOpen(filterMenu.hidden);
  });
  filterMenu?.addEventListener('click', e => e.stopPropagation());
  filterMenu?.addEventListener('change', e => {
    const input = e.target.closest('input[type="checkbox"]');
    if (!input) return;
    const marcadas = $$('#filterMenu input[type="checkbox"]:checked').map(i => i.value);
    const final = marcadas.length ? marcadas : FILIAL_ORDER.slice();
    if (!marcadas.length) {
      $$('#filterMenu input[type="checkbox"]').forEach(i => { i.checked = true; });
    }
    window.Settings?.set?.('selectedBranches', final);
  });
  filterClear?.addEventListener('click', () => {
    $$('#filterMenu input[type="checkbox"]').forEach(i => { i.checked = true; });
    window.Settings?.set?.('selectedBranches', [...FILIAL_ORDER]);
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.filter-wrap')) setFilterOpen(false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') setFilterOpen(false);
  });

  /* ===== RENDER (Visão Geral) ===== */
  function renderAll(periodo) {
    periodoAtual = periodo || periodoAtual;
    const d = getDados();
    if (!d) return;

    Chart.render();
    atualizarCards();
    Donut('donutCategorias', d.categorias, { totalBRL: despesaBRL() });
    Donut('donutOrigem', d.origem, { totalBRL: receitaBRL() });
    Bars('barPeriodo', d.barras);
    TopList('topProdutos', d.topProdutos);
    StockList('estoqueCritico', ESTOQUE);
    updateGoalUI();

    // Gera o resumo após as animações
    setTimeout(() => window.Insights?.render('geral'), 450);
  }

  /* ===== PERÍODO ===== */
  function setPeriodo(p) {
    if (!DATASETS[p]) return;
    periodoAtual = p;
    $$('.range-picker .chip').forEach(c =>
      c.classList.toggle('active', c.dataset.period === p)
    );
    if (viewAtual === 'geral') {
      renderAll(p);
    } else {
      viewHandlers[viewAtual]?.onShow?.();
      setTimeout(() => window.Insights?.render(viewAtual), 450);
    }
  }

  $$('.range-picker .chip').forEach(chip => {
    chip.addEventListener('click', () => setPeriodo(chip.dataset.period));
  });

  /* ===== APRESENTAÇÃO ===== */
  function setPresentation(on) {
    document.body.classList.toggle('presentation-mode', on);
    const exit = $('#presentationExit');
    if (exit) exit.hidden = !on;
    if (on) window.Settings?.close?.();
  }
  $('#presentationExit')?.addEventListener('click', () => {
    setPresentation(false);
    window.Settings?.set?.('presentation', false);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('presentation-mode')) {
      setPresentation(false);
      window.Settings?.set?.('presentation', false);
    }
  });

  /* ===== BUSCA ===== */
  const SEARCH_TARGETS = [
    /* ===== VIEW · VISÃO GERAL ===== */
    { id: 'contentHeader', view: 'geral', label: 'Visão Geral', keywords: ['visão', 'geral', 'resumo', 'home', 'overview'] },
    { id: 'cardReceita', view: 'geral', label: 'Receita do período', keywords: ['receita', 'entrada', 'ganho', 'faturamento'] },
    { id: 'cardDespesa', view: 'geral', label: 'Despesa do período', keywords: ['despesa', 'gasto', 'saída', 'custo'] },
    { id: 'cardMeta', view: 'geral', label: 'Meta de receita', keywords: ['meta', 'objetivo', 'goal'] },
    { id: 'panelGrafico', view: 'geral', label: 'Receita × Despesa', keywords: ['gráfico', 'comparativo', 'linha', 'receita', 'despesa'] },
    { id: 'panelCategorias', view: 'geral', label: 'Gastos por categoria', keywords: ['categoria', 'gastos', 'marketing', 'salários', 'operacional', 'infraestrutura'] },
    { id: 'panelOrigem', view: 'geral', label: 'Origem da receita', keywords: ['origem', 'recorrente', 'novos', 'donut'] },
    { id: 'panelBarras', view: 'geral', label: 'Receita no período', keywords: ['barras', 'receita', 'trimestre'] },
    { id: 'panelEstoque', view: 'geral', label: 'Estoque crítico', keywords: ['estoque', 'produto', 'inventário', 'crítico'] },
    { id: 'panelTop', view: 'geral', label: 'Top produtos', keywords: ['top', 'produtos', 'vendas', 'mais vendidos'] },
    ...['Notebook Pro 15', 'Monitor 27"', 'Teclado Mec.', 'Headset BT', 'Mouse Ergo'].map(name => ({
      id: 'panelTop', view: 'geral', label: name, keywords: [name.toLowerCase()], child: name,
    })),

    /* ===== VIEW · LUCROS ===== */
    { id: 'lucrosCardReceita', view: 'lucros', label: 'Lucros · Receita bruta', keywords: ['lucro', 'receita bruta', 'faturamento'] },
    { id: 'lucrosCardCustos', view: 'lucros', label: 'Lucros · Custos totais', keywords: ['lucro', 'custo', 'custos', 'despesa'] },
    { id: 'lucrosCardLucro', view: 'lucros', label: 'Lucros · Lucro líquido', keywords: ['lucro', 'lucro líquido', 'líquido'] },
    { id: 'lucrosCardMargem', view: 'lucros', label: 'Lucros · Margem líquida', keywords: ['lucro', 'margem', 'percentual'] },
    { id: 'chartLucros', view: 'lucros', label: 'Lucros · Receita × Custos × Lucro', keywords: ['lucro', 'gráfico', 'receita', 'custos', 'evolução'] },
    { id: 'donutMixReceita', view: 'lucros', label: 'Lucros · Composição da receita', keywords: ['lucro', 'composição', 'receita', 'hardware', 'software', 'serviços', 'donut'] },
    { id: 'donutCustosLucros', view: 'lucros', label: 'Lucros · Composição dos custos', keywords: ['lucro', 'composição', 'custos', 'marketing', 'salários', 'donut'] },
    { id: 'barLucros', view: 'lucros', label: 'Lucros · Lucro no período', keywords: ['lucro', 'barras', 'trimestre', 'período'] },
    { id: 'donutOrigemLucros', view: 'lucros', label: 'Lucros · Origem do lucro', keywords: ['lucro', 'origem', 'recorrente', 'pontual', 'donut'] },
    { id: 'margemCategorias', view: 'lucros', label: 'Lucros · Margem por categoria', keywords: ['lucro', 'margem', 'categoria'] },
    { id: 'tabelaLucros', view: 'lucros', label: 'Lucros · Produtos e serviços', keywords: ['lucro', 'produtos', 'serviços', 'tabela'] },

    /* ===== VIEW · DEMANDA ===== */
    { id: 'demandaCardPedidos', view: 'demanda', label: 'Demanda · Pedidos totais', keywords: ['demanda', 'pedidos', 'volume'] },
    { id: 'demandaCardAssinaturas', view: 'demanda', label: 'Demanda · Novas assinaturas', keywords: ['demanda', 'assinaturas', 'contratos'] },
    { id: 'demandaCardConversao', view: 'demanda', label: 'Demanda · Taxa de conversão', keywords: ['demanda', 'conversão', 'leads', 'clientes'] },
    { id: 'demandaCardTicket', view: 'demanda', label: 'Demanda · Ticket médio', keywords: ['demanda', 'ticket', 'médio'] },
    { id: 'chartDemanda', view: 'demanda', label: 'Demanda · Pedidos × Meta', keywords: ['demanda', 'gráfico', 'pedidos', 'meta'] },
    { id: 'donutOrigemDemanda', view: 'demanda', label: 'Demanda · Origem dos pedidos', keywords: ['demanda', 'origem', 'inbound', 'indicação', 'donut'] },
    { id: 'donutTipoDemanda', view: 'demanda', label: 'Demanda · Tipo de demanda', keywords: ['demanda', 'tipo', 'renovação', 'novo negócio', 'upsell', 'donut'] },
    { id: 'barCategoriaDemanda', view: 'demanda', label: 'Demanda · Pedidos por categoria', keywords: ['demanda', 'categoria', 'hardware', 'software', 'serviços', 'barras'] },
    { id: 'demandaFiliais', view: 'demanda', label: 'Demanda · Demanda por filial', keywords: ['demanda', 'filial', 'distribuição'] },
    { id: 'tabelaDemanda', view: 'demanda', label: 'Demanda · Top produtos por volume', keywords: ['demanda', 'produtos', 'volume', 'tabela'] },

    /* ===== VIEW · ESTOQUE ===== */
    { id: 'estoqueCardSkus', view: 'estoque', label: 'Estoque · SKUs ativos', keywords: ['estoque', 'sku', 'itens'] },
    { id: 'estoqueCardValor', view: 'estoque', label: 'Estoque · Valor em estoque', keywords: ['estoque', 'valor', 'capital'] },
    { id: 'estoqueCardGiro', view: 'estoque', label: 'Estoque · Giro de estoque', keywords: ['estoque', 'giro'] },
    { id: 'estoqueCardCobertura', view: 'estoque', label: 'Estoque · Cobertura', keywords: ['estoque', 'cobertura', 'dias'] },
    { id: 'chartEstoque', view: 'estoque', label: 'Estoque · Movimentação', keywords: ['estoque', 'movimentação', 'entradas', 'saídas', 'gráfico'] },
    { id: 'abcEstoque', view: 'estoque', label: 'Estoque · Curva ABC', keywords: ['estoque', 'abc', 'curva', 'concentração'] },
    { id: 'armazemEstoque', view: 'estoque', label: 'Estoque · Estoque por armazém', keywords: ['estoque', 'armazém', 'distribuição', 'filial'] },
    { id: 'categoriaEstoque', view: 'estoque', label: 'Estoque · Status por categoria', keywords: ['estoque', 'categoria', 'ocupação'] },
    { id: 'tabelaEstoque', view: 'estoque', label: 'Estoque · Inventário detalhado', keywords: ['estoque', 'inventário', 'sku', 'tabela'] },

    /* ===== VIEW · DESEMPENHO ===== */
    { id: 'desempCardNps', view: 'desempenho', label: 'Desempenho · NPS', keywords: ['desempenho', 'nps', 'satisfação'] },
    { id: 'desempCardSla', view: 'desempenho', label: 'Desempenho · SLA cumprido', keywords: ['desempenho', 'sla', 'prazo'] },
    { id: 'desempCardTempo', view: 'desempenho', label: 'Desempenho · Tempo de resposta', keywords: ['desempenho', 'tempo', 'resposta'] },
    { id: 'desempCardProdutividade', view: 'desempenho', label: 'Desempenho · Produtividade', keywords: ['desempenho', 'produtividade', 'meta'] },
    { id: 'chartDesempenho', view: 'desempenho', label: 'Desempenho · Evolução dos indicadores', keywords: ['desempenho', 'gráfico', 'sla', 'nps', 'produtividade'] },
    { id: 'gaugeDesempenho', view: 'desempenho', label: 'Desempenho · Score geral', keywords: ['desempenho', 'score', 'gauge'] },
    { id: 'radarDesempenho', view: 'desempenho', label: 'Desempenho · Competências', keywords: ['desempenho', 'radar', 'competências'] },
    { id: 'filiaisDesempenho', view: 'desempenho', label: 'Desempenho · Desempenho por filial', keywords: ['desempenho', 'filial', 'score'] },
    { id: 'rankingDesempenho', view: 'desempenho', label: 'Desempenho · Ranking de equipes', keywords: ['desempenho', 'ranking', 'equipes', 'performers'] },
  ];

  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');
  let activeResultIdx = -1;

  const normalizar = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  function buscar(termo) {
    const q = normalizar(termo.trim());
    if (!q) return [];
    return SEARCH_TARGETS.filter(t => {
      const alvo = normalizar(t.label);
      const keys = t.keywords.map(normalizar).join(' ');
      return alvo.includes(q) || keys.includes(q);
    }).slice(0, 8);
  }

  function mostrarResultados(lista) {
    searchResults.innerHTML = '';
    activeResultIdx = -1;
    if (!lista.length) {
      searchResults.innerHTML = '<div class="search-empty">Nada encontrado</div>';
      searchResults.classList.add('is-open');
      return;
    }
    lista.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'search-result';
      const VIEW_LABEL = {
        geral: 'Visão Geral',
        lucros: 'Lucros',
        demanda: 'Demanda',
        estoque: 'Estoque',
        desempenho: 'Desempenho',
      };
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.2-3.2"/>
        </svg>
        <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.label}</span>
        <small style="color:var(--fg-3);font-family:var(--mono);font-size:10px;flex-shrink:0">${VIEW_LABEL[t.view] || ''}</small>
      `;
      btn.addEventListener('click', () => irPara(t));
      searchResults.appendChild(btn);
    });
    searchResults.classList.add('is-open');
  }

  function fecharResultados() {
    searchResults.classList.remove('is-open');
    activeResultIdx = -1;
  }

  function irPara(t) {
    const navegar = () => {
      const target = document.getElementById(t.id);
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        target.classList.remove('is-highlighted');
        void target.offsetWidth;
        target.classList.add('is-highlighted');
        setTimeout(() => target.classList.remove('is-highlighted'), 2100);
      }, 420);
    };

    // Se o alvo está em outra view, troca de view primeiro
    if (t.view && t.view !== viewAtual) {
      setView(t.view);
      // Aguarda a view renderizar antes de rolar até o elemento
      setTimeout(navegar, 500);
    } else {
      navegar();
    }

    fecharResultados();
    searchInput.value = '';
    searchInput.blur();
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      if (!searchInput.value.trim()) return fecharResultados();
      mostrarResultados(buscar(searchInput.value));
    });
    searchInput.addEventListener('keydown', e => {
      const items = $$('.search-result');
      if (!items.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeResultIdx = (activeResultIdx + 1) % items.length;
        items.forEach((it, i) => it.classList.toggle('is-active', i === activeResultIdx));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeResultIdx = (activeResultIdx - 1 + items.length) % items.length;
        items.forEach((it, i) => it.classList.toggle('is-active', i === activeResultIdx));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        items[activeResultIdx >= 0 ? activeResultIdx : 0]?.click();
      } else if (e.key === 'Escape') {
        fecharResultados();
        searchInput.blur();
      }
    });
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim()) mostrarResultados(buscar(searchInput.value));
    });
  }
  document.addEventListener('click', e => {
    if (!e.target.closest('.search')) fecharResultados();
  });

  /* ===== RELÓGIO ===== */
  const startClock = () => {
    const el = $('#clock');
    if (!el) return;
    const fmt = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const tick = () => { el.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30_000);
  };

  /* ===== REAGE A SETTINGS ===== */
  let snap = { currency: null, period: null, filiais: null, goalBRL: null };

  document.addEventListener('settings:change', (e) => {
    if (!hasBooted) return;
    const s = e.detail;

    const currChanged   = snap.currency !== s.currency;
    const perChanged    = snap.period !== s.defaultPeriod;
    const filialChanged = JSON.stringify(snap.filiais) !== JSON.stringify(s.selectedBranches);
    const goalChanged   = snap.goalBRL !== s.goalBRL;

    snap.currency = s.currency;
    snap.period = s.defaultPeriod;
    snap.filiais = s.selectedBranches ? [...s.selectedBranches] : null;
    snap.goalBRL = s.goalBRL;

    if (filialChanged && s.selectedBranches) {
      $$('#filterMenu input[type="checkbox"]').forEach(inp => {
        inp.checked = s.selectedBranches.includes(inp.value);
      });
      updateFiliaisLabel();
    }

    if (perChanged) {
      setPeriodo(s.defaultPeriod);
    } else if (currChanged || filialChanged) {
      if (viewAtual === 'geral') {
        renderAll(periodoAtual);
      } else {
        viewHandlers[viewAtual]?.onShow?.();
        setTimeout(() => window.Insights?.render(viewAtual), 450);
      }
    } else if (goalChanged) {
      updateGoalUI();
    }

    setPresentation(s.presentation);
  });

  /* ===== BOOT ===== */
  const boot = () => {
    hasBooted = true;
    startClock();

    const s = window.Settings?.get?.() || {};
    snap.currency = s.currency || 'BRL';
    snap.period = s.defaultPeriod || '1a';
    snap.filiais = s.selectedBranches ? [...s.selectedBranches] : null;
    snap.goalBRL = s.goalBRL;

    if (Array.isArray(s.selectedBranches)) {
      $$('#filterMenu input[type="checkbox"]').forEach(inp => {
        inp.checked = s.selectedBranches.includes(inp.value);
      });
    }
    updateFiliaisLabel();

    setPeriodo(snap.period);
    setPresentation(s.presentation);
    updateGoalUI();

    setView(viewAtual);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* ===== API PÚBLICA ===== */
  window.Dash = {
    renderAll,
    setPeriodo,
    formatMoney,
    setPresentation,
    updateGoalUI,
    setView,
    registrarView,
    getView: () => viewAtual,
    getCurrency: currentCurrency,
    getPeriod: () => periodoAtual,
    getSelectedBranches,
    FILIAIS,
    MULT: MULTIPLICADOR,
    animateMoney,
    animateNumber,
    getDataset: () => getDados(periodoAtual),
  };
})();

  document.addEventListener('auth:login', () => {
    setView('geral');
    // garante que o painel reflita o estado atual das configurações
    const s = window.Settings?.get?.() || {};
    if (s.defaultPeriod) setPeriodo(s.defaultPeriod);
    updateGoalUI();
  });