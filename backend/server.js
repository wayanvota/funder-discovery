import http from "node:http";

const port = Number(process.env.PORT || 10000);
const host = process.env.HOST || "127.0.0.1";
const publicOrigin = process.env.PUBLIC_ORIGIN || "https://wayan.com";

function sendJson(response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": publicOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type",
    ...extraHeaders
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 200_000) {
        reject(new Error("Request body too large"));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    return sendJson(response, 204, {});
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, {
      ok: true,
      service: "funder-discovery-api"
    });
  }

  if (request.method === "POST" && url.pathname === "/api/report") {
    try {
      const body = await readBody(request);
      const payload = body ? JSON.parse(body) : {};
      const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

      return sendJson(response, hasOpenAIKey ? 501 : 503, {
        ok: false,
        code: hasOpenAIKey ? "report_generation_not_implemented" : "openai_not_configured",
        message:
          "The public static site is ready. The Render backend is reserved for generated reports and will call OpenAI only after the report endpoint is implemented.",
        received: {
          organization: payload.profile?.name ?? null,
          funderId: payload.funderId ?? null
        }
      });
    } catch (error) {
      return sendJson(response, 400, {
        ok: false,
        code: "bad_request",
        message: error.message
      });
    }
  }

  return sendJson(response, 404, {
    ok: false,
    code: "not_found"
  });
});

server.listen(port, host, () => {
  console.log(`funder-discovery-api listening on ${host}:${port}`);
});
