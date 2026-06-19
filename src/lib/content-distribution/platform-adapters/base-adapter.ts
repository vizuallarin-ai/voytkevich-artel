import type {
  ExternalPublication,
  PlatformAdapter,
  PublishResult,
  PublicationValidationResult,
} from "@/types/content-distribution";
import { validatePublication } from "@/lib/content-distribution/publication-validator";

export function createBaseAdapter(
  platformId: string,
  options: {
    canPublish: boolean;
    canSchedule: boolean;
    requiresManualExport: boolean;
  },
): PlatformAdapter {
  return {
    platformId,
    canPublish: options.canPublish,
    canSchedule: options.canSchedule,
    requiresManualExport: options.requiresManualExport,
    async validate(publication: ExternalPublication): Promise<PublicationValidationResult> {
      return validatePublication(publication);
    },
    async publish(): Promise<PublishResult> {
      return {
        success: false,
        error: { code: "not_implemented", message: "Adapter publish not configured" },
      };
    },
  };
}
