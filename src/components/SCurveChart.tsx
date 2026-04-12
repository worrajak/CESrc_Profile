'use client';

import { useEffect, useRef } from 'react';

interface DataPoint {
  log_date: string;
  planned_pct: number;
  actual_pct: number;
}

interface SCurveChartProps {
  dataPoints: DataPoint[];
  startDate?: string;
  endDate?: string;
  height?: number;
}

export default function SCurveChart({ dataPoints, startDate, endDate, height = 320 }: SCurveChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Padding
    const pad = { top: 30, right: 30, bottom: 50, left: 55 };
    const chartW = W - pad.left - pad.right;
    const chartH = H - pad.top - pad.bottom;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#fafbfc';
    ctx.fillRect(0, 0, W, H);

    // No data
    if (!dataPoints || dataPoints.length === 0) {
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('ยังไม่มีข้อมูล S-Curve', W / 2, H / 2);
      return;
    }

    // Sort by date
    const sorted = [...dataPoints].sort((a, b) => a.log_date.localeCompare(b.log_date));

    // Add start/end anchors
    const allDates: string[] = [];
    if (startDate && startDate < sorted[0]?.log_date) allDates.push(startDate);
    sorted.forEach(p => allDates.push(p.log_date));
    if (endDate && endDate > sorted[sorted.length - 1]?.log_date) allDates.push(endDate);

    const dateToX = (dateStr: string) => {
      const minDate = new Date(allDates[0]).getTime();
      const maxDate = new Date(allDates[allDates.length - 1]).getTime();
      const range = maxDate - minDate || 1;
      const t = (new Date(dateStr).getTime() - minDate) / range;
      return pad.left + t * chartW;
    };

    const pctToY = (pct: number) => {
      return pad.top + chartH - (pct / 100) * chartH;
    };

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let p = 0; p <= 100; p += 20) {
      const y = pctToY(p);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + chartW, y);
      ctx.stroke();

      // Y labels
      ctx.fillStyle = '#6b7280';
      ctx.font = '11px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${p}%`, pad.left - 8, y + 4);
    }

    // X axis labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px system-ui';
    ctx.textAlign = 'center';
    const maxLabels = Math.min(allDates.length, 8);
    const step = Math.max(1, Math.floor(allDates.length / maxLabels));
    for (let i = 0; i < allDates.length; i += step) {
      const x = dateToX(allDates[i]);
      const d = new Date(allDates[i]);
      const label = `${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
      ctx.fillText(label, x, pad.top + chartH + 20);
    }

    // Today line
    const today = new Date().toISOString().split('T')[0];
    if (today >= allDates[0] && today <= allDates[allDates.length - 1]) {
      const tx = dateToX(today);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(tx, pad.top);
      ctx.lineTo(tx, pad.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.font = '10px system-ui';
      ctx.fillText('Today', tx, pad.top - 5);
    }

    // Helper: draw smooth line
    const drawLine = (points: { x: number; y: number }[], color: string, dashed = false) => {
      if (points.length < 2) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      if (dashed) ctx.setLineDash([6, 4]);
      else ctx.setLineDash([]);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        ctx.quadraticCurveTo(prev.x + (cpx - prev.x) * 0.8, prev.y, cpx, (prev.y + curr.y) / 2);
        ctx.quadraticCurveTo(curr.x - (curr.x - cpx) * 0.8, curr.y, curr.x, curr.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    // Planned line (blue dashed)
    const plannedPts = sorted
      .filter(p => p.planned_pct != null)
      .map(p => ({ x: dateToX(p.log_date), y: pctToY(p.planned_pct) }));

    // Add start anchor
    if (startDate) plannedPts.unshift({ x: dateToX(startDate), y: pctToY(0) });
    if (endDate && sorted[sorted.length - 1]?.planned_pct < 100) {
      plannedPts.push({ x: dateToX(endDate), y: pctToY(100) });
    }

    drawLine(plannedPts, '#3b82f6', true);

    // Actual line (green solid)
    const actualPts = sorted
      .filter(p => p.actual_pct != null && p.actual_pct > 0)
      .map(p => ({ x: dateToX(p.log_date), y: pctToY(p.actual_pct) }));

    if (startDate && actualPts.length > 0) {
      actualPts.unshift({ x: dateToX(startDate), y: pctToY(0) });
    }

    drawLine(actualPts, '#10b981', false);

    // Fill area between planned and actual (where actual < planned = red zone)
    if (plannedPts.length > 1 && actualPts.length > 1) {
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ef4444';

      // Simple fill between last points
      const lastPlanned = plannedPts[plannedPts.length - 1];
      const lastActual = actualPts[actualPts.length - 1];
      if (lastActual.y > lastPlanned.y) { // actual < planned in chart coords (y inverted)
        ctx.beginPath();
        for (const p of actualPts) ctx.lineTo(p.x, p.y);
        for (let i = plannedPts.length - 1; i >= 0; i--) {
          if (plannedPts[i].x <= actualPts[actualPts.length - 1].x) {
            ctx.lineTo(plannedPts[i].x, plannedPts[i].y);
          }
        }
        ctx.closePath();
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Dots
    for (const p of sorted) {
      if (p.planned_pct != null) {
        const x = dateToX(p.log_date);
        const y = pctToY(p.planned_pct);
        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      if (p.actual_pct != null && p.actual_pct > 0) {
        const x = dateToX(p.log_date);
        const y = pctToY(p.actual_pct);
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Legend
    const legendY = pad.top - 15;
    // Planned
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.left, legendY);
    ctx.lineTo(pad.left + 30, legendY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#3b82f6';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText('แผน (Planned)', pad.left + 35, legendY + 4);

    // Actual
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pad.left + 140, legendY);
    ctx.lineTo(pad.left + 170, legendY);
    ctx.stroke();
    ctx.fillStyle = '#10b981';
    ctx.fillText('จริง (Actual)', pad.left + 175, legendY + 4);

  }, [dataPoints, startDate, endDate, height]);

  return (
    <div className="w-full">
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="rounded-lg"
      />
    </div>
  );
}
