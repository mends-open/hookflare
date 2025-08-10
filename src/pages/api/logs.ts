import type { PagesFunction } from "astro";

interface Env {
  LOGS: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  const url = new URL(request.url);
  const endpoint = url.searchParams.get("endpoint");
  const status = url.searchParams.get("status");

  let query = "SELECT * FROM logs";
  const conditions: string[] = [];
  const params: any[] = [];
  if (endpoint) {
    conditions.push("endpoint = ?");
    params.push(endpoint);
  }
  if (status) {
    conditions.push("res_status = ?");
    params.push(Number(status));
  }
  if (conditions.length) {
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " ORDER BY ts DESC LIMIT 100";

  const { results } = await env.LOGS.prepare(query).bind(...params).all();
  return new Response(JSON.stringify(results), {
    headers: { "content-type": "application/json" },
  });
};
