"use client";

import type { ImageValidationResult } from "@/types/image-generation";
import type { VisualAsset } from "@/types/visual-content";

type Props = {
  asset: VisualAsset;
  validation?: ImageValidationResult | null;
};

export function ImageSafetyPanel({ asset, validation }: Props) {
  return (
    <div className="rounded-sm border border-graphite/10 p-4 space-y-3">
      <h3 className="font-medium text-sm">Safety & validation</h3>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-muted">Misleading risk</dt>
          <dd className={asset.safety.misleadingRisk === "high" ? "text-destructive" : ""}>
            {asset.safety.misleadingRisk}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Fake case risk</dt>
          <dd>{asset.safety.fakeCaseRisk}</dd>
        </div>
        <div>
          <dt className="text-muted">Illustration notice</dt>
          <dd>{asset.safety.requiresIllustrationNotice ? "required" : "no"}</dd>
        </div>
        <div>
          <dt className="text-muted">Real object photo</dt>
          <dd>{asset.safety.isRealObjectPhoto ? "yes" : "no"}</dd>
        </div>
      </dl>
      {validation && (
        <>
          {validation.blockers.length > 0 && (
            <ul className="text-xs text-destructive list-disc pl-4">
              {validation.blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {validation.warnings.length > 0 && (
            <ul className="text-xs text-muted list-disc pl-4">
              {validation.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          )}
          <p className="text-xs">
            Can approve: {validation.canApprove ? "yes" : "no"} · Site:{" "}
            {validation.canUseOnSite ? "yes" : "no"} · Distribution:{" "}
            {validation.canUseInDistribution ? "yes" : "no"}
          </p>
        </>
      )}
    </div>
  );
}
