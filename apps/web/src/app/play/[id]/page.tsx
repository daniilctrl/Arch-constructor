"use client";

import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { build, type Architecture, type Input } from "@arch/core";
import InputForm from "@/components/InputForm";
import { compareArchitectures, type ArchComparison } from "@/lib/compare";
import { getLevel } from "@/lib/levels";

export default function PlayLevelPage() {
  const params = useParams<{ id: string }>();
  const level = getLevel(params.id);
  if (!level) notFound();

  const expectedArch = useMemo(
    () => build(level.expectedInput),
    [level.expectedInput],
  );

  const [result, setResult] = useState<{
    playerInput: Input;
    playerArch: Architecture;
    comparison: ArchComparison;
  } | null>(null);
  const [showExpert, setShowExpert] = useState(false);

  return (
    <div>
      <Link href="/play" className="text-sm text-blue-600 hover:underline">
        ← Levels
      </Link>
      <h1 className="text-2xl font-bold mt-2 mb-1">{level.title}</h1>
      <div className="text-xs text-gray-500 mb-4">
        Level {level.number} · {level.difficulty}
      </div>

      <section className="section bg-gray-50 border-gray-300">
        <h2>Scenario</h2>
        <p className="text-sm leading-relaxed">{level.scenario}</p>
      </section>

      <InputForm
        showName={false}
        submitLabel={result ? "Submit again" : "Submit my design"}
        onSubmit={async ({ input }) => {
          const playerArch = build(input);
          const comparison = compareArchitectures(playerArch, expectedArch);
          setResult({ playerInput: input, playerArch, comparison });
          setShowExpert(false);
          // Scroll to results.
          setTimeout(() => {
            document.getElementById("results")?.scrollIntoView({
              behavior: "smooth",
            });
          }, 50);
        }}
      />

      {result && (
        <div id="results" className="mt-8">
          <ResultsPanel
            comparison={result.comparison}
            expectedArch={expectedArch}
            showExpert={showExpert}
            onToggleExpert={() => setShowExpert((s) => !s)}
            learningNotes={level.learningNotes}
          />
        </div>
      )}
    </div>
  );
}

function ResultsPanel({
  comparison,
  expectedArch,
  showExpert,
  onToggleExpert,
  learningNotes,
}: {
  comparison: ArchComparison;
  expectedArch: Architecture;
  showExpert: boolean;
  onToggleExpert: () => void;
  learningNotes?: string;
}) {
  const { score, matched, missing, extra, styleMatch, hintsForMissing } = comparison;
  const verdict =
    score >= 90 ? "Solid design." : score >= 70 ? "Close." : score >= 50 ? "Workable, but missing pieces." : "Off the mark.";

  return (
    <>
      <section className="section">
        <h2>Result</h2>
        <div className="flex items-baseline gap-3 mb-2">
          <div className="text-4xl font-bold">{score}</div>
          <div className="text-sm text-gray-600">{verdict}</div>
        </div>
        <div className="text-xs text-gray-500">
          Style: {styleMatch ? "matches expert" : "differs from expert"}
        </div>
      </section>

      {matched.length > 0 && (
        <section className="section border-green-300">
          <h2>Matched ({matched.length})</h2>
          <ul className="text-sm space-y-1">
            {matched.map((c) => (
              <li key={c.tech}>
                <span className="font-medium">{c.tech}</span>{" "}
                <span className="text-gray-500">— {c.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {missing.length > 0 && (
        <section className="section border-red-300 bg-red-50">
          <h2>Missing ({missing.length})</h2>
          <ul className="text-sm space-y-2">
            {missing.map((c) => (
              <li key={c.tech}>
                <div>
                  <span className="font-medium">{c.tech}</span>{" "}
                  <span className="text-gray-500">— {c.kind}</span>
                </div>
                {hintsForMissing
                  .filter((d) => c.reason.includes(d.ruleId))
                  .map((d) => (
                    <div
                      key={d.ruleId + d.title}
                      className="text-xs text-gray-700 mt-1 pl-3 border-l-2 border-red-300"
                    >
                      <span className="font-medium">{d.ruleId}: {d.title}</span>
                      <div>{d.rationale}</div>
                    </div>
                  ))}
              </li>
            ))}
          </ul>
        </section>
      )}

      {extra.length > 0 && (
        <section className="section border-amber-300 bg-amber-50">
          <h2>Possibly over-engineered ({extra.length})</h2>
          <p className="text-xs text-gray-600 mb-2">
            The expert solution does not include these. They may still be reasonable,
            but ask yourself: what requirement justifies them?
          </p>
          <ul className="text-sm space-y-1">
            {extra.map((c) => (
              <li key={c.tech}>
                <span className="font-medium">{c.tech}</span>{" "}
                <span className="text-gray-500">— {c.kind}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {learningNotes && (
        <section className="section">
          <h2>Why this scenario</h2>
          <p className="text-sm text-gray-700">{learningNotes}</p>
        </section>
      )}

      <section className="section">
        <button
          type="button"
          onClick={onToggleExpert}
          className="text-sm text-blue-600 hover:underline"
        >
          {showExpert ? "Hide" : "Show"} the expert architecture
        </button>
        {showExpert && (
          <div className="mt-3">
            <div className="text-xs text-gray-500 mb-2">
              Style: {expectedArch.style}
            </div>
            <ul className="text-sm space-y-1">
              {expectedArch.components.map((c) => (
                <li key={c.id}>
                  <span className="font-medium">{c.tech}</span>{" "}
                  <span className="text-gray-500">— {c.kind}</span>{" "}
                  <span className="text-gray-400 text-xs">({c.reason.join(", ")})</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </>
  );
}
