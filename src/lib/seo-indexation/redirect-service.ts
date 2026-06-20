export type RedirectType = 301 | 302 | 307 | 308;

export type RedirectRule = {
  id: string;
  from: string;
  to: string;
  type: RedirectType;
  reason?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

const redirectStore = new Map<string, RedirectRule>();

function normalizePath(path: string): string {
  if (path.startsWith("http")) {
    try {
      return new URL(path).pathname;
    } catch {
      return path;
    }
  }
  return path.startsWith("/") ? path : `/${path}`;
}

export function createRedirect(from: string, to: string, type: RedirectType = 301, reason?: string): RedirectRule {
  const fromPath = normalizePath(from);
  const rule: RedirectRule = {
    id: `redirect-${fromPath.replace(/\//g, "-")}`,
    from: fromPath,
    to,
    type,
    reason,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  redirectStore.set(fromPath, rule);
  return rule;
}

export function getRedirect(from: string): RedirectRule | undefined {
  return redirectStore.get(normalizePath(from));
}

export function listRedirects(activeOnly = true): RedirectRule[] {
  const all = [...redirectStore.values()];
  return activeOnly ? all.filter((r) => r.active) : all;
}

export function deactivateRedirect(from: string): RedirectRule | undefined {
  const rule = redirectStore.get(normalizePath(from));
  if (!rule) return undefined;
  const updated = { ...rule, active: false, updatedAt: new Date().toISOString() };
  redirectStore.set(normalizePath(from), updated);
  return updated;
}

export function detectRedirectChains(maxDepth = 10): { from: string; chain: string[] }[] {
  const chains: { from: string; chain: string[] }[] = [];

  for (const rule of listRedirects()) {
    const chain = [rule.from];
    let current = rule.to;
    const visited = new Set<string>([rule.from]);

    for (let i = 0; i < maxDepth; i++) {
      const next = getRedirect(current);
      if (!next) break;
      if (visited.has(next.to)) {
        chain.push(next.to);
        break;
      }
      chain.push(next.to);
      visited.add(next.to);
      current = next.to;
    }

    if (chain.length > 2) {
      chains.push({ from: rule.from, chain });
    }
  }

  return chains;
}

export function resolveFinalRedirectUrl(from: string): string {
  let current = normalizePath(from);
  const visited = new Set<string>();

  for (let i = 0; i < 10; i++) {
    if (visited.has(current)) return current;
    visited.add(current);
    const rule = getRedirect(current);
    if (!rule || !rule.active) return current;
    current = normalizePath(rule.to);
  }

  return current;
}
