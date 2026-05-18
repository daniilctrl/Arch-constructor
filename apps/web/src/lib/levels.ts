import type { Input } from "@arch/core";

export type Level = {
  id: string;
  number: number;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  scenario: string;
  /** The reference input — what an experienced architect would derive from the scenario. */
  expectedInput: Input;
  /** Optional learning notes shown after solving. */
  learningNotes?: string;
};

export const levels: Level[] = [
  {
    id: "personal-tracker",
    number: 1,
    difficulty: "easy",
    title: "Personal task tracker",
    scenario:
      "You're building a small personal task tracker for yourself. Maybe 10 users total — close friends. It stores tasks with deadlines, tags, and lets users attach files (images, PDFs). You'll deploy to a single cloud VPS. You want a stable, boring stack. No realtime, no analytics.",
    expectedInput: {
      rps: "low",
      dataVolume: "small",
      growth: "stable",
      dataShape: "relational",
      consistency: "strong",
      readWriteRatio: "balanced",
      realtime: false,
      longRunningJobs: false,
      fileStorage: true,
      search: "none",
      analytics: false,
      teamSize: "solo",
      teamExperience: "mixed",
      deployment: "cloud",
      budget: "tight",
      latencyCritical: false,
      compliance: ["none"],
    },
    learningNotes:
      "The killer signal here is small scale + file attachments. Files in DB scale poorly even at small size — object storage is the right primitive from day one. Everything else should stay as plain as possible: a monolith with Postgres.",
  },
  {
    id: "realtime-chat",
    number: 2,
    difficulty: "medium",
    title: "Real-time chat for 50k DAU",
    scenario:
      "Mid-size team (5 engineers) is launching a real-time chat product. ~50k daily active users, growing. Most traffic is reads (browsing message history); writes are messages and reactions. Search across messages must work. Users upload avatars and image attachments. EU-only deployment, GDPR matters.",
    expectedInput: {
      rps: "high",
      dataVolume: "medium",
      growth: "growing",
      dataShape: "relational",
      consistency: "strong",
      readWriteRatio: "read_heavy",
      realtime: true,
      longRunningJobs: false,
      fileStorage: true,
      search: "fulltext",
      analytics: false,
      teamSize: "small",
      teamExperience: "mixed",
      deployment: "cloud",
      budget: "normal",
      latencyCritical: false,
      compliance: ["gdpr"],
    },
    learningNotes:
      "Realtime + high read-heavy traffic asks for cache and a dedicated WebSocket process. Full-text on chat history past ~100k messages dies in Postgres FTS — pick a search engine. GDPR + cloud is a real warning, not a tech choice: it implies audit logging and region pinning at the ops layer.",
  },
  {
    id: "iot-analytics",
    number: 3,
    difficulty: "hard",
    title: "IoT metrics platform",
    scenario:
      "Large team (25 engineers) building a platform that ingests metrics from 5 million IoT devices. Each device sends a reading every 30 seconds. Customers query dashboards with aggregations over 30-day windows. The product is in viral growth — onboarding new customers weekly. Cloud deployment. Strict p99 latency targets on dashboard queries.",
    expectedInput: {
      rps: "very_high",
      dataVolume: "large",
      growth: "viral",
      dataShape: "timeseries",
      consistency: "eventual",
      readWriteRatio: "write_heavy",
      realtime: false,
      longRunningJobs: true,
      fileStorage: false,
      search: "none",
      analytics: true,
      teamSize: "large",
      teamExperience: "senior",
      deployment: "cloud",
      budget: "generous",
      latencyCritical: true,
      compliance: ["none"],
    },
    learningNotes:
      "Time-series at this volume cannot live in a generic RDBMS. Aggregations on raw data kill dashboards — separate OLAP store with ETL. Viral growth + large team is the canonical case for microservices behind a gateway (Conway's law). Write-heavy + analytics often justifies Kafka over a task queue.",
  },
];

export function getLevel(id: string): Level | undefined {
  return levels.find((l) => l.id === id);
}
