import { randomUUID } from "crypto";
import type { NavigationAssistantAnswer } from "@/types/ai-navigation";
import { promptInjectionGuard } from "@/lib/ai-navigation/prompt-injection-guard";
import { answerabilityService } from "@/lib/ai-navigation/answerability-service";
import { ragRetrievalService } from "@/lib/ai-navigation/rag-retrieval-service";
import { groundedAnswerService } from "@/lib/ai-navigation/grounded-answer-service";
import {
  navigationMemoryService,
  type NavigationMessage,
} from "@/lib/ai-navigation/navigation-memory-service";
import { ragQualityService } from "@/lib/ai-navigation/rag-quality-service";
import { aiNavigationAnalytics } from "@/lib/ai-navigation/ai-navigation-analytics";

function rankAnswerability(value: NavigationAssistantAnswer["answerability"]): number {
  switch (value) {
    case "requires-manager":
      return 5;
    case "requires-expert":
      return 4;
    case "not-answered":
      return 3;
    case "partially-answered":
      return 2;
    case "answered":
    default:
      return 1;
  }
}

function mergeAnswerability(
  first: NavigationAssistantAnswer["answerability"],
  second: NavigationAssistantAnswer["answerability"],
): NavigationAssistantAnswer["answerability"] {
  return rankAnswerability(first) >= rankAnswerability(second) ? first : second;
}

function buildSuggestedActions(answer: NavigationAssistantAnswer): NavigationAssistantAnswer["suggestedActions"] {
  const actions = [...answer.suggestedActions];
  const hasConsultation = actions.some((action) => action.type === "request-consultation");
  const hasRefine = actions.some((action) => action.type === "refine-question");

  if ((answer.answerability === "requires-manager" || answer.answerability === "requires-expert") && !hasConsultation) {
    actions.push({ type: "request-consultation", title: "Передать вопрос специалисту" });
  }

  if ((answer.answerability === "not-answered" || answer.answerability === "partially-answered") && !hasRefine) {
    actions.push({ type: "refine-question", title: "Уточнить вопрос для точного ответа" });
  }

  if (actions.length === 0) {
    actions.push({ type: "refine-question", title: "Сформулировать уточняющий вопрос" });
  }

  return actions.slice(0, 5);
}

export async function handleNavigationQuestion(
  sessionId: string,
  query: string,
  messages: NavigationMessage[] = [],
): Promise<NavigationAssistantAnswer> {
  await aiNavigationAnalytics.trackQuestionReceived(sessionId, query);

  const injectionDetected =
    promptInjectionGuard.detectPromptInjectionInQuery(query) ||
    promptInjectionGuard.detectSystemPromptExtractionAttempt(query);
  if (injectionDetected) {
    await aiNavigationAnalytics.trackInjectionBlocked(sessionId);
    return promptInjectionGuard.buildSafeInjectionResponse();
  }

  const normalizedMessages = [...messages, { role: "user" as const, content: query }];
  const memory = navigationMemoryService.updateNavigationMemory(sessionId, normalizedMessages);
  const answerability = answerabilityService.evaluateAnswerability(query);

  if (answerability.answerability === "requires-manager") {
    const handoff = groundedAnswerService.buildManagerHandoffResponse(answerability.reasons.join(" "));
    await aiNavigationAnalytics.trackManagerHandoff(sessionId, answerability.highRiskCategory);
    return {
      ...handoff,
      suggestedActions: buildSuggestedActions(handoff),
    };
  }

  const retrieved = await ragRetrievalService.retrieveRAGContext(query);
  const safeContext = promptInjectionGuard.sanitizeRetrievedContext(retrieved);
  await aiNavigationAnalytics.trackRetrievalCompleted(sessionId, {
    fragmentCount: safeContext.length,
    sourceCount: new Set(safeContext.map((fragment) => fragment.sourceId)).size,
  });

  if (safeContext.length === 0) {
    const cannot = groundedAnswerService.buildCannotAnswerResponse("Релевантный indexable контекст не найден.");
    const finalNoContext: NavigationAssistantAnswer = {
      ...cannot,
      answerability: mergeAnswerability(cannot.answerability, answerability.answerability),
      suggestedActions: buildSuggestedActions(cannot),
      limitations: [...cannot.limitations, `Session: ${memory.sessionId}`],
    };
    await aiNavigationAnalytics.trackAnswerGenerated(sessionId, {
      answerability: finalNoContext.answerability,
      confidence: finalNoContext.confidence,
      citationCount: finalNoContext.citations.length,
    });
    return finalNoContext;
  }

  const generated = await groundedAnswerService.generateGroundedAnswer({
    query,
    fragments: safeContext,
  });

  const finalAnswerability = mergeAnswerability(generated.answerability, answerability.answerability);
  const finalAnswer: NavigationAssistantAnswer = {
    ...generated,
    answerability: finalAnswerability,
    suggestedActions: buildSuggestedActions({ ...generated, answerability: finalAnswerability }),
  };

  if (answerability.answerability === "requires-expert") {
    finalAnswer.limitations = [...finalAnswer.limitations, "Для точного ответа требуется инженерная проверка."];
  }

  await aiNavigationAnalytics.trackAnswerGenerated(sessionId, {
    answerability: finalAnswer.answerability,
    confidence: finalAnswer.confidence,
    citationCount: finalAnswer.citations.length,
  });

  ragQualityService.storeAssistantSession({
    id: randomUUID(),
    sessionId,
    query,
    answer: finalAnswer,
    fragments: safeContext,
    createdAt: new Date().toISOString(),
  });

  return finalAnswer;
}

export const navigationAssistantService = {
  handleNavigationQuestion,
};
