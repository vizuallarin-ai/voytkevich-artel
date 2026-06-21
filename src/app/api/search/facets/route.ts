import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { searchBootstrapService } from "@/lib/search/search-bootstrap-service";
import { hybridRetrievalService } from "@/lib/search/hybrid-retrieval-service";
import { queryNormalizationService } from "@/lib/search/query-normalization-service";
import { searchFacetService } from "@/lib/search/search-facet-service";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`search-facets:${ip}`, { limit: 60, windowMs: 60_000 });
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get("q") ?? "";
  const normalizedQuery = queryNormalizationService.normalizeSearchQuery(rawQuery);

  await searchBootstrapService.ensureSearchIndexReady();

  const filters = searchFacetService.parseSearchFilters(searchParams);
  let results = normalizedQuery
    ? hybridRetrievalService.searchHybrid(normalizedQuery, { limit: 100 })
    : [];
  results = searchFacetService.applySearchFacets(results, filters);

  return NextResponse.json({
    query: rawQuery,
    normalizedQuery,
    facets: searchFacetService.buildSearchFacets(results),
    resultCount: results.length,
  });
}
