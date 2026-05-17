import type { Architecture, Input } from "@arch/core";

export type Design = {
  id: string;
  name: string | null;
  input: Input;
  architecture: Architecture;
  engineVersion: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

async function parseError(res: Response): Promise<never> {
  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = await res.text();
  }
  throw new ApiError(res.status, body);
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(`API ${status}`);
  }
}

export async function createDesign(payload: {
  name?: string;
  input: Input;
}): Promise<Design> {
  const res = await fetch(`${baseUrl}/designs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getDesign(id: string): Promise<Design> {
  const res = await fetch(`${baseUrl}/designs/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.json();
}

export async function getDesignMermaid(id: string): Promise<string> {
  const res = await fetch(`${baseUrl}/designs/${id}/render?format=mermaid`, {
    cache: "no-store",
  });
  if (!res.ok) await parseError(res);
  return res.text();
}
