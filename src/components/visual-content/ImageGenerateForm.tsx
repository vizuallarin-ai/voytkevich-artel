"use client";

import { useState } from "react";
import type { ImageGenerationMode } from "@/types/image-generation";
import type { VisualAspectRatio } from "@/types/visual-content";
import { ImagePromptPreview } from "./ImagePromptPreview";
import { ImageSafetyPanel } from "./ImageSafetyPanel";
import type { VisualAsset } from "@/types/visual-content";
import { validateVisualAsset } from "@/lib/visual-content/image-validation";
import Link from "next/link";

const MODES: ImageGenerationMode[] = [
  "content-cover",
  "technical-diagram",
  "editorial-illustration",
  "social-teaser",
  "brand-character-scene",
  "og-image",
  "favicon",
];

const RATIOS: VisualAspectRatio[] = ["16:9", "1:1", "4:5", "9:16"];

export function ImageGenerateForm() {
  const [mode, setMode] = useState<ImageGenerationMode>("content-cover");
  const [topic, setTopic] = useState("");
  const [aspectRatio, setAspectRatio] = useState<VisualAspectRatio>("16:9");
  const [titleText, setTitleText] = useState("");
  const [subtitleText, setSubtitleText] = useState("");
  const [additionalContext, setAdditionalContext] = useState("");
  const [useBrandCharacter, setUseBrandCharacter] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [asset, setAsset] = useState<VisualAsset | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providerNote, setProviderNote] = useState<string | null>(null);

  async function handleGenerate(promptOnly = true) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard/visual-content/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          topic,
          aspectRatio,
          titleText,
          subtitleText,
          additionalContext,
          brandCharacterId: useBrandCharacter ? "stroistroy-master" : undefined,
          executeGeneration: !promptOnly,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");
      setPrompt(data.prompt);
      setNegativePrompt(data.negativePrompt);
      setAsset(data.asset);
      if (!promptOnly && data.asset?.fileUrl?.includes("Provider not configured")) {
        setProviderNote("Provider not configured — показан placeholder");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const validation = asset ? validateVisualAsset(asset) : null;
  const highRisk = asset?.safety.misleadingRisk === "high";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void handleGenerate(true);
        }}
      >
        <div>
          <label className="text-xs text-muted">Generation mode</label>
          <select
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
            value={mode}
            onChange={(e) => setMode(e.target.value as ImageGenerationMode)}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted">Topic *</label>
          <input
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted">Aspect ratio</label>
          <select
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value as VisualAspectRatio)}
          >
            {RATIOS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useBrandCharacter}
            onChange={(e) => setUseBrandCharacter(e.target.checked)}
          />
          Brand character (СтройСтрой Мастер)
        </label>
        <div>
          <label className="text-xs text-muted">Title text (overlay, programmatic)</label>
          <input
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
            value={titleText}
            onChange={(e) => setTitleText(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted">Subtitle text</label>
          <input
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm"
            value={subtitleText}
            onChange={(e) => setSubtitleText(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs text-muted">Additional context</label>
          <textarea
            className="mt-1 w-full rounded-sm border border-graphite/20 bg-background px-3 py-2 text-sm min-h-[80px]"
            value={additionalContext}
            onChange={(e) => setAdditionalContext(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading || !topic}
            className="rounded-sm bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50"
          >
            {loading ? "..." : "Generate prompt & save draft"}
          </button>
          <button
            type="button"
            disabled={loading || !topic}
            onClick={() => void handleGenerate(false)}
            className="rounded-sm border border-graphite/20 px-4 py-2 text-sm disabled:opacity-50"
          >
            Run provider (dev mock)
          </button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        {providerNote && <p className="text-xs text-muted">{providerNote}</p>}
        <p className="text-[10px] text-muted max-w-md">
          Нет auto-publish. High-risk assets нельзя attach без review. Текст на обложках — только программно.
        </p>
      </form>

      <div className="space-y-6">
        <ImagePromptPreview prompt={prompt} negativePrompt={negativePrompt} />
        {asset && (
          <>
            <ImageSafetyPanel asset={asset} validation={validation} />
            <div className="rounded-sm border border-graphite/10 p-4">
              <p className="text-sm font-medium">Saved asset: {asset.id}</p>
              <p className="text-xs text-muted mt-1">Status: {asset.status}</p>
              {asset.fileUrl && (
                <div className="mt-3 aspect-video max-w-sm overflow-hidden rounded-sm bg-graphite/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.fileUrl} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <Link
                href={`/dashboard/content/visuals/${asset.id}`}
                className="mt-3 inline-block text-sm text-primary underline"
              >
                Открыть asset →
              </Link>
              {highRisk && (
                <p className="mt-2 text-xs text-destructive">High risk — attach заблокирован до review</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
