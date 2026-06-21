import type { NavigationAssistantAnswer } from "@/types/ai-navigation";

export type HighRiskCategory =
  | "exact-cost"
  | "legal-guarantees"
  | "engineering-without-site-data"
  | "none";

export type AnswerabilityEvaluation = {
  answerability: NavigationAssistantAnswer["answerability"];
  confidence: NavigationAssistantAnswer["confidence"];
  highRisk: boolean;
  highRiskCategory: HighRiskCategory;
  reasons: string[];
};

const EXACT_COST_PATTERNS = [
  /точн(ая|ую|ой)\s+(цен|смет)/i,
  /фиксированн(ая|ую)\s+стоим/i,
  /сколько\s+точно\s+стоит/i,
  /exact\s+price/i,
  /exact\s+cost/i,
];

const LEGAL_GUARANTEE_PATTERNS = [
  /юридическ(ая|ую)\s+гаранти/i,
  /гарантир(уете|овать)\s+по\s+договору/i,
  /правов(ая|ые)\s+обязательств/i,
  /legal\s+guarantee/i,
];

const ENGINEERING_PATTERNS = [
  /какой\s+фундамент/i,
  /рассч(итай|ет)\s+фундамент/i,
  /несущ(ая|ую)\s+способност/i,
  /нагрузк/i,
  /глубина\s+фундамента/i,
];

const SITE_DATA_PATTERNS = [/геологи/i, /участ(ок|ка)/i, /грунт/i, /уклон/i, /уровень\s+грунтовых\s+вод/i];

const EXPERT_PATTERNS = [/проект\s+конструкции/i, /инженерн(ый|ые)\s+расчет/i, /расчет\s+нагруз/i];

function matchesAny(query: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(query));
}

export function detectHighRiskQuestion(query: string): {
  highRisk: boolean;
  category: HighRiskCategory;
  reason?: string;
} {
  if (matchesAny(query, EXACT_COST_PATTERNS) || /смет/i.test(query)) {
    return { highRisk: true, category: "exact-cost", reason: "Запрос на точную смету/стоимость." };
  }

  if (matchesAny(query, LEGAL_GUARANTEE_PATTERNS) || /гаранти/i.test(query)) {
    return { highRisk: true, category: "legal-guarantees", reason: "Запрос на юридические гарантии." };
  }

  const asksEngineering = matchesAny(query, ENGINEERING_PATTERNS);
  const hasSiteData = matchesAny(query, SITE_DATA_PATTERNS);
  if (asksEngineering && !hasSiteData) {
    return {
      highRisk: true,
      category: "engineering-without-site-data",
      reason: "Инженерный вопрос без данных участка.",
    };
  }

  return { highRisk: false, category: "none" };
}

export function requiresManagerHandoff(query: string): boolean {
  const low = query.toLowerCase();
  return (
    detectHighRiskQuestion(query).category === "exact-cost" ||
    detectHighRiskQuestion(query).category === "legal-guarantees" ||
    /связ(ать|аться)\s+с\s+менеджер/i.test(low) ||
    /остав(ить|лю)\s+контакт/i.test(low)
  );
}

export function requiresExpertAnswer(query: string): boolean {
  const highRisk = detectHighRiskQuestion(query);
  if (highRisk.category === "engineering-without-site-data") return true;
  return matchesAny(query, EXPERT_PATTERNS) || /фундамент/i.test(query);
}

export function evaluateAnswerability(query: string): AnswerabilityEvaluation {
  const reasons: string[] = [];
  const risk = detectHighRiskQuestion(query);

  if (risk.reason) reasons.push(risk.reason);

  if (requiresManagerHandoff(query)) {
    reasons.push("Нужна передача менеджеру.");
    return {
      answerability: "requires-manager",
      confidence: "high",
      highRisk: risk.highRisk,
      highRiskCategory: risk.category,
      reasons,
    };
  }

  if (requiresExpertAnswer(query)) {
    reasons.push("Нужен профильный эксперт.");
    return {
      answerability: "requires-expert",
      confidence: "medium",
      highRisk: risk.highRisk,
      highRiskCategory: risk.category,
      reasons,
    };
  }

  return {
    answerability: "answered",
    confidence: risk.highRisk ? "low" : "medium",
    highRisk: risk.highRisk,
    highRiskCategory: risk.category,
    reasons,
  };
}

export const answerabilityService = {
  evaluateAnswerability,
  detectHighRiskQuestion,
  requiresManagerHandoff,
  requiresExpertAnswer,
};
