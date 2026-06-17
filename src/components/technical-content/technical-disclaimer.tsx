import { getTechnicalDisclaimerById } from "@/data/technical-disclaimers";

export function TechnicalDisclaimer({ disclaimerId }: { disclaimerId: string }) {
  const disclaimer = getTechnicalDisclaimerById(disclaimerId);
  if (!disclaimer) return null;

  return (
    <aside
      className="mt-6 rounded-sm border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-950"
      role="note"
      aria-label="Важное уточнение"
    >
      <p className="font-medium">{disclaimer.title}</p>
      <p className="mt-1 leading-relaxed">{disclaimer.text}</p>
    </aside>
  );
}
