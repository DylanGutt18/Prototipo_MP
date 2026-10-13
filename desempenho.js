/* ==========================================================================
   desempenho.js — View "Desempenho"
   NPS, SLA, tempo de resposta, produtividade + radar + ranking.
   ========================================================================== */
(() => {
  'use strict';

  if (!window.Dash) {
    console.error('[desempenho] window.Dash não existe. Verifique a ordem dos scripts.');
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

  const viewHost = $('.view[data-view="desempenho"]');
  if (!viewHost) return;

  const elCardNps           = $('#desempCardNps');
  const elCardSla           = $('#desempCardSla');
  const elCardTempo         = $('#desempCardTempo');
  const elCardProdutividade = $('#desempCardProdutividade');
  const elNpsVal            = $('#desempNpsValor');
  const elSlaVal            = $('#desempSlaValor');
  const elTempoVal          = $('#desempTempoValor');
  const elProdutividadeVal  = $('#desempProdutividadeValor');
  const elChartHost         = $('#chartDesempenho');
  const elGaugeHost         = $('#gaugeDesempenho');
  const elRadarHost         = $('#radarDesempenho');
  const elFiliaisList       = $('#filiaisDesempenho');
  const elRankingList       = $('#rankingDesempenho');
  const elFiliaisLbl        = $('#filiaisLabelDesempenho');

  const DATA = {
    '30d': {
      labels: ['S1', 'S2', 'S3', 'S4'],
      sla:           [88, 90, 91, 92],
      nps:           [68, 70, 71, 73],
      produtividade: [85, 87, 88, 90],
      kpis: { nps: 73, sla: 92, tempo: 3.4, produtividade: 90 },
      variacoes: { nps: 3.2, sla: 1.4, tempo: -8.5, produtividade: 2.1 },
      filiais: { campinas: 91, jundiai: 86, saopaulo: 88 },
      radar: [82, 88, 90, 75, 86, 79],
      ranking: [
        { nome: 'Marina Costa',       score: 96, delta: 4.2 },
        { nome: 'Rafael Almeida',     score: 92, delta: 2.1 },
        { nome: 'Juliana Prado',      score: 89, delta: 1.8 },
        { nome: 'Bruno Tavares',      score: 85, delta: -0.9 },
        { nome: 'Camila Rezende',     score: 81, delta: 0.7 },
      ],
    },
    '90d': {
      labels: ['S1','S2','S3','S4','S5','S6','S7','S8','S9','S10','S11','S12'],
      sla:           [85, 86, 87, 89, 88, 90, 91, 91, 92, 93, 93, 94],
      nps:           [62, 64, 65, 67, 68, 70, 71, 72, 74, 74, 76, 76],
      produtividade: [78, 80, 82, 83, 85, 86, 88, 88, 90, 91, 92, 93],
      kpis: { nps: 76, sla: 94, tempo: 3.1, produtividade: 93 },
      variacoes: { nps: 5.8, sla: 2.7, tempo: -12.4, produtividade: 4.6 },
      filiais: { campinas: 94, jundiai: 89, saopaulo: 91 },
      radar: [87, 90, 92, 80, 89, 84],
      ranking: [
        { nome: 'Marina Costa',       score: 94, delta: 3.1 },
        { nome: 'Rafael Almeida',     score: 92, delta: 3.8 },
        { nome: 'Juliana Prado',      score: 91, delta: 2.4 },
        { nome: 'Camila Rezende',     score: 87, delta: 5.1 },
        { nome: 'Bruno Tavares',      score: 85, delta: 0.9 },
      ],
    },
    '1a': {
      labels: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
      sla:           [82, 84, 85, 87, 86, 88, 90, 91, 90, 92, 93, 95],
      nps:           [58, 61, 63, 66, 68, 70, 73, 75, 77, 78, 80, 82],
      produtividade: [72, 75, 78, 80, 82, 84, 86, 88, 89, 91, 92, 94],
      kpis: { nps: 82, sla: 95, tempo: 2.8, produtividade: 94 },
      variacoes: { nps: 9.4, sla: 4.2, tempo: -16.2, produtividade: 7.8 },
      filiais: { campinas: 96, jundiai: 91, saopaulo: 93 },
      radar: [92, 93, 95, 85, 92, 89],
      ranking: [
        { nome: 'Marina Costa',       score: 97, delta: 5.4 },
        { nome: 'Juliana Prado',      score: 94, delta: 4.6 },
        { nome: 'Rafael Almeida',     score: 93, delta: 3.2 },
        { nome: 'Camila Rezende',     score: 89, delta: 6.1 },
        { nome: 'Bruno Tavares',      score: 86, delta: 2.4 },
      ],
    },
  };

  const RADAR_AXES = ['Velocidade', 'Qualidade', 'Atendimento', 'Conversão', 'Retenção', 'Margem'];

  function getData() {
    return DATA[Dash.getPeriod()] || DATA['1a'];
  }

  function pesoFiliais() {
    const sel = Dash.getSelectedBranches();
    return sel.reduce((s, k) => s + (Dash.FILIAIS[k]?.pesoReceita || 0), 0) || 1;
  }

  function atualizarFiliaisLabel() {
    if (!elFiliaisLbl) return;
    const sel = Dash.getSelectedBranches();
    const total = Object.keys(Dash.FILIAIS).length;
    if (sel.length === total) elFiliaisLbl.textContent = 'Todas as filiais';
    else if (sel.length === 1) elFiliaisLbl.textContent = Dash.FILIAIS[sel[0]].nome;
    else elFiliaisLbl.textContent = sel.map(k => Dash.FILIAIS[k].nome).join(' + ');
  }

  function atualizarBadge(card, variacao, invertido = false) {
    if (!card) return;
    const badge = card.querySelector('.card-badge');
    if (!badge) return;

    const subiu = variacao > 0;
    const bom = invertido ? !subiu : subiu;

    badge.classList.remove('pos', 'neg');
    badge.classList.add(bom ? 'pos' : 'neg');

    const icon = badge.querySelector('.badge-icon path');
    if (icon) icon.setAttribute('d', subiu ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6');

    const valEl = badge.querySelector('.badge-value');
    if (valEl) valEl.textContent = Math.abs(variacao).toFixed(1).replace('.', ',') + '%';
  }

  function renderCards() {
    const d = getData();

    if (elNpsVal)           Dash.animateNumber(elNpsVal, d.kpis.nps);
    if (elSlaVal)           Dash.animateNumber(elSlaVal, d.kpis.sla, { decimals: 1 });
    if (elTempoVal)         Dash.animateNumber(elTempoVal, d.kpis.tempo, { decimals: 1 });
    if (elProdutividadeVal) Dash.animateNumber(elProdutividadeVal, d.kpis.produtividade);

    atualizarBadge(elCardNps,           d.variacoes.nps, false);
    atualizarBadge(elCardSla,           d.variacoes.sla, false);
    atualizarBadge(elCardTempo,         d.variacoes.tempo, true);
    atualizarBadge(elCardProdutividade, d.variacoes.produtividade, false);
  }

  const Chart = (() => {
    if (!elChartHost) return { render() {} };
    let chartData = null;

    function build() {
      const d = getData();
      const { labels, sla, nps, produtividade } = d;

      const max = 100;
      const n = labels.length;
      const xAt = i => (i / (n - 1)) * 100;
      const yAt = v => 100 - (v / max) * 100;

      const ptsS = sla.map((v, i) => [xAt(i), yAt(v)]);
      const ptsN = nps.map((v, i) => [xAt(i), yAt(v)]);
      const ptsP = produtividade.map((v, i) => [xAt(i), yAt(v)]);

      const wrap = document.createElement('div');
      wrap.className = 'chart-inner';

      const svg = svgEl('svg', {
        viewBox: '0 0 100 100',
        preserveAspectRatio: 'none',
        'aria-hidden': 'true',
      });

      const grid = svgEl('g', {
        stroke: 'var(--chart-grid)', 'stroke-width': '1',
        'vector-effect': 'non-scaling-stroke',
      });
      for (let i = 0; i <= 4; i++) {
        const y = (i / 4) * 100;
        grid.appendChild(svgEl('line', { x1: '0', y1: y, x2: '100', y2: y }));
      }
      svg.appendChild(grid);

      [
        { color: 'var(--chart-1)', pts: ptsS },
        { color: 'var(--chart-2)', pts: ptsN },
        { color: 'var(--chart-3)', pts: ptsP },
      ].forEach(({ color, pts }) => {
        const line = svgEl('path', {
          d: smoothPath(pts), fill: 'none', stroke: color,
          'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
          'vector-effect': 'non-scaling-stroke',
        });
        svg.appendChild(line);
      });

      wrap.appendChild(svg);

      const points = document.createElement('div');
      points.className = 'chart-points';
      ptsS.forEach((p, i) => {
        const dot = document.createElement('span');
        dot.className = 'chart-dot';
        dot.style.left = p[0] + '%';
        dot.style.top  = p[1] + '%';
        dot.style.background = 'var(--chart-1)';
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

      chartData = { ptsS, ptsN, ptsP, labels, n, sla, nps, produtividade };

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
        const pS = chartData.ptsS[idx];
        const label = chartData.labels[idx];
        const p = Dash.getPeriod();
        const prefix = p === '1a' ? 'Mês' : 'Semana';

        cursor.style.left = pS[0] + '%';

        tooltip.innerHTML = `
          <div class="tt-label">${prefix} ${label}</div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-1)"></i>SLA</span>
            <span class="tt-val">${chartData.sla[idx]}%</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-2)"></i>NPS</span>
            <span class="tt-val">${chartData.nps[idx]}</span>
          </div>
          <div class="tt-row">
            <span><i class="tt-dot" style="background:var(--chart-3)"></i>Produtividade</span>
            <span class="tt-val">${chartData.produtividade[idx]}%</span>
          </div>
        `;

        const rect = wrap.getBoundingClientRect();
        const padT = 16, padB = 28;
        const topY = Math.min(chartData.ptsS[idx][1], chartData.ptsN[idx][1], chartData.ptsP[idx][1]);
        const padTopPercent = (padT / rect.height) * 100;
        const plotHeightPercent = 100 - padTopPercent - (padB / rect.height) * 100;
        const topPos = padTopPercent + (topY / 100) * plotHeightPercent;

        tooltip.style.left = pS[0] + '%';
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
        } else hideTooltip();
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

  function renderGauge() {
    if (!elGaugeHost) return;
    const d = getData();
    const k = d.kpis;
    const score = Math.round((k.sla + k.nps + k.produtividade + (100 - k.tempo * 10)) / 4);

    const W = 220, H = 130;
    const cx = W / 2, cy = H - 10;
    const r = 80;

    const startAngle = Math.PI;
    const endAngle = 0;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const pathD = `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;

    const circumference = Math.PI * r;
    const dash = (score / 100) * circumference;

    const color = score >= 90 ? 'var(--pos)' :
                  score >= 75 ? 'var(--accent)' :
                  score >= 60 ? 'var(--warn)' : 'var(--neg)';

    elGaugeHost.innerHTML = `
      <svg viewBox="0 0 ${W} ${H}" aria-hidden="true">
        <path class="gauge-track" d="${pathD}"/>
        <path class="gauge-fill" d="${pathD}"
              stroke="${color}"
              stroke-dasharray="${circumference}"
              stroke-dashoffset="${circumference}"
              data-target="${circumference - dash}"/>
        <text class="gauge-value" x="${cx}" y="${cy - 18}">${score}</text>
        <text class="gauge-label" x="${cx}" y="${cy - 2}">Score geral</text>
        <text class="gauge-label" x="${cx}" y="${cy + 14}" style="fill: var(--fg-3)">/ 100</text>
      </svg>
    `;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const fill = elGaugeHost.querySelector('.gauge-fill');
        if (fill) fill.style.strokeDashoffset = fill.dataset.target;
      });
    });
  }

  function renderRadar() {
    if (!elRadarHost) return;
    const d = getData();
    const values = d.radar;
    const N = RADAR_AXES.length;

    const W = 300, H = 300;
    const cx = W / 2, cy = H / 2 + 8;
    const r = 100;

    const angleAt = i => (-Math.PI / 2) + (i * 2 * Math.PI / N);
    const pointAt = (i, ratio) => [
      cx + Math.cos(angleAt(i)) * r * ratio,
      cy + Math.sin(angleAt(i)) * r * ratio,
    ];

    const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}` });

    [0.25, 0.5, 0.75, 1].forEach(nivel => {
      const pts = [];
      for (let i = 0; i < N; i++) pts.push(pointAt(i, nivel));
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
      svg.appendChild(svgEl('path', { d, class: 'radar-grid' }));
    });

    for (let i = 0; i < N; i++) {
      const p = pointAt(i, 1);
      svg.appendChild(svgEl('line', {
        x1: cx, y1: cy, x2: p[0], y2: p[1],
        class: 'radar-grid-axis',
      }));
    }

    const valPts = values.map((v, i) => pointAt(i, Math.max(0.05, v / 100)));
    const valD = valPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ') + ' Z';
    const polygon = svgEl('path', {
      d: valD,
      class: 'radar-polygon is-hidden',
    });
    svg.appendChild(polygon);

    valPts.forEach(p => {
      svg.appendChild(svgEl('circle', {
        cx: p[0], cy: p[1], r: '4', class: 'radar-dot',
      }));
    });

    RADAR_AXES.forEach((label, i) => {
      const p = pointAt(i, 1.18);
      const t = svgEl('text', {
        x: p[0], y: p[1],
        class: 'radar-axis-label',
        dy: '4',
      });
      t.textContent = label;
      svg.appendChild(t);
    });

    elRadarHost.innerHTML = '';
    elRadarHost.appendChild(svg);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        polygon.classList.remove('is-hidden');
      });
    });
  }

  function renderFiliais() {
    if (!elFiliaisList) return;
    const d = getData();
    const sel = Dash.getSelectedBranches();

    const linhas = sel.map(k => {
      const info = Dash.FILIAIS[k];
      return { nome: info.nome, score: d.filiais[k] || 85 };
    }).sort((a, b) => b.score - a.score);

    const maxScore = Math.max(...linhas.map(l => l.score), 1);

    elFiliaisList.innerHTML = linhas.map(l => `
      <div class="margin-item">
        <div class="margin-head">
          <span class="margin-label">${l.nome}</span>
          <span class="margin-value">${l.score}<small>pts</small></span>
        </div>
        <div class="margin-track">
          <div class="margin-fill" style="width:0%" data-w="${(l.score / maxScore) * 100}"></div>
        </div>
      </div>
    `).join('');

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        elFiliaisList.querySelectorAll('.margin-fill').forEach(el => {
          el.style.width = el.dataset.w + '%';
        });
      });
    });
  }

  function renderRanking() {
    if (!elRankingList) return;
    const d = getData();

    elRankingList.innerHTML = d.ranking.map((r, i) => `
      <div class="rank-row">
        <span class="rank-pos ${i < 3 ? 'is-' + (i + 1) : ''}">${i + 1}</span>
        <span class="rank-name">${r.nome}</span>
        <span class="rank-score">${r.score} pts</span>
        <span class="rank-delta ${r.delta >= 0 ? 'pos' : 'neg'}">
          ${r.delta >= 0 ? '+' : ''}${r.delta.toFixed(1).replace('.', ',')}%
        </span>
      </div>
    `).join('');
  }

  function renderAll() {
    atualizarFiliaisLabel();
    renderCards();
    Chart.render();
    renderGauge();
    renderRadar();
    renderFiliais();
    renderRanking();

    // Gera o resumo após as animações
    setTimeout(() => window.Insights?.render('desempenho'), 450);
  }

  Dash.registrarView('desempenho', { onShow: renderAll });

  if (Dash.getView() === 'desempenho') {
    requestAnimationFrame(renderAll);
  }

  document.addEventListener('settings:change', () => {
    if (Dash.getView() === 'desempenho') renderAll();
  });
})();