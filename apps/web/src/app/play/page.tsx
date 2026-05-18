import Link from "next/link";
import { levels } from "@/lib/levels";

const difficultyStyle: Record<string, string> = {
  easy: "bg-green-100 text-green-800",
  medium: "bg-amber-100 text-amber-800",
  hard: "bg-red-100 text-red-800",
};

export default function PlayIndexPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Play</h1>
      <p className="text-gray-700 mb-6 text-sm">
        Read a scenario, design the architecture yourself, and the engine will compare
        your answer to its reference. The further off you are, the more the engine
        will explain what you missed.
      </p>

      <ol className="space-y-3">
        {levels.map((l) => (
          <li key={l.id}>
            <Link
              href={`/play/${l.id}`}
              className="block section hover:border-blue-400"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Level {l.number}</div>
                  <div className="font-semibold">{l.title}</div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${difficultyStyle[l.difficulty]}`}
                >
                  {l.difficulty}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
