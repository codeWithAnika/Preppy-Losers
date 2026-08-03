"use client";

interface DropSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
}

export function DropSelector({
  value,
  onChange,
  options = [1, 2, 3, 4, 5],
}: DropSelectorProps) {
  return (
    <div className="admin-drop-selector">
      {options.map((drop) => (
        <button
          key={drop}
          type="button"
          className={`admin-drop-selector__item ${value === drop ? "is-active" : ""}`}
          onClick={() => onChange(drop)}
        >
          DROP {String(drop).padStart(2, "0")}
        </button>
      ))}
    </div>
  );
}
