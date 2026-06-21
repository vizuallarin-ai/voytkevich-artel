import type { GroundedCitation, NavigationAssistantAnswer, RAGContextFragment } from "@/types/ai-navigation";

export type StoredAssistantSession = {
  id: string;
  sessionId: string;
  query: string;
  answer: NavigationAssistantAnswer;
  fragments: RAGContextFragment[];
  createdAt: string;
};

export type RetrievalQuality = {
  fragmentCount: number;
  avgRelevance: number;
  coverageScore: number;
  sourceDiversity: number;
};

export type CitationSupportQuality = {
  citationCount: number;
  supportedCitationCount: number;
  supportRatio: number;
};

export type GroundednessQuality = {
  groundednessScore: number;
  unsupportedKeywordCount: number;
};

const sessionStore = new Map<string, StoredAssistantSession[]>();

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length >= 4);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function evaluateRetrieval(query: string, fragments: RAGContextFragment[]): RetrievalQuality {
  const queryTokens = tokenize(query);
  const corpus = fragments.map((fragment) => `${fragment.title} ${fragment.text}`.toLowerCase());
  const coveredTokens = queryTokens.filter((token) => corpus.some((chunk) => chunk.includes(token)));
  const sourceDiversity = new Set(fragments.map((fragment) => fragment.sourceId)).size;

  return {
    fragmentCount: fragments.length,
    avgRelevance: average(fragments.map((fragment) => fragment.relevance)),
    coverageScore: queryTokens.length > 0 ? coveredTokens.length / queryTokens.length : 0,
    sourceDiversity,
  };
}

export function evaluateCitationSupport(
  citations: GroundedCitation[],
  fragments: RAGContextFragment[],
): CitationSupportQuality {
  const keys = new Set(fragments.map((fragment) => `${fragment.sourceId}::${fragment.contentItemId}`));
  const supportedCitationCount = citations.filter((citation) =>
    keys.has(`${citation.sourceId}::${citation.contentItemId}`),
  ).length;
  const citationCount = citations.length;

  return {
    citationCount,
    supportedCitationCount,
    supportRatio: citationCount > 0 ? supportedCitationCount / citationCount : 0,
  };
}

export function evaluateGroundedness(
  answer: string,
  fragments: RAGContextFragment[],
): GroundednessQuality {
  const sourceCorpus = fragments.map((fragment) => `${fragment.title} ${fragment.text}`).join(" ").toLowerCase();
  const answerKeywords = [...new Set(tokenize(answer))];
  const unsupportedKeywordCount = answerKeywords.filter((keyword) => !sourceCorpus.includes(keyword)).length;
  const groundednessScore =
    answerKeywords.length > 0 ? Math.max(0, 1 - unsupportedKeywordCount / answerKeywords.length) : 0;

  return { groundednessScore, unsupportedKeywordCount };
}

export function storeAssistantSession(record: StoredAssistantSession): void {
  const list = sessionStore.get(record.sessionId) ?? [];
  list.push(record);
  sessionStore.set(record.sessionId, list.slice(-100));
}

export function buildRAGQualityReport(sessionId?: string): {
  sessions: number;
  retrieval: RetrievalQuality;
  citationSupport: CitationSupportQuality;
  groundedness: GroundednessQuality;
} {
  const sessions = sessionId
    ? sessionStore.get(sessionId) ?? []
    : [...sessionStore.values()].flatMap((records) => records);

  const retrievalScores = sessions.map((session) => evaluateRetrieval(session.query, session.fragments));
  const citationScores = sessions.map((session) =>
    evaluateCitationSupport(session.answer.citations, session.fragments),
  );
  const groundednessScores = sessions.map((session) =>
    evaluateGroundedness(session.answer.answer, session.fragments),
  );

  return {
    sessions: sessions.length,
    retrieval: {
      fragmentCount: Math.round(average(retrievalScores.map((score) => score.fragmentCount))),
      avgRelevance: average(retrievalScores.map((score) => score.avgRelevance)),
      coverageScore: average(retrievalScores.map((score) => score.coverageScore)),
      sourceDiversity: Math.round(average(retrievalScores.map((score) => score.sourceDiversity))),
    },
    citationSupport: {
      citationCount: Math.round(average(citationScores.map((score) => score.citationCount))),
      supportedCitationCount: Math.round(
        average(citationScores.map((score) => score.supportedCitationCount)),
      ),
      supportRatio: average(citationScores.map((score) => score.supportRatio)),
    },
    groundedness: {
      groundednessScore: average(groundednessScores.map((score) => score.groundednessScore)),
      unsupportedKeywordCount: Math.round(
        average(groundednessScores.map((score) => score.unsupportedKeywordCount)),
      ),
    },
  };
}

export const ragQualityService = {
  evaluateRetrieval,
  evaluateCitationSupport,
  evaluateGroundedness,
  buildRAGQualityReport,
  storeAssistantSession,
};
