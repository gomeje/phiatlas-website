/**
 * Amortization Chart View
 * Renders high-DPI HTML5 Canvas decay and capital vs. interest trajectories.
 */
import { formatCurrency } from '../utils/formatters.js';

export class AmortizationChartView {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.legendEl = document.getElementById('chartLegend');
  }

  render(baselineSchedule, acceleratedSchedule, viewMode = 'balance', loanPrincipal = 0) {
    if (!this.canvas || !this.ctx) return;

    this.updateLegend(viewMode);

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 24, bottom: 34, left: 70 };
    const chartW = w - pad.left - pad.right;
    const chartH = h - pad.top - pad.bottom;

    this.ctx.clearRect(0, 0, w, h);

    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textColor = isDark ? '#A8A29E' : '#78716C';

    const maxMonths = baselineSchedule.length || 360;

    if (viewMode === 'balance') {
      this.drawBalanceView(
        baselineSchedule,
        acceleratedSchedule,
        loanPrincipal,
        maxMonths,
        pad,
        chartW,
        chartH,
        w,
        h,
        gridColor,
        textColor,
        isDark
      );
    } else {
      this.drawCapitalVsInterestView(
        acceleratedSchedule,
        loanPrincipal,
        maxMonths,
        pad,
        chartW,
        chartH,
        w,
        h,
        gridColor,
        textColor,
        isDark
      );
    }
  }

  updateLegend(viewMode) {
    if (!this.legendEl) return;
    if (viewMode === 'balance') {
      this.legendEl.innerHTML = `
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: #78716C;"></span>
          <span style="color: var(--text-secondary);">Standard Schedule</span>
        </div>
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: var(--color-gold);"></span>
          <span style="color: var(--color-gold);">Accelerated Schedule</span>
        </div>
      `;
    } else {
      this.legendEl.innerHTML = `
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: var(--color-gold);"></span>
          <span style="color: var(--color-gold);">Cumulative Capital (Equity)</span>
        </div>
        <div class="legend-item">
          <span class="legend-swatch" style="background-color: #DC2626;"></span>
          <span style="color: #DC2626;">Cumulative Interest Paid</span>
        </div>
      `;
    }
  }

  drawBalanceView(base, accel, principal, maxMonths, pad, chartW, chartH, w, h, gridColor, textColor, isDark) {
    const p = Math.max(1, Number(principal) || 1);
    const getX = (m) => pad.left + (m / maxMonths) * chartW;
    const getY = (bal) => pad.top + chartH - ((bal / p) * chartH);

    // Y Axis Ticks
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = textColor;
    this.ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const val = (p / 5) * i;
      const yPos = getY(val);
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, yPos);
      this.ctx.lineTo(w - pad.right, yPos);
      this.ctx.stroke();
      this.ctx.fillText(formatCurrency(val), pad.left - 10, yPos + 4);
    }

    // X Axis Ticks
    this.ctx.textAlign = 'center';
    const totalYears = maxMonths / 12;
    const xStep = totalYears > 20 ? 5 : 2;
    for (let yr = 0; yr <= totalYears; yr += xStep) {
      const xPos = pad.left + ((yr * 12) / maxMonths) * chartW;
      this.ctx.fillText(`${yr}y`, xPos, h - 12);
    }

    // Baseline Line (Dashed Muted)
    if (base && base.length) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#78716C';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 4]);
      this.ctx.moveTo(getX(0), getY(p));
      base.forEach(pt => this.ctx.lineTo(getX(pt.month), getY(pt.remainingBalance)));
      this.ctx.stroke();
      this.ctx.setLineDash([]);
    }

    // Accelerated Line & Fill (Gold)
    if (accel && accel.length) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = '#D4AF37';
      this.ctx.lineWidth = 3;
      this.ctx.moveTo(getX(0), getY(p));
      accel.forEach(pt => this.ctx.lineTo(getX(pt.month), getY(pt.remainingBalance)));
      this.ctx.stroke();

      const lastPt = accel[accel.length - 1];
      this.ctx.lineTo(getX(lastPt.month), getY(0));
      this.ctx.lineTo(getX(0), getY(0));
      this.ctx.closePath();
      this.ctx.fillStyle = isDark ? 'rgba(212, 175, 55, 0.08)' : 'rgba(212, 175, 55, 0.14)';
      this.ctx.fill();
    }
  }

  drawCapitalVsInterestView(accel, principal, maxMonths, pad, chartW, chartH, w, h, gridColor, textColor) {
    if (!accel || !accel.length) return;

    const p = Math.max(1, Number(principal) || 1);
    const lastRow = accel[accel.length - 1];
    const totalInterest = lastRow ? Number(lastRow.cumulativeInterest) || 0 : 0;
    const maxY = Math.max(p, totalInterest, 1);

    const getX = (m) => pad.left + (m / maxMonths) * chartW;
    const getY = (val) => pad.top + chartH - ((val / maxY) * chartH);

    // Y Axis Ticks
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    this.ctx.fillStyle = textColor;
    this.ctx.font = '11px -apple-system, BlinkMacSystemFont, sans-serif';
    this.ctx.textAlign = 'right';

    for (let i = 0; i <= 5; i++) {
      const val = (maxY / 5) * i;
      const yPos = getY(val);
      this.ctx.beginPath();
      this.ctx.moveTo(pad.left, yPos);
      this.ctx.lineTo(w - pad.right, yPos);
      this.ctx.stroke();
      this.ctx.fillText(formatCurrency(val), pad.left - 10, yPos + 4);
    }

    // X Axis Ticks
    this.ctx.textAlign = 'center';
    const totalYears = maxMonths / 12;
    const xStep = totalYears > 20 ? 5 : 2;
    for (let yr = 0; yr <= totalYears; yr += xStep) {
      const xPos = pad.left + ((yr * 12) / maxMonths) * chartW;
      this.ctx.fillText(`${yr}y`, xPos, h - 12);
    }

    // 1. Cumulative Capital Built (Gold)
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = 3;
    this.ctx.moveTo(getX(0), getY(0));
    accel.forEach(pt => {
      this.ctx.lineTo(getX(pt.month), getY(pt.cumulativePrincipal || 0));
    });
    this.ctx.stroke();

    // 2. Cumulative Interest Paid (Crimson)
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#DC2626';
    this.ctx.lineWidth = 2.5;
    this.ctx.moveTo(getX(0), getY(0));
    accel.forEach(pt => {
      this.ctx.lineTo(getX(pt.month), getY(pt.cumulativeInterest || 0));
    });
    this.ctx.stroke();
  }
}