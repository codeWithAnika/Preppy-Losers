"use client";

import type { ChartPoint } from "@/lib/admin/types";

interface DashboardChartsProps {
  salesByDay: ChartPoint[];
  ordersByDay: ChartPoint[];
}

function MiniChart({
  title,
  data,
  accent = "#8b1e1e",
}: {
  title: string;
  data: ChartPoint[];
  accent?: string;
}) {
  const max = Math.max(...data.map((point) => point.value), 1);

  return (
    <div className="admin-chart-card">
      <div className="admin-chart-card__head">
        <h3>{title}</h3>
      </div>
      <div className="admin-chart">
        {data.map((point) => (
          <div key={point.label} className="admin-chart__bar-wrap">
            <div
              className="admin-chart__bar"
              style={{
                height: `${Math.max(8, (point.value / max) * 100)}%`,
                background: accent,
              }}
              title={`${point.label}: ${point.value}`}
            />
            <span>{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardCharts({ salesByDay, ordersByDay }: DashboardChartsProps) {
  return (
    <div className="admin-chart-grid">
      <MiniChart title="Sales (14 days)" data={salesByDay} />
      <MiniChart title="Orders (14 days)" data={ordersByDay} accent="#d4d4d4" />
    </div>
  );
}
