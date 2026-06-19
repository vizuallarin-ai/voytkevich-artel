export function UTMPreview({ utmUrl, canonicalUrl }: { utmUrl: string; canonicalUrl?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-muted-bg/50 p-4 space-y-2 text-sm">
      <p className="font-medium">UTM-ссылка (для teaser)</p>
      <p className="break-all font-mono text-xs">{utmUrl}</p>
      {canonicalUrl && (
        <>
          <p className="font-medium mt-3">Canonical (без UTM)</p>
          <p className="break-all font-mono text-xs text-muted">{canonicalUrl}</p>
        </>
      )}
    </div>
  );
}
