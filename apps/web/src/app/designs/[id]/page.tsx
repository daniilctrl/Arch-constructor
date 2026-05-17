import { notFound } from "next/navigation";
import MermaidDiagram from "@/components/MermaidDiagram";
import { ApiError, getDesign, getDesignMermaid } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function DesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let design;
  let mermaid;
  try {
    [design, mermaid] = await Promise.all([getDesign(id), getDesignMermaid(id)]);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }

  const { architecture: arch } = design;

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-bold">{design.name ?? `Design ${id}`}</h1>
        <p className="text-xs text-gray-500">
          Style: {arch.style} · Engine: {design.engineVersion} · Created{" "}
          {new Date(design.createdAt).toLocaleString()}
        </p>
      </header>

      <section className="section">
        <h2>Diagram</h2>
        <MermaidDiagram chart={mermaid} />
      </section>

      <section className="section">
        <h2>Components</h2>
        <ul className="text-sm space-y-1">
          {arch.components.map((c) => (
            <li key={c.id}>
              <span className="font-medium">{c.tech}</span>
              <span className="text-gray-500"> — {c.kind}</span>
              {c.reason.length > 0 && (
                <span className="text-gray-400 text-xs"> ({c.reason.join(", ")})</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {arch.decisions.length > 0 && (
        <section className="section">
          <h2>Decisions</h2>
          <ul className="space-y-3">
            {arch.decisions.map((d, i) => (
              <li key={i}>
                <div className="text-sm font-medium">
                  {d.ruleId}: {d.title}
                </div>
                <div className="text-sm text-gray-600">{d.rationale}</div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {arch.warnings.length > 0 && (
        <section className="section border-amber-300 bg-amber-50">
          <h2>Warnings</h2>
          <ul className="space-y-1 text-sm text-amber-900">
            {arch.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </section>
      )}

      <section className="section">
        <h2>Mermaid source</h2>
        <pre className="bg-gray-50 border border-gray-200 p-3 text-xs overflow-auto">
          {mermaid}
        </pre>
      </section>
    </div>
  );
}
