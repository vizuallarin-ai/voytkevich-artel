import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { SEARCH_QUERY_MAX_LENGTH } from "@/data/search-synonyms";
import { searchBootstrapService } from "@/lib/search/search-bootstrap-service";
import { searchSuggestionService } from "@/lib/search/search-suggestion-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { searchAnalytics } from "@/lib/search/search-analytics";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`search-suggest:${ip}`, { limit: 120, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  if (rawQuery.length > SEARCH_QUERY_MAX_LENGTH) {
    return NextResponse.json({ suggestions: [] });
  }

  await searchBootstrapService.ensureSearchIndexReady();
  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(rawQuery);
  const suggestions = searchSuggestionService.getSearchSuggestions(normalizedQuery);

  searchAnalytics.trackSearchSessionStarted({ normalizedQuery });

  return NextResponse.json({ suggestions: suggestions.slice(0, 10) });
}
