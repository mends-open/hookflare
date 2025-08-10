import type { PagesFunction } from "astro";

interface Env {
  ENDPOINTS: KVNamespace;
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const list = await env.ENDPOINTS.list();
  const endpoints = await Promise.all(
    list.keys.map(async (k) => {
      const encoded = await env.ENDPOINTS.get(k.name);
      return { id: k.name, url: encoded ? atob(encoded) : null };
    })
  );
  return new Response(JSON.stringify(endpoints), {
    headers: { "content-type": "application/json" },
  });
};
