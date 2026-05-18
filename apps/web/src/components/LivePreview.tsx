"use client";

import { useEffect, useMemo, useState } from "react";
import {
  build,
  renderMermaid,
  type Architecture,
  type Input,
} from "@arch/core";
import MermaidDiagram from "./MermaidDiagram";

type CollapsibleProps = {
  defaultOpen?: boolean;
  summary: string;
  children: React.ReactNode;
};

function Collapsible({ defaultOpen = false, summary, children }: CollapsibleProps) {
  return (
    <details open={defaultOpen} className="group">
      <summary className="cursor-pointer text-sm font-medium text-gray-700 select-none">
        {summary}
        <span className="text-gray-400 ml-1 group-open:hidden">▸</span>
        <span className="text-gray-400 ml-1 hidden group-open:inline">▾</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}

type Props = {
  input: Input | null;
  /** Debounce delay before recomputing the architecture (ms). */
  debounceMs?: number;
};

/**
 * Live preview pane: takes the current form input, debounces, runs build(),
 * and shows the resulting architecture + diagram + warnings.
 *
 * Designed to feel like a workshop — every form change has a visible effect.
 */
export default function LivePreview({ input, debounceMs = 200 }: Props) {
  const [debounced, setDebounced] = useState<Input | null>(input);

  useEffect(() => {
    if (!input) return;
    const t = setTimeout(() => setDebounced(input), debounceMs);
    return () => clearTimeout(t);
  }, [input, debounceMs]);

  const arch: Architecture | null = useMemo(
    () => (debounced ? build(debounced) : null),
    [debounced],
  );
  const mermaid = useMemo(
    () => (arch ? renderMermaid(arch) : ""),
    [arch],
  );

  if (!arch) {
    return (
      <div className="section">
        <h2>Preview</h2>
        <p className="text-sm text-gray-500">
          The diagram will appear here as you fill in the form.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="section">
        <h2 className="flex items-center justify-between">
          <span>Live preview</span>
          <span className="text-xs font-normal text-gray-500">
            {arch.components.length} components · {arch.style}
          </span>
        </h2>
        <MermaidDiagram chart={mermaid} />
      </div>

      {arch.warnings.length > 0 && (
        <div className="section border-amber-300 bg-amber-50">
          <h2 className="text-amber-900">Warnings</h2>
          <ul className="space-y-1 text-sm text-amber-900">
            {arch.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="section">
        <h2>What you&apos;re building</h2>
        <ul className="text-sm space-y-1">
          {arch.components.map((c) => (
            <li key={c.id}>
              <span className="font-medium">{c.tech}</span>
              <span className="text-gray-500"> — {c.kind}</span>
              {c.reason.length > 0 && (
                <span className="text-gray-400 text-xs">
                  {" "}({c.reason.join(", ")})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      {arch.decisions.length > 0 && (
        <div className="section">
          <Collapsible
            defaultOpen
            summary={`Why these components? (${arch.decisions.length})`}
          >
            <ul className="space-y-3">
              {arch.decisions.map((d) => (
                <li key={d.ruleId + d.title} className="text-sm">
                  <div className="font-medium text-gray-800">
                    <span className="inline-block text-xs font-mono text-gray-500 mr-2">
                      {d.ruleId}
                    </span>
                    {d.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-0.5">{d.rationale}</div>
                </li>
              ))}
            </ul>
          </Collapsible>
        </div>
      )}
    </div>
  );
}
