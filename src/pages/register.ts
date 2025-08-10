import type { PagesFunction } from "astro";

interface Env {
  ENDPOINTS: KVNamespace;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const data = await request.json().catch(() => null);
  const target = data?.url;
  if (!target) {
    return new Response("missing url", { status: 400 });
  }
  const id = crypto.randomUUID();
  const encoded = btoa(target);
  await env.ENDPOINTS.put(id, encoded);
  return new Response(JSON.stringify({ endpoint: `/${id}` }), {
    headers: { "content-type": "application/json" },
  });
};
