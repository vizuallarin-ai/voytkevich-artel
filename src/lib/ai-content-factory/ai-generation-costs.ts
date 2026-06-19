const INPUT_COST_PER_1K = 0.00015;
const OUTPUT_COST_PER_1K = 0.0006;

export function estimateGenerationCost(
  inputTokens = 0,
  outputTokens = 0,
  provider = "mock",
): number {
  if (provider === "mock") return 0;
  return (inputTokens / 1000) * INPUT_COST_PER_1K + (outputTokens / 1000) * OUTPUT_COST_PER_1K;
}

export function formatCostRub(usd: number, rate = 92): string {
  if (usd === 0) return "0 ₽ (mock)";
  return `~${(usd * rate).toFixed(2)} ₽`;
}
