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

  const { provider, model, apiKey, baseUrl, messages } = input || {};
  if (!["google", "openai-compatible"].includes(provider)) return json({ error: "Unsupported provider" }, 400);
  if (typeof apiKey !== "string" || apiKey.length < 10 || apiKey.length > 500) return json({ error: "A valid personal API key is required" }, 400);
  if (typeof model !== "string" || !/^[\w.:-]{2,120}$/.test(model)) return json({ error: "Invalid model" }, 400);
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 40) return json({ error: "Invalid conversation" }, 400);
  if (messages.some((message) => !message || !["user", "assistant", "system"].includes(message.role) || typeof message.content !== "string" || message.content.length > 20_000)) {
    return json({ error: "Invalid message content" }, 400);
  }

  const endpoint = upstreamUrl(provider, baseUrl);
  if (!endpoint) return json({ error: "Custom endpoint must use HTTPS" }, 400);

  try {
    const upstream = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, messages, stream: false })
    });
    const body = await upstream.text();
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
    return env.ASSETS.fetch(request);
  }
};
