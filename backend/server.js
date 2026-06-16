import http from "node:http";

const port = Number(process.env.PORT || 10000);
const host = process.env.HOST || "127.0.0.1";
const publicOrigin = process.env.PUBLIC_ORIGIN || "https://wayan.com";

function allowedOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return publicOrigin;
  if (
    origin === publicOrigin ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://localhost:")
  ) {
    return origin;
  }
  return publicOrigin;
}

function sendJson(request, response, status, payload, extraHeaders = {}) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": allowedOrigin(request),
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

function extractOutputText(payload) {
  if (payload.output_text) return payload.output_text;
  const message = payload.output?.find((item) => item.type === "message");
  return message?.content?.map((part) => part.text || "").join("\n") || "";
}

function parseJsonObject(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("OpenAI did not return parseable JSON.");
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function normalizeUrl(value) {
  return typeof value === "string" && value.startsWith("http") ? value : "";
}

function slug(value, index) {
  return (
    String(value || `funder-${index + 1}`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || `funder-${index + 1}`
  );
}

function normalizeFunder(raw, index) {
  const name = String(raw.displayName || raw.legalName || raw.name || `Funder ${index + 1}`);
  const minAsk = Number(raw.askRange?.[0] || raw.askMin || 50000);
  const maxAsk = Number(raw.askRange?.[1] || raw.askMax || minAsk * 2);
  const dimensions = raw.dimensions || {};

  return {
    id: slug(raw.id || name, index),
    legalName: String(raw.legalName || name),
    displayName: name,
    ein: String(raw.ein || "Unknown"),
    city: String(raw.city || "Unknown"),
    state: String(raw.state || ""),
    type: String(raw.type || "Foundation"),
    sourceYear: String(raw.sourceYear || "Source year not verified"),
    assets: Number(raw.assets || 0),
    annualGrants: Number(raw.annualGrants || 0),
    askRange: [Math.round(minAsk), Math.round(Math.max(maxAsk, minAsk))],
    currentAsk: Math.round(Number(raw.currentAsk || Math.min(Math.max(minAsk, 100000), maxAsk))),
    priorities: String(raw.priorities || "Priorities need verification."),
    geography: String(raw.geography || "Geography needs verification."),
    eligibility: String(raw.eligibility || "Eligibility needs verification before outreach."),
    relationshipPath: String(raw.relationshipPath || "Identify a warm path before outreach."),
    evidence: String(raw.evidence || "No public evidence summary returned."),
    strongest: String(raw.strongest || "Best angle needs verification."),
    weakest: String(raw.weakest || "Weakest point needs verification."),
    likelyObjection: String(raw.likelyObjection || "Likely objection needs verification."),
    nextAction: String(raw.nextAction || "Verify sources and eligibility before outreach."),
    doNotSubmit: String(raw.doNotSubmit || "Do not submit until eligibility, geography, and grant-size fit are verified."),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String).slice(0, 6) : ["dynamic"],
    warnings: Array.isArray(raw.warnings) ? raw.warnings.map(String).slice(0, 6) : ["Verify sources"],
    officialUrl: normalizeUrl(raw.officialUrl),
    officialEvidenceUrl: normalizeUrl(raw.officialEvidenceUrl || raw.officialUrl),
    kindoraUrl: normalizeUrl(raw.kindoraUrl),
    propublicaUrl: normalizeUrl(raw.propublicaUrl),
    irsUrl: normalizeUrl(raw.irsUrl) || "https://apps.irs.gov/app/eos/",
    sourceNotes: Array.isArray(raw.sourceNotes)
      ? raw.sourceNotes.map((note) => ({
          label: String(note.label || "Source"),
          value: String(note.value || "")
        }))
      : [{ label: "Dynamic search", value: "Returned by backend discovery. Verify before outreach." }],
    dimensions: {
      mission: clamp(dimensions.mission ?? 70),
      geography: clamp(dimensions.geography ?? 65),
      grantSize: clamp(dimensions.grantSize ?? 65),
      evidence: clamp(dimensions.evidence ?? 60),
      history: clamp(dimensions.history ?? 55),
      eligibilityRisk: clamp(dimensions.eligibilityRisk ?? 55),
      timing: clamp(dimensions.timing ?? 55),
      relationship: clamp(dimensions.relationship ?? 45),
      confidence: clamp(dimensions.confidence ?? 60)
    }
  };
}

function buildDiscoveryPrompt(profile) {
  return `You are Funder Discovery, a strict funder research tool for US 501(c)(3) nonprofits.

Find 6 to 8 NEW funders for this NGO. Do not use a preloaded seed shortlist. Use current web search. Prioritize public evidence from foundation websites, ProPublica Nonprofit Explorer, IRS/990 references, Kindora pages when available, and public grant guidelines.

NGO profile:
${JSON.stringify(profile, null, 2)}

Rules:
- Return only funders that a US 501(c)(3) could plausibly pursue.
- If the NGO works overseas, geography fit must be explicit. Do not treat US-only funders as fits.
- Include do-not-pursue flags when geography, invitation-only access, grant size, or evidence make outreach wasteful.
- Estimate askRange from visible grant patterns when possible. If not available, be conservative.
- Every funder must include source links. Use ProPublica URL when you can identify an EIN.
- Be skeptical. A foundation website priority is not proof of recent grantmaking.
- Return valid JSON only. No Markdown.

JSON shape:
{
  "message": "short summary",
  "funders": [
    {
      "legalName": "string",
      "displayName": "string",
      "ein": "string or Unknown",
      "city": "string",
      "state": "string",
      "type": "string",
      "sourceYear": "string",
      "assets": 0,
      "annualGrants": 0,
      "askRange": [50000, 150000],
      "currentAsk": 100000,
      "priorities": "string",
      "geography": "string",
      "eligibility": "string",
      "relationshipPath": "string",
      "evidence": "990-backed or public-record evidence summary",
      "strongest": "best outreach angle",
      "weakest": "weakest fit issue",
      "likelyObjection": "string",
      "nextAction": "string",
      "doNotSubmit": "string",
      "tags": ["string"],
      "warnings": ["string"],
      "officialUrl": "https://...",
      "officialEvidenceUrl": "https://...",
      "kindoraUrl": "https://... or empty string",
      "propublicaUrl": "https://projects.propublica.org/nonprofits/organizations/... or empty string",
      "irsUrl": "https://apps.irs.gov/app/eos/",
      "sourceNotes": [{"label":"Source name","value":"specific evidence"}],
      "dimensions": {
        "mission": 0,
        "geography": 0,
        "grantSize": 0,
        "evidence": 0,
        "history": 0,
        "eligibilityRisk": 0,
        "timing": 0,
        "relationship": 0,
        "confidence": 0
      }
    }
  ]
}`;
}

async function discoverFunders(profile) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    const error = new Error("Dynamic discovery needs OPENAI_API_KEY configured on Render. The app will not fall back to static dummy funders.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-5.4-mini",
      tools: [{ type: "web_search", search_context_size: "low" }],
      max_output_tokens: 5000,
      store: false,
      input: buildDiscoveryPrompt(profile)
    })
  });

  const payload = await response.json();
  if (!response.ok) {
    const message = payload.error?.message || "OpenAI funder discovery request failed.";
    const error = new Error(message);
    error.statusCode = response.status;
    throw error;
  }

  const result = parseJsonObject(extractOutputText(payload));
  const funders = Array.isArray(result.funders) ? result.funders.map(normalizeFunder) : [];
  if (!funders.length) {
    const error = new Error("Dynamic discovery returned no funders.");
    error.statusCode = 502;
    throw error;
  }

  return {
    message: result.message || `Found ${funders.length} dynamically discovered funders.`,
    funders
  };
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    return sendJson(request, response, 204, {});
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(request, response, 200, {
      ok: true,
      service: "funder-discovery-api"
    });
  }

  if (request.method === "POST" && url.pathname === "/api/discover") {
    try {
      const body = await readBody(request);
      const payload = body ? JSON.parse(body) : {};
      const profile = payload.profile || {};
      const result = await discoverFunders(profile);

      return sendJson(request, response, 200, {
        ok: true,
        source: "OpenAI Responses API web_search over public funder evidence",
        message: result.message,
        funders: result.funders
      });
    } catch (error) {
      return sendJson(request, response, error.statusCode || 400, {
        ok: false,
        code: error.statusCode === 503 ? "openai_not_configured" : "dynamic_discovery_failed",
        message: error.message
      });
    }
  }

  if (request.method === "POST" && url.pathname === "/api/report") {
    try {
      const body = await readBody(request);
      const payload = body ? JSON.parse(body) : {};
      const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY);

      return sendJson(request, response, hasOpenAIKey ? 501 : 503, {
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
      return sendJson(request, response, 400, {
        ok: false,
        code: "bad_request",
        message: error.message
      });
    }
  }

  return sendJson(request, response, 404, {
    ok: false,
    code: "not_found"
  });
});

server.listen(port, host, () => {
  console.log(`funder-discovery-api listening on ${host}:${port}`);
});
