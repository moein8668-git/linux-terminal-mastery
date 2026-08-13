const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });

const validHttpsUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  } catch {
    return false;
  }
};

function upstreamUrl(provider, baseUrl) {
  if (provider === "google") {
    return "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
  }
  if (!validHttpsUrl(baseUrl)) return null;
  return baseUrl.replace(/\/+$/, "").endsWith("/chat/completions")
    ? baseUrl
    : `${baseUrl.replace(/\/+$/, "")}/chat/completions`;
}

async function handleChat(request) {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 96_000) return json({ error: "Request is too large" }, 413);

  let input;
  try {
    input = await request.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const { provider, model, apiKey, baseUrl, messages, stream = false } = input || {};
  const cleanProvider = typeof provider === "string" ? provider.trim() : "";
  const cleanModel = typeof model === "string" ? model.trim() : "";
  const cleanKey = typeof apiKey === "string" ? apiKey.trim() : "";
  const cleanBaseUrl = typeof baseUrl === "string" ? baseUrl.trim() : "";
  if (!["google", "openai-compatible"].includes(cleanProvider)) return json({ error: "Unsupported provider" }, 400);
  if (cleanKey.length < 10 || cleanKey.length > 500) return json({ error: "A valid personal API key is required" }, 400);
  if (!/^[\w.:-]{2,120}$/.test(cleanModel)) return json({ error: "Invalid model" }, 400);
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 40) return json({ error: "Invalid conversation" }, 400);
  if (messages.some((message) => !message || !["user", "assistant", "system"].includes(message.role) || typeof message.content !== "string" || message.content.length > 20_000)) {
    return json({ error: "Invalid message content" }, 400);
  }

  const endpoint = upstreamUrl(cleanProvider, cleanBaseUrl);
  if (!endpoint) return json({ error: "Custom endpoint must use HTTPS" }, 400);

  const requestBody = (streaming) => JSON.stringify({ model: cleanModel, messages, stream: Boolean(streaming) });
  try {
    let upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${cleanKey}`
      },
      body: requestBody(stream)
    });
    if (!upstream.ok && stream) {
      upstream = await fetch(endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${cleanKey}`
        },
        body: requestBody(false)
      });
    }
    const body = await upstream.text();
    if (!upstream.ok) {
      let message = "Provider request failed";
      try {
        const payload = JSON.parse(body);
        message = payload.error?.message || payload.error || message;
      } catch {}
      return json({ error: message }, upstream.status);
    }
    return new Response(body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json", "cache-control": "no-store" }
    });
  } catch {
    return json({ error: "Provider request failed" }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/chat") return handleChat(request);
    const asset = await env.ASSETS.fetch(request);
    if (asset.status === 404 && request.headers.get("accept")?.includes("text/html")) {
      return env.ASSETS.fetch(new Request(new URL("/", request.url), request));
    }
    return asset;
  }
};
