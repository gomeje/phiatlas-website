/**
 * DCF Chart View
 * Renders HTML5 Canvas visualizations: Annual Cash Flows vs. Exit Capital Stack.
 */
import { formatCurrency } from '../utils/formatters.js';

export class DCFChartView {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.legendEl = document.getElementById('chartLegend');
  }

  render(model, viewMode = 'cashFlows') {
    if (!this.canvas || !this.ctx || !model) return;

    this.updateLegend(viewMode);

    const dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;
    const displayWidth = parent ? parent.clientWidth : 700;
    const displayHeight = 380; // Fixed physical layout height

    if (displayWidth === 0) return;

    // Set internal canvas resolution for crisp Retina/HiDPI rendering
    this.canvas.width = Math.round(displayWidth * dpr);
    this.canvas.height = Math.round(displayHeight * dpr);

    // Lock CSS display size to parent container
    this.canvas.style.width = `${displayWidth}px`;
    this.canvas.style.height = `${displayHeight}px`;

    // Reset coordinate matrix and apply clean DPI scale
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = displayWidth;
    const h = displayHeight;
    const pad = { top: 25, right: 30, bottom: 40, left: 75 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    this.ctx.clearRect(0, 0, w, h);

    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#A8A29E' : '#78716C';

    if (viewMode === 'cashFlows') {
      this.drawCashFlows(model, pad, chartW, chartH, w, h, gridColor, textColor);
    } else {
      this.drawExitStack(model, pad, chartW, chartH, w, h, gridColor, textColor);
    }
  }

  updateLegend(viewMode) {
    if (!this.legendEl) return;
    if (viewMode === 'cashFlows') {
      this.legendEl.innerHTML = `
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: #78716C;"></span>
          <span style="color: var(--text-secondary);">Unlevered FCF (UFCF)</span>
        </div>
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: var(--color-gold);"></span>
          <span style="color: var(--color-gold);">Levered FCF (Equity Distribution)</span>
        </div>
      `;
    } else {
      this.legendEl.innerHTML = `
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: #3B82F6;"></span>
          <span style="color: var(--text-secondary);">Loan Payoff at Exit</span>
        </div>
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: var(--color-gold);"></span>
          <span style="color: var(--color-gold);">Net Equity Residual Proceeds</span>
        </div>
      `;
    }
  }

  drawCashFlows(model, pad, chartW, chartH, w, h, gridColor, textColor) {
    const proForma = model.proForma || [];
    const count = proForma.length;
    if (count === 0) return;

    let maxVal = 0;
    proForma.forEach(yr => {
      maxVal = Math.max(maxVal, yr.ufcf || 0, yr.lfcf || 0);
    });
    maxVal = (maxVal * 1.2) || 100000;

    // Y Axis Ticks
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = textColor;
    this.ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const val = (maxVal / 5) * i;
      const yPos = pad.top + chartH - ((val / maxVal) * chartH);
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, yPos);
      this.ctx.lineTo(w - pad.right, yPos);
      this.ctx.stroke();
      this.ctx.fillText(formatCurrency(val), pad.left - 10, yPos + 4);
    }

    const groupWidth = chartW / count;
    const barWidth = Math.min(32, groupWidth * 0.35);

    proForma.forEach((yr, idx) => {
      const groupCenter = pad.left + (idx * groupWidth) + (groupWidth / 2);

      // X Axis Label
      this.ctx.fillStyle = textColor;
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`Year ${yr.year}`, groupCenter, h - 14);

      // Bar 1: UFCF (Stone Gray)
      const uH = Math.max(0, (yr.ufcf / maxVal) * chartH);
      const uX = groupCenter - barWidth - 3;
      const uY = pad.top + chartH - uH;
      this.ctx.fillStyle = '#78716C';
      this.ctx.fillRect(uX, uY, barWidth, uH);

      // Bar 2: LFCF (Gold)
      const lH = Math.max(0, (yr.lfcf / maxVal) * chartH);
      const lX = groupCenter + 3;
      const lY = pad.top + chartH - lH;
      this.ctx.fillStyle = '#D4AF37';
      this.ctx.fillRect(lX, lY, barWidth, lH);
    });
  }

  drawExitStack(model, pad, chartW, chartH, w, h, gridColor, textColor) {
    const grossExit = (model.exit && model.exit.grossExitPrice) || 1;
    const debtExit = (model.financing && model.financing.loanBalanceAtExit) || 0;
    const equityExit = (model.exit && model.exit.netEquityAtExit) || 0;

    // Y Axis Ticks
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = textColor;
    this.ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const val = (grossExit / 5) * i;
      const yPos = pad.top + chartH - ((val / grossExit) * chartH);
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, yPos);
      this.ctx.lineTo(w - pad.right, yPos);
      this.ctx.stroke();
      this.ctx.fillText(formatCurrency(val), pad.left - 10, yPos + 4);
    }

    // Stacked Bar in center
    const barW = Math.min(140, chartW * 0.4);
    const barX = pad.left + (chartW / 2) - (barW / 2);

    const debtH = Math.max(0, (debtExit / grossExit) * chartH);
    const equityH = Math.max(0, (equityExit / grossExit) * chartH);

    // Debt segment (Bottom)
    const debtY = pad.top + chartH - debtH;
    this.ctx.fillStyle = '#3B82F6';
    this.ctx.fillRect(barX, debtY, barW, debtH);

    // Equity segment (Top)
    const equityY = debtY - equityH;
    this.ctx.fillStyle = '#D4AF37';
    this.ctx.fillRect(barX, equityY, barW, equityH);

    // X Axis Label
    this.ctx.fillStyle = textColor;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`Exit Capital Realization`, barX + (barW / 2), h - 14);
  }
}