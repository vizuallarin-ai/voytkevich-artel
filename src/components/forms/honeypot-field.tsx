"use client";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
};

/** Honeypot — скрыт от пользователей, доступен только ботам. */
export function HoneypotField({ id = "website", value, onChange }: Props) {
  return (
    <div
      className="pointer-events-none absolute left-[-10000px] top-auto h-px w-px overflow-hidden opacity-0"
      aria-hidden="true"
    >
      <input
        id={id}
        name={id}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
