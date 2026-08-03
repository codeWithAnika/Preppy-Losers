import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
}

export function StatCard({ label, value, hint, icon }: StatCardProps) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-card__top">
        <p className="admin-stat-card__label">{label}</p>
        {icon ? <div className="admin-stat-card__icon">{icon}</div> : null}
      </div>
      <p className="admin-stat-card__value">{value}</p>
      {hint ? <p className="admin-stat-card__hint">{hint}</p> : null}
    </div>
  );
}
