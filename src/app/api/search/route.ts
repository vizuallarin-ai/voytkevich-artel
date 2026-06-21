import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SEARCH_QUERY_MAX_LENGTH, SEARCH_RESULTS_PAGE_SIZE } from "@/data/search-synonyms";
import { searchBootstrapService } from "@/lib/search/search-bootstrap-service";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { queryIntentService } from "@/lib/search/query-intent-service";
import { searchFacetService } from "@/lib/search/search-facet-service";
import { searchDiversityService } from "@/lib/search/search-diversity-service";
import { searchRankingService } from "@/lib/search/search-ranking-service";
import { typoToleranceService } from "@/lib/search/typo-tolerance-service";
import { zeroResultsService } from "@/lib/search/zero-results-service";
import { searchSuggestionService } from "@/lib/search/search-suggestion-service";
import { searchAnalytics } from "@/lib/search/search-analytics";
import { searchStore } from "@/lib/search/search-store";
import type { SearchMode } from "@/types/search-query";

export async function GET(request: Request) {
  const started = Date.now();
  const ip = getClientIp(request);
  const rate = checkRateLimit(`search:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const sessionId = searchParams.get("sessionId") ?? randomUUID();
  const requestId = randomUUID();

  if (rawQuery.length > SEARCH_QUERY_MAX_LENGTH) {
    return NextResponse.json({ error: "Query too long" }, { status: 400 });
  }

  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(rawQuery);
  if (!normalizedQuery.trim()) {
    return NextResponse.json({
      requestId,
      query: rawQuery,
      normalizedQuery,
      results: [],
      total: 0,
      zeroResult: true,
    });
  }

  await searchBootstrapService.ensureSearchIndexReady();

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(
    SEARCH_RESULTS_PAGE_SIZE,
    Math.max(1, Number(searchParams.get("pageSize") ?? String(SEARCH_RESULTS_PAGE_SIZE))),
  );
  const mode = (searchParams.get("mode") ?? "balanced") as SearchMode;
  const filters = searchFacetService.parseSearchFilters(searchParams);

  let query = normalizedQuery;
  const correction = typoToleranceService.applySafeQueryCorrection(query);
  if (correction.applied && correction.correctedQuery) {
    query = correction.correctedQuery;
    searchAnalytics.trackSearchCorrectionApplied({
      requestId,
      sessionId,
      normalizedQuery: query,
    });
  }

  const intent = queryIntentService.detectQueryIntent(query);
  let results = hybridRetrievalService.searchHybrid(query, { limit: pageSize * 3, mode });
  results = searchFacetService.applySearchFacets(results, filters);
  results = searchRankingService.rankSearchResults(results, { intent: intent.intent });
  results = searchDiversityService.preserveTopExactMatch(results, query);
  results = searchDiversityService.limitDuplicateProjectVariants(results);
  results = searchDiversityService.diversifyResultsByContentType(results);

  let zeroResult = results.length === 0;
  if (zeroResult) {
    const relaxed = zeroResultsService.searchWithRelaxedFilters(query, filters);
    if (relaxed.length > 0) {
      results = relaxed.slice(0, pageSize);
      zeroResult = false;
      searchAnalytics.trackSearchZeroResultRecovered({ requestId, sessionId, normalizedQuery: query });
    } else {
      zeroResultsService.createZeroResultAnalyticsRecord(query);
      searchAnalytics.trackSearchZeroResultDetected({ requestId, sessionId, normalizedQuery: query });
    }
  }

  const offset = (page - 1) * pageSize;
  const paged = results.slice(offset, offset + pageSize);
  const facets = searchFacetService.buildSearchFacets(results);
  const relatedQueries = zeroResultsService.recommendAlternativeQueries(query);

  searchStore.appendQueryLog({
    requestId,
    sessionId,
    rawQuery,
    normalizedQuery: query,
    resultCount: results.length,
    intent: intent.intent,
    latencyMs: Date.now() - started,
  });

  searchAnalytics.trackSearchQuerySubmitted({
    requestId,
    sessionId,
    normalizedQuery: query,
    intent: intent.intent,
    intentConfidence: intent.confidence,
    resultCount: String(results.length),
    searchMode: mode,
  });

  return NextResponse.json({
    requestId,
    sessionId,
    query: rawQuery,
    normalizedQuery: query,
    intent: intent.intent,
    results: paged,
    facets,
    total: results.length,
    page,
    pageSize,
    correction: correction.applied ? correction.correctedQuery : undefined,
    relatedQueries,
    zeroResult,
    searchMode: mode,
    latencyMs: Date.now() - started,
  });
}
