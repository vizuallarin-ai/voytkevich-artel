export function TechnicalStepsBlock({ title, steps }: { title: string; steps: string[] }) {
  const items = steps.filter(Boolean);
  if (!items.length) return null;

  return (
    <section className="mt-10" aria-labelledby="technical-steps">
      <h2 id="technical-steps" className="font-display text-2xl">
        {title}
      </h2>
      <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-muted">
        {items.map((step) => (
          <li key={step.slice(0, 48)}>{step}</li>
        ))}
      </ol>
    </section>
  );
}
