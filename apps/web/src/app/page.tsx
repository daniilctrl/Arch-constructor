import Link from "next/link";

export default function HomePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-3">Architecture Constructor</h1>
      <p className="text-gray-700 mb-6">
        Two modes for working with the same rule engine.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/new" className="section hover:border-blue-400 block">
          <h2 className="font-semibold mb-1">Design from requirements</h2>
          <p className="text-sm text-gray-600">
            Fill in your project requirements, get back a synthesized backend
            architecture with components, ADRs, and a diagram.
          </p>
        </Link>

        <Link href="/play" className="section hover:border-blue-400 block">
          <h2 className="font-semibold mb-1">Play scenarios</h2>
          <p className="text-sm text-gray-600">
            Read a scenario, design the architecture yourself, and the engine will
            compare your answer to its reference — pointing out what you missed.
          </p>
        </Link>
      </div>
    </div>
  );
}
