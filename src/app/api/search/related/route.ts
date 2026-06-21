import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { zeroResultsService } from "@/lib/search/zero-results-service";
import { searchSuggestionService } from "@/lib/search/search-suggestion-service";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { searchBootstrapService } from "@/lib/search/search-bootstrap-service";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`search-related:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(rawQuery);

  if (!normalizedQuery.trim()) {
    return NextResponse.json({ relatedQueries: [], suggestions: [] });
  }

  await searchBootstrapService.ensureSearchIndexReady();

  const results = hybridRetrievalService.searchHybrid(normalizedQuery, { limit: 10 });
  const relatedQueries = zeroResultsService.recommendAlternativeQueries(normalizedQuery);
  const suggestions = searchSuggestionService.getSearchSuggestions(normalizedQuery, 8);

  return NextResponse.json({
    query: rawQuery,
    normalizedQuery,
    relatedQueries,
    suggestions,
    topResultTypes: [...new Set(results.map((result) => result.type))].slice(0, 5),
  });
}
