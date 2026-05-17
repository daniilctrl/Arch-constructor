import { addComponent, addDecision, addEdge, has, hasTech } from "./engine.js";
import type { Rule } from "./types.js";

const highOrAbove = new Set(["high", "very_high"]);

export const rules: Rule[] = [
  {
    id: "R1",
    title: "PostgreSQL for relational + strong consistency",
    when: (i) => i.dataShape === "relational" && i.consistency === "strong",
    apply: (_i, a) => {
      addComponent(a, "R1", { id: "db", kind: "database", tech: "PostgreSQL" });
      addEdge(a, { from: "api", to: "db", protocol: "sync" });
      addDecision(
        a,
        "R1",
        "Primary DB: PostgreSQL",
        "Relational shape with strong consistency — Postgres is the mature default.",
      );
    },
  },
  {
    id: "R2",
    title: "MongoDB for document + non-strong consistency",
    when: (i) => i.dataShape === "document" && i.consistency !== "strong",
    apply: (_i, a) => {
      addComponent(a, "R2", { id: "db", kind: "database", tech: "MongoDB" });
      addEdge(a, { from: "api", to: "db", protocol: "sync" });
      addDecision(
        a,
        "R2",
        "Primary DB: MongoDB",
        "Document shape with eventual/mixed consistency fits a document store.",
      );
    },
  },
  {
    id: "R3",
    title: "Specialized store for time-series",
    when: (i) => i.dataShape === "timeseries",
    apply: (i, a) => {
      const tech = i.analytics ? "ClickHouse" : "TimescaleDB";
      addComponent(a, "R3", { id: "ts_db", kind: "database", tech });
      addEdge(a, { from: "api", to: "ts_db", protocol: "sync" });
      addDecision(
        a,
        "R3",
        `Time-series store: ${tech}`,
        "Time-series workloads are much cheaper on a specialized engine than on a generic RDBMS.",
      );
    },
  },
  {
    id: "R4",
    title: "Redis cache for read-heavy high load",
    when: (i, a) =>
      highOrAbove.has(i.rps) &&
      i.readWriteRatio === "read_heavy" &&
      !has(a, "cache"),
    apply: (_i, a) => {
      addComponent(a, "R4", { id: "cache", kind: "cache", tech: "Redis" });
      addEdge(a, { from: "api", to: "cache", protocol: "sync" });
      addDecision(
        a,
        "R4",
        "Cache: Redis",
        "High RPS read-heavy traffic — caching gives the best price/effect ratio before sharding.",
      );
    },
  },
  {
    id: "R5",
    title: "Message queue for async work",
    when: (i) =>
      i.longRunningJobs || (i.realtime && highOrAbove.has(i.rps)),
    apply: (i, a) => {
      if (has(a, "queue")) return;
      const useKafka = i.teamSize === "large" || i.analytics;
      const tech = useKafka ? "Kafka" : "RabbitMQ";
      const kind = useKafka ? "stream" : "queue";
      addComponent(a, "R5", { id: "mq", kind, tech });
      addComponent(a, "R5", { id: "worker", kind: "worker", tech: "Worker" });
      addEdge(a, { from: "api", to: "mq", protocol: "async" });
      addEdge(a, { from: "mq", to: "worker", protocol: "async" });
      addDecision(
        a,
        "R5",
        `Async transport: ${tech}`,
        useKafka
          ? "Large team or streaming analytics make Kafka's operational cost worthwhile."
          : "RabbitMQ covers task queue needs without Kafka's operational overhead.",
      );
    },
  },
  {
    id: "R6",
    title: "Full-text search engine",
    when: (i) => i.search === "fulltext",
    apply: (i, a) => {
      const heavy = i.teamSize === "large" || i.analytics;
      const tech = heavy ? "Elasticsearch" : "Meilisearch";
      addComponent(a, "R6", { id: "search", kind: "search", tech });
      addEdge(a, { from: "api", to: "search", protocol: "sync" });
      addDecision(
        a,
        "R6",
        `Search: ${tech}`,
        "Postgres FTS does not scale past ~100k documents with complex queries; a dedicated engine is needed.",
      );
    },
  },
  {
    id: "R7",
    title: "Object storage + CDN for files",
    when: (i) => i.fileStorage,
    apply: (i, a) => {
      const tech = i.deployment === "on_prem" ? "MinIO" : "S3";
      addComponent(a, "R7", { id: "objstore", kind: "storage", tech });
      addEdge(a, { from: "api", to: "objstore", protocol: "sync" });
      if (i.deployment !== "on_prem") {
        addComponent(a, "R7", { id: "cdn", kind: "cdn", tech: "CDN" });
        addEdge(a, { from: "cdn", to: "objstore", protocol: "sync" });
      }
      addDecision(
        a,
        "R7",
        `File storage: ${tech}`,
        "Files in DB/local disk break backups and scaling; object storage is the right primitive.",
      );
    },
  },
  {
    id: "R8",
    title: "Microservices when scale and team demand it",
    when: (i) =>
      i.rps === "very_high" || (i.teamSize === "large" && i.growth === "viral"),
    apply: (_i, a) => {
      a.style = "microservices";
      addComponent(a, "R8", {
        id: "gateway",
        kind: "gateway",
        tech: "API Gateway",
      });
      addEdge(a, { from: "gateway", to: "api", protocol: "sync" });
      addDecision(
        a,
        "R8",
        "Style: microservices behind API gateway",
        "Microservices are justified organisationally (Conway's law) at large team + viral growth, or by very high RPS.",
      );
    },
  },
  {
    id: "R9",
    title: "Dedicated WebSocket gateway for realtime",
    when: (i) => i.realtime,
    apply: (_i, a) => {
      addComponent(a, "R9", { id: "ws", kind: "gateway", tech: "WebSocket Gateway" });
      addEdge(a, { from: "ws", to: "api", protocol: "sync" });
      addDecision(
        a,
        "R9",
        "Separate WebSocket gateway",
        "Long-lived connections and stateless HTTP scale differently — they should not share a process.",
      );
    },
  },
  {
    id: "R10",
    title: "Analytical store + ETL when analytics on large data",
    when: (i) => i.analytics && i.dataVolume !== "small",
    apply: (_i, a) => {
      if (!hasTech(a, "ClickHouse")) {
        addComponent(a, "R10", {
          id: "olap",
          kind: "database",
          tech: "ClickHouse",
        });
      }
      addComponent(a, "R10", { id: "etl", kind: "worker", tech: "ETL" });
      addEdge(a, { from: "etl", to: "olap", protocol: "async" });
      addDecision(
        a,
        "R10",
        "OLAP store separated from OLTP",
        "Analytical queries on the primary DB kill production latency; separation is mandatory past medium volume.",
      );
    },
  },

  // ---------- Warnings ----------
  {
    id: "W1",
    title: "Solo + microservices is almost always wrong",
    when: (i, a) => i.teamSize === "solo" && a.style === "microservices",
    apply: (_i, a) => {
      const msg =
        "W1: Microservices with a solo developer rarely pays off. Consider a modular monolith.";
      if (!a.warnings.includes(msg)) a.warnings.push(msg);
    },
  },
  {
    id: "W2",
    title: "GDPR in cloud needs explicit handling",
    when: (i) => i.compliance.includes("gdpr") && i.deployment !== "on_prem",
    apply: (_i, a) => {
      const msg =
        "W2: GDPR + cloud — pin storage region, add soft-delete and audit log.";
      if (!a.warnings.includes(msg)) a.warnings.push(msg);
    },
  },
  {
    id: "W3",
    title: "Two message brokers is a smell",
    when: (_i, a) => hasTech(a, "Kafka") && hasTech(a, "RabbitMQ"),
    apply: (_i, a) => {
      const msg =
        "W3: Kafka and RabbitMQ in one project usually signals fuzzy ownership of async flows.";
      if (!a.warnings.includes(msg)) a.warnings.push(msg);
    },
  },
];
