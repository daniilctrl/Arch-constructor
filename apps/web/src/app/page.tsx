import Link from "next/link";

export default function HomePage() {
  return (
    <div className="prose">
      <h1 className="text-2xl font-bold mb-3">Architecture Constructor</h1>
      <p className="text-gray-700 mb-4">
        Fill in your project requirements, get back a backend architecture with
        components, decisions and a diagram.
      </p>
      <Link href="/new" className="btn inline-block">
        Start a new design
      </Link>
    </div>
  );
}
