"use client";

type Props = {
  prompt?: string;
  negativePrompt?: string;
};

export function ImagePromptPreview({ prompt, negativePrompt }: Props) {
  if (!prompt) {
    return <p className="text-sm text-muted">Сгенерируйте prompt через workspace.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Generation prompt</h3>
        <pre className="whitespace-pre-wrap rounded-sm border border-graphite/10 bg-graphite/5 p-4 text-xs leading-relaxed">
          {prompt}
        </pre>
      </div>
      {negativePrompt && (
        <div>
          <h3 className="text-sm font-medium mb-2">Negative prompt</h3>
          <pre className="whitespace-pre-wrap rounded-sm border border-graphite/10 bg-graphite/5 p-4 text-xs leading-relaxed text-muted">
            {negativePrompt}
          </pre>
        </div>
      )}
    </div>
  );
}
