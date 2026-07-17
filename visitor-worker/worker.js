const ALLOWED_ORIGINS = new Set([
  "https://evelina-is.github.io",
  "http://127.0.0.1:8017",
  "http://localhost:8017"
]);

function corsHeaders(origin) {
  const allowOrigin = ALLOWED_ORIGINS.has(origin) ? origin : "https://evelina-is.github.io";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function trimString(value, limit) {
  if (typeof value !== "string") return value;
  return value.length > limit ? value.slice(0, limit) : value;
}

function sanitizePayload(payload) {
  const visitor = payload && payload.visitor ? payload.visitor : {};
  return {
    site: trimString(payload && payload.site ? payload.site : "Evelina_personal_web", 80),
    receivedAt: new Date().toISOString(),
    visitor: {
      page: trimString(visitor.page || "", 600),
      referrer: trimString(visitor.referrer || "", 600),
      userAgent: trimString(visitor.userAgent || "", 600),
      language: trimString(visitor.language || "", 80),
      languages: Array.isArray(visitor.languages) ? visitor.languages.slice(0, 8) : [],
      platform: trimString(visitor.platform || "", 120),
      cookieEnabled: Boolean(visitor.cookieEnabled),
      doNotTrack: trimString(visitor.doNotTrack || "", 20),
      timezone: trimString(visitor.timezone || "", 120),
      screen: visitor.screen || {},
      viewport: visitor.viewport || {},
      preferences: visitor.preferences || {},
      connection: visitor.connection || {},
      collectedAt: trimString(visitor.collectedAt || "", 80)
    }
  };
}

async function forwardToWebhook(env, record) {
  if (!env.VISITOR_WEBHOOK_URL) return { skipped: true };

  const response = await fetch(env.VISITOR_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });

  return {
    forwarded: response.ok,
    status: response.status
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, origin);
    }

    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400, origin);
    }

    const record = sanitizePayload(payload);
    const forward = await forwardToWebhook(env, record);
    return json({ ok: true, forward }, 200, origin);
  }
};
