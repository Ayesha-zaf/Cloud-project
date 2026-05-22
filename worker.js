export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const id = env.MyDatabase.idFromName("main");
    const obj = env.MyDatabase.get(id);

    // Serve your Cloudflare Pages site at root
    if (url.pathname === "/") {
      const page = await fetch("https://cloudflaredb-pages.yasir-ali.workers.dev"); // ← replace with your Pages URL if different
      const html = await page.text();
      return new Response(html, { headers: { "content-type": "text/html" } });
    }

    // Forward other routes to Durable Object
    return obj.fetch(request);
  }
}

export class MyDatabase {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === "/add") {
      const { name, email } = await request.json();

      await this.state.storage.put(name, email);

      return new Response("Added successfully");
    }

    if (url.pathname === "/list") {
      const list = await this.state.storage.list();

      const results = [];

      for (const [key, value] of list.entries()) {
        results.push({ name: key, email: value });
      }

      return new Response(JSON.stringify(results), {
        headers: { "content-type": "application/json" }
      });
    }

    return new Response("Not found", { status: 404 });
  }
}

