"use client";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
};

export function HoneypotField({ id = "website", value, onChange }: Props) {
  return (
    <div className="sr-only" aria-hidden>
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name={id}
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
