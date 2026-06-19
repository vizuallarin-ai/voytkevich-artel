import type {
  ImageGenerationProvider,
  ImageGenerationProviderRequest,
  ImageGenerationProviderResponse,
} from "@/types/image-generation";

const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450'%3E%3Crect fill='%232B2D30' width='100%25' height='100%25'/%3E%3Ctext x='50%25' y='50%25' fill='%23E07A2F' text-anchor='middle' dy='.3em' font-family='sans-serif' font-size='18'%3EProvider not configured%3C/text%3E%3C/svg%3E";

export const mockImageGenerationProvider: ImageGenerationProvider = {
  id: "mock",
  label: "Mock (dev)",
  isConfigured: true,
  async generateImage(
    request: ImageGenerationProviderRequest,
  ): Promise<ImageGenerationProviderResponse> {
    return {
      success: true,
      imageUrl: PLACEHOLDER_SVG,
      localPath: undefined,
      error: undefined,
    };
  },
};

function createUnconfiguredProvider(id: string, label: string): ImageGenerationProvider {
  return {
    id,
    label,
    isConfigured: false,
    async generateImage(): Promise<ImageGenerationProviderResponse> {
      return {
        success: false,
        error: {
          code: "PROVIDER_NOT_CONFIGURED",
          message: `${label} не настроен. Укажите API ключ в environment variables.`,
        },
      };
    },
  };
}

export const openAiImageProvider: ImageGenerationProvider = {
  id: "openai",
  label: "OpenAI Images",
  isConfigured: Boolean(process.env.OPENAI_API_KEY),
  async generateImage(
    request: ImageGenerationProviderRequest,
  ): Promise<ImageGenerationProviderResponse> {
    if (!process.env.OPENAI_API_KEY) {
      return createUnconfiguredProvider("openai", "OpenAI").generateImage(request);
    }
    // TODO: integrate OpenAI / DALL-E or gpt-image API when production keys available
    return {
      success: false,
      error: {
        code: "NOT_IMPLEMENTED",
        message: "OpenAI image generation integration pending — use prompt-only mode",
      },
    };
  },
};

export function getActiveImageGenerationProvider(): ImageGenerationProvider {
  if (process.env.NODE_ENV === "development") {
    return mockImageGenerationProvider;
  }
  if (openAiImageProvider.isConfigured) {
    return openAiImageProvider;
  }
  return mockImageGenerationProvider;
}

export function listImageGenerationProviders(): ImageGenerationProvider[] {
  return [mockImageGenerationProvider, openAiImageProvider];
}
