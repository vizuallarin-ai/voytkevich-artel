import type { IndexabilityDecision } from "@/types/seo-indexation";
import type { RobotsDirective } from "@/data/seo-indexation-rules";
import { defaultRobotsDirectives } from "@/data/seo-indexation-rules";

export function buildRobotsDirective(decision: IndexabilityDecision): RobotsDirective {
  if (decision.status === "blocked") {
    return defaultRobotsDirectives.blocked;
  }

  if (!decision.indexable) {
    return defaultRobotsDirectives.noindex;
  }

  return {
    index: decision.robots.index,
    follow: decision.robots.follow,
  };
}

export function robotsDirectiveToMetaContent(directive: RobotsDirective): string {
  const parts: string[] = [];
  parts.push(directive.index ? "index" : "noindex");
  parts.push(directive.follow ? "follow" : "nofollow");
  return parts.join(", ");
}
