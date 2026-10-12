/* ==========================================================================
   profits.js — View "Lucros"
   Usa window.Dash para moeda, filiais, período e contadores.
   ========================================================================== */
(() => {
  'use strict';

  if (!window.Dash) {
    console.error('[profits] window.Dash não disponível. Verifique a ordem dos scripts.');
    return;
  }

  const Dash = window.Dash;
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const NS = 'http://www.w3.org/2000/svg';

  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  };

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

  /* ===== HOST ===== */
  const viewHost = document.querySelector('.view[data-view="lucros"]');
  if (!viewHost) return;

  const elCardReceita = $('#lucrosCardReceita');
  const elCardCustos  = $('#lucrosCardCustos');
  const elCardLucro   = $('#lucrosCardLucro');
  const elCardMargem  = $('#lucrosCardMargem');
  const elChartHost   = $('#chartLucros');
  const elTableHost   = $('#tabelaLucros');
  const elFiliaisLabel = $('#filiaisLabelLucros');

  /* ===== DATASETS ===== */
  const DATA = {
    '30d': {
      labels: Array.from({ length: 30 }, (_, i) => String(i + 1)),
      receita: [420,510,480,560,600,570,650,700,680,620,720,760,700,780,820,760,840,880,820,900,940,890,980,1020,970,1060,1100,1050,1140,1180],
      custos:  [240,280,260,310,330,310,360,390,380,340,400,420,390,430,450,420,460,480,450,490,510,480,530,560,530,570,590,560,610,640],
      variacaoReceita: 6.4,
      variacaoCustos:  2.1,
      variacaoLucro:   8.9,
      variacaoMargem:  1.7,
    },
    '90d': {
      labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'],
      receita: [3200, 4100, 3800, 4600, 5200, 4900, 5600, 6200, 5900, 6800, 7100, 7600],
      custos:  [1800, 2100, 2000, 2400, 2600, 2500, 2800, 3100, 3000, 3400, 3500, 3700],
      variacaoReceita: 5.2,
      variacaoCustos:  1.8,
      variacaoLucro:   7.6,
      variacaoMargem:  1.3,
    },
    '1a': {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      receita: [12800, 16400, 15200, 18400, 20800, 19600, 22400, 24800, 23600, 27200, 28400, 30400],
      custos:  [7200, 8400, 8000, 9600, 10400, 10000, 11200, 12400, 12000, 13600, 14000, 14800],
      variacaoReceita: 6.8,
      variacaoCustos:  2.4,
      variacaoLucro:   9.2,
      variacaoMargem:  1.9,
    },
  };

  const PRODUCTS_BASE = [
    { name: 'Plano Pro',       receita: 4100, custo: 1400 },
    { name: 'Plano Starter',   receita: 2850, custo: 1280 },
    { name: 'Add-on Analytics', receita: 1760, custo: 470 },
    { name: 'Consultoria',     receita: 1250, custo: 720 },
    { name: 'Treinamento',     receita: 790,  custo: 320 },
  ];

  const PRODUCT_SCALE = { '30d': 1, '90d': 3, '1a': 12 };

  /* ===== DADOS FILTRADOS ===== */
  function getDados() {
    const periodo = Dash.getPeriod();
    const base = DATA[periodo] || DATA['1a'];

    const sel = Dash.getSelectedBranches();
    const pesoR = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0);
    const pesoC = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoDespesa || 0), 0);
    const mult = Dash.MULT;

    return {
      labels: base.labels,
      receita: base.receita.map(v => v * pesoR * mult),
      custos:  base.custos.map(v => v * pesoC * mult),
      variacaoReceita: base.variacaoReceita,
      variacaoCustos:  base.variacaoCustos,
      variacaoLucro:   base.variacaoLucro,
      variacaoMargem:  base.variacaoMargem,
    };
  }

  function getProdutos() {
    const periodo = Dash.getPeriod();
    const scale = PRODUCT_SCALE[periodo] || 1;

    const sel = Dash.getSelectedBranches();
    const pesoR = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0);
    const pesoC = sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoDespesa || 0), 0);
    const mult = Dash.MULT;

    return PRODUCTS_BASE.map(p => {
      const receita = p.receita * scale * pesoR * mult;
      const custo   = p.custo   * scale * pesoC * mult;
      const lucro   = receita - custo;
      const margem  = receita > 0 ? (lucro / receita) * 100 : 0;
      return { name: p.name, receita, custo, lucro, margem };
    });
  }

  /* ===== LABEL DE FILIAIS ===== */
  function atualizarFiliaisLabel() {
    if (!elFiliaisLabel) return;
    const sel = Dash.getSelectedBranches();
    if (sel.length === Object.keys(Dash.FILIAIS).length) {
      elFiliaisLabel.textContent = 'Todas as filiais';
    } else if (sel.length === 1) {
      elFiliaisLabel.textContent = Dash.FILIAIS[sel[0]].nome;
    } else {
      elFiliaisLabel.textContent = sel.map(k => Dash.FILIAIS[k].nome).join(' + ');
    }
  }

  /* ===== BADGE ===== */
  function atualizarBadge(card, variacao, invertido) {
    if (!card) return;
    const badge = card.querySelector('.card-badge');
    if (!badge) return;

    const subiu = variacao > 0;
    const bom = invertido ? !subiu : subiu;

    badge.classList.remove('pos', 'neg', 'up', 'down');
    badge.classList.add(bom ? 'pos' : 'neg');

    const iconPath = badge.querySelector('.badge-icon path');
    if (iconPath) {
      iconPath.setAttribute('d', subiu ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6');
    }
    const valEl = badge.querySelector('.badge-value');
    if (valEl) {
      valEl.textContent = Math.abs(variacao).toFixed(1).replace('.', ',') + '%';
    }
  }

  /* ===== CARDS ===== */
  function renderCards() {
    const d = getDados();
    const receitaTotal = d.receita.reduce((s, v) => s + v, 0) * 1000;
    const custosTotal  = d.custos.reduce((s, v) => s + v, 0) * 1000;
    const lucroTotal   = receitaTotal - custosTotal;
    const margem       = receitaTotal > 0 ? (lucroTotal / receitaTotal) * 100 : 0;

    const setNum = (card, valor) => {
      const el = card?.querySelector('.num');
      if (el) Dash.animateMoney(el, valor);
    };

    setNum(elCardReceita, receitaTotal);
    setNum(elCardCustos, custosTotal);
    setNum(elCardLucro, lucroTotal);

    const elMargem = $('#lucrosMargemValor');
    if (elMargem) {
      Dash.animateNumber(elMargem, margem, { decimals: 1 });
    }

    atualizarBadge(elCardReceita, d.variacaoReceita, false);
    atualizarBadge(elCardCustos,  d.variacaoCustos,  true);
    atualizarBadge(elCardLucro,   d.variacaoLucro,   false);
    atualizarBadge(elCardMargem,  d.variacaoMargem,  false);
  }

  /* ===== GRÁFICO ===== */
  const Chart = (() => {
    if (!elChartHost) return { render() {} };
    let chartData = null;

    function build() {
      const data = getDados();
      const { receita, custos, labels } = data;
      const lucro = receita.map((r, i) => r - custos[i]);

      const max = Math.max(...receita, ...custos, ...lucro) * 1.12;
      const n = receita.length;
      const xAt = i => (i / (n - 1)) * 100;
      const yAt = v => (1 - v / max) * 100;

      const ptsR = receita.map((v, i) => [xAt(i), yAt(v)]);
      const ptsC = custos.map((v, i) => [xAt(i), yAt(v)]);
      const ptsL = lucro.map((v, i) => [xAt(i), yAt(v)]);

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const defs = svgEl('defs');
      const grad = svgEl('linearGradient', { id: 'gProfitArea', x1: '0', y1: '0', x2: '0', y2: '1' });
      grad.appendChild(svgEl('stop', { offset: '0', 'stop-color': 'var(--chart-3)', 'stop-opacity': '.28' }));
      grad.appendChild(svgEl('stop', { offset: '1', 'stop-color': 'var(--chart-3)', 'stop-opacity': '0' }));
      defs.appendChild(grad);
      svg.appendChild(defs);

      const grid = svgEl('g', {
        stroke: 'var(--chart-grid)',
        'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      });
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * 100;
        grid.appendChild(svgEl('line', { x1: '0', y1: y, x2: '100', y2: y }));
      }
      svg.appendChild(grid);

      const areaD = smoothPath(ptsL) + ` L 100 100 L 0 100 Z`;
      const area = svgEl('path', { d: areaD, fill: 'url(#gProfitArea)', opacity: '0' });
      svg.appendChild(area);
      requestAnimationFrame(() => {
        area.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .35s';
        area.style.opacity = '1';
      });

      [
        { color: 'var(--chart-1)', pts: ptsR },
        { color: 'var(--chart-2)', pts: ptsC },
        { color: 'var(--chart-3)', pts: ptsL },
      ].forEach(({ color, pts }) => {
        const line = svgEl('path', {
          d: smoothPath(pts),
          fill: 'none',
          stroke: color,
          'stroke-width': '2',
          'stroke-linecap': 'round',
          'stroke-linejoin': 'round',
          'vector-effect': 'non-scaling-stroke',
        });
        svg.appendChild(line);
      });

      wrap.appendChild(svg);

      const points = document.createElement('div');
      points.className = 'chart-points';
      ptsL.forEach((p, i) => {
        const dot = document.createElement('span');
        dot.className = 'chart-dot';
        dot.style.left = p[0] + '%';
        dot.style.top  = p[1] + '%';
        dot.style.background = 'var(--chart-3)';
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

      chartData = { ptsR, ptsC, ptsL, labels, n, receita, custos, lucro };

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
        const pL = chartData.ptsL[idx];
        const label = chartData.labels[idx];
        const prefix = Dash.getPeriod() === '1a' ? 'Mês' : Dash.getPeriod() === '90d' ? 'Semana' : 'Dia';

        cursor.style.left = pL[0] + '%';

        tooltip.innerHTML = `
          <div class="tt-label">${prefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>Receita</span>
            <span class="tt-val">${Dash.formatMoney(chartData.receita[idx] * 1000)}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>Custos</span>
            <span class="tt-val">${Dash.formatMoney(chartData.custos[idx] * 1000)}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-3)"></i>Lucro</span>
            <span class="tt-val">${Dash.formatMoney(chartData.lucro[idx] * 1000)}</span>
          </div>
        `;

        const rect = wrap.getBoundingClientRect();
        const padT = 16, padB = 28;
        const topY = Math.min(chartData.ptsR[idx][1], chartData.ptsC[idx][1], chartData.ptsL[idx][1]);
        const padTopPercent = (padT / rect.height) * 100;
        const plotHeightPercent = 100 - padTopPercent - (padB / rect.height) * 100;
        const topPos = padTopPercent + (topY / 100) * plotHeightPercent;

        tooltip.style.left = pL[0] + '%';
        tooltip.style.top  = topPos + '%';
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
    }

    function render() {
      elChartHost.innerHTML = '';
      elChartHost.appendChild(build());
    }

    return { render };
  })();

  /* ===== TABELA ===== */
  function renderTable() {
    if (!elTableHost) return;
    const produtos = getProdutos();

    const head = `
      <div class="profit-row profit-head">
        <span>Produto</span>
        <span class="num">Receita</span>
        <span class="num">Lucro</span>
        <span class="num">Margem</span>
      </div>
    `;

    const rows = produtos.map(p => `
      <div class="profit-row">
        <span class="profit-name">${p.name}</span>
        <span class="num">${Dash.formatMoney(p.receita)}</span>
        <span class="num positive">${Dash.formatMoney(p.lucro)}</span>
        <span class="num">${p.margem.toFixed(1).replace('.', ',')}%</span>
      </div>
    `).join('');

    elTableHost.innerHTML = head + rows;
  }

  /* ===== RENDER GERAL ===== */
  function renderAll() {
    atualizarFiliaisLabel();
    renderCards();
    Chart.render();
    renderTable();
  }

  /* ===== REGISTRO NA SPA ===== */
  Dash.registrarView('lucros', { onShow: renderAll });

  /* Se por acaso já estiver aberta (raro) */
  if (Dash.getView() === 'lucros') renderAll();

  /* Re-render quando settings mudar (moeda, filiais) enquanto a view está visível */
  document.addEventListener('settings:change', () => {
    if (Dash.getView() === 'lucros') renderAll();
  });
})();