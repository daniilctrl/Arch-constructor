import type { Architecture, Component, ADR } from "@arch/core";

export type ArchComparison = {
  /** Score 0-100: fraction of expected techs the player matched, less an extras penalty. */
  score: number;
  matched: ComponentInfo[];
  missing: ComponentInfo[];
  extra: ComponentInfo[];
  styleMatch: boolean;
  /** ADRs from the expected architecture that point to missing components — used as hints. */
  hintsForMissing: ADR[];
};

export type ComponentInfo = {
  tech: string;
  kind: string;
  /** Rule ids that produced this component. */
  reason: string[];
};

const toKey = (c: Component) => c.tech;

export function compareArchitectures(
  player: Architecture,
  expected: Architecture,
): ArchComparison {
  const playerByTech = new Map(player.components.map((c) => [toKey(c), c]));
  const expectedByTech = new Map(expected.components.map((c) => [toKey(c), c]));

  const matched: ComponentInfo[] = [];
  const missing: ComponentInfo[] = [];
  const extra: ComponentInfo[] = [];

  for (const [tech, comp] of expectedByTech) {
    if (playerByTech.has(tech)) {
      matched.push(toInfo(comp));
    } else {
      missing.push(toInfo(comp));
    }
  }
  for (const [tech, comp] of playerByTech) {
    if (!expectedByTech.has(tech)) extra.push(toInfo(comp));
  }

  const total = expectedByTech.size;
  const correctness = total > 0 ? matched.length / total : 1;
  // Each extra costs 10% of total. Min 0.
  const extrasPenalty = Math.min(0.5, extra.length * 0.1);
  const styleMatch = player.style === expected.style;
  const styleBonus = styleMatch ? 0.05 : 0;
  const score = Math.max(0, Math.round((correctness - extrasPenalty + styleBonus) * 100));

  // Build hints: for each missing component, find ADRs whose ruleId is in `reason`.
  const missingRuleIds = new Set(missing.flatMap((m) => m.reason));
  const hintsForMissing = expected.decisions.filter((d) =>
    missingRuleIds.has(d.ruleId),
  );

  return { score, matched, missing, extra, styleMatch, hintsForMissing };
}

function toInfo(c: Component): ComponentInfo {
  return { tech: c.tech, kind: c.kind, reason: c.reason };
}
