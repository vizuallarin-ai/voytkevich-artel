export const AI_CONTENT_OUTPUT_SCHEMAS: Record<string, Record<string, unknown>> = {
  brief: {
    type: "object",
    properties: {
      topic: { type: "string" },
      contentGoal: { type: "string" },
      audience: { type: "string" },
      searchIntent: { type: "string" },
      recommendedStructure: { type: "array" },
      requiredBlocks: { type: "array" },
      requiredCTA: { type: "string" },
      relatedPages: { type: "array" },
      qualityRequirements: { type: "array" },
      risksToAvoid: { type: "array" },
    },
  },
  fullDraft: {
    type: "object",
    properties: {
      title: { type: "string" },
      h1: { type: "string" },
      slug: { type: "string" },
      intro: { type: "string" },
      body: { type: "string" },
      blocks: { type: "array" },
      conclusion: { type: "string" },
      faq: { type: "array" },
      cta: { type: "object" },
      relatedLinks: { type: "array" },
      metadata: { type: "object" },
      warnings: { type: "array" },
      notes: { type: "array" },
    },
  },
  faq: {
    type: "object",
    properties: {
      faq: { type: "array", items: { type: "object" } },
    },
  },
  metadata: {
    type: "object",
    properties: {
      title: { type: "string" },
      description: { type: "string" },
      robots: { type: "object" },
    },
  },
  cta: {
    type: "object",
    properties: {
      primary: { type: "string" },
      secondary: { type: "string" },
      sourceCTA: { type: "string" },
    },
  },
  relatedLinks: {
    type: "object",
    properties: {
      relatedLinks: { type: "array" },
    },
  },
  teasers: {
    type: "object",
    properties: {
      teasers: { type: "array" },
    },
  },
};
