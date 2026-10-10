/**
 * Amortization Chart View
 * Renders high-DPI HTML5 Canvas decay curves.
 */

export class AmortizationChartView {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
  }

  render(baselineSchedule, acceleratedSchedule) {
    if (!this.canvas || !this.ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.resetTransform?.();
    this.ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 30, left: 55 };

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    this.ctx.clearRect(0, 0, width, height);

    const maxMonths = baselineSchedule.length;
    const initialPrincipal = baselineSchedule[0]?.remainingBalance + baselineSchedule[0]?.principal || 1;

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    const textMuted = isDark ? '#A8A29E' : '#78716C';

    // Draw Grid Lines
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight * (i / 4));
      this.ctx.beginPath();
      this.ctx.moveTo(padding.left, y);
      this.ctx.lineTo(width - padding.right, y);
      this.ctx.stroke();

      const val = initialPrincipal * (1 - i / 4);
      this.ctx.fillStyle = textMuted;
      this.ctx.font = '10px -apple-system, sans-serif';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(`$${Math.round(val / 1000)}k`, padding.left - 8, y + 3);
    }

    // Helper: Map month & balance to canvas coordinates
    const getX = (month) => padding.left + (month / maxMonths) * chartWidth;
    const getY = (bal) => padding.top + (1 - bal / initialPrincipal) * chartHeight;

    // 1. Draw Baseline Curve (Stone / Subtle)
    this.ctx.strokeStyle = isDark ? '#57534E' : '#A8A29E';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([4, 4]);
    this.ctx.beginPath();
    this.ctx.moveTo(getX(0), getY(initialPrincipal));
    baselineSchedule.forEach(row => {
      this.ctx.lineTo(getX(row.month), getY(row.remainingBalance));
    });
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // 2. Draw Accelerated Curve (Gold Accent)
    this.ctx.strokeStyle = '#D4AF37';
    this.ctx.lineWidth = 2.5;
    this.ctx.beginPath();
    this.ctx.moveTo(getX(0), getY(initialPrincipal));
    acceleratedSchedule.forEach(row => {
      this.ctx.lineTo(getX(row.month), getY(row.remainingBalance));
    });
    this.ctx.stroke();
  }
}