import type { PagesFunction } from "astro";

interface Env {
  ENDPOINTS: KVNamespace;
  LOGS: D1Database;
}

function toBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const id = params.id;
  if (!id) return new Response("Not found", { status: 404 });
  const encoded = await env.ENDPOINTS.get(id);
  if (!encoded) return new Response("Endpoint not found", { status: 404 });
  const target = atob(encoded);

  const reqBody = await request.clone().arrayBuffer();
  const logId = crypto.randomUUID();
  const ts = new Date().toISOString();
  await env.LOGS.prepare(
    "INSERT INTO logs (id, endpoint, ts, req_method, req_headers, req_body) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(
      logId,
      id,
      ts,
      request.method,
      JSON.stringify([...request.headers]),
      toBase64(reqBody)
    )
    .run();

  const forwardReq = new Request(target, {
    method: request.method,
    headers: request.headers,
    body: reqBody,
    redirect: "manual",
  });

  let response: Response;
  try {
    response = await fetch(forwardReq);
  } catch (err: any) {
    await env.LOGS.prepare(
      "UPDATE logs SET res_status = ?, res_headers = ?, res_body = ? WHERE id = ?"
    )
      .bind(500, JSON.stringify({ error: String(err) }), "", logId)
      .run();
    return new Response("Upstream error", { status: 502 });
  }

  const resBody = await response.clone().arrayBuffer();
  await env.LOGS.prepare(
    "UPDATE logs SET res_status = ?, res_headers = ?, res_body = ? WHERE id = ?"
  )
    .bind(
      response.status,
      JSON.stringify([...response.headers]),
      toBase64(resBody),
      logId
    )
    .run();

  return new Response(resBody, {
    status: response.status,
    headers: response.headers,
  });
};
