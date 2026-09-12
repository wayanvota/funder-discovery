import http from "node:http";

function funder(name, overrides = {}) {
  return {
    legalName: name,
    displayName: name,
    ein: "123456789",
    city: "Example City",
    state: "NC",
    type: "Independent foundation",
    sourceYear: "Synthetic 2025 fixture",
    assets: 500000000,
    annualGrants: 50000000,
    askRange: [100000, 200000],
    currentAsk: 125000,
    priorities: "Community health access, maternal health, and nonprofit capacity.",
    geography: "National United States",
    eligibility: "Synthetic US 501(c)(3) applicants are eligible.",
    relationshipPath: "Verify a warm path with a fictional peer grantee.",
    evidence: "Synthetic filing evidence used only by the deterministic test harness.",
    strongest: "The fictional program and funder priorities align.",
    weakest: "No real relationship evidence is present in this fixture.",
    likelyObjection: "The synthetic funder may question the evidence base.",
    nextAction: "Verify eligibility and evidence before any outreach.",
    doNotSubmit: "Do not submit without human verification of every source.",
    tags: ["synthetic", "health"],
    warnings: ["Fixture data only"],
    officialUrl: "https://example.invalid/funder",
    officialEvidenceUrl: "https://example.invalid/funder/evidence",
    kindoraUrl: "https://example.invalid/kindora",
    propublicaUrl: "https://example.invalid/propublica",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [{ label: "Synthetic source", value: "No real funder data." }],
    dimensions: {
      mission: 92,
      geography: 90,
      grantSize: 88,
      evidence: 86,
      history: 82,
      eligibilityRisk: 80,
      timing: 78,
      relationship: 72,
      confidence: 90
    },
    ...overrides
  };
}

const normalResult = {
  message: "Synthetic discovery returned three candidates.",
  funders: [
    funder("North Star Health Foundation"),
    funder("Research First Foundation", {
      ein: "234567890",
      city: "Research City",
      currentAsk: 150000,
      dimensions: {
        mission: 74,
        geography: 76,
        grantSize: 72,
        evidence: 60,
        history: 62,
        eligibilityRisk: 60,
        timing: 58,
        relationship: 30,
        confidence: 72
      }
    }),
    funder("Maine Only Health Fund", {
      ein: "345678901",
      city: "Augusta",
      state: "ME",
      geography: "Maine",
      currentAsk: 100000,
      dimensions: {
        mission: 72,
        geography: 20,
        grantSize: 70,
        evidence: 48,
        history: 55,
        eligibilityRisk: 40,
        timing: 50,
        relationship: 25,
        confidence: 68
      }
    })
  ]
};

async function readJson(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (request, response) => {
  if (request.method !== "POST" || request.url !== "/v1/responses") {
    response.writeHead(404, { "content-type": "application/json" });
    return response.end(JSON.stringify({ error: { message: "Fixture route not found." } }));
  }

  if (request.headers.authorization !== "Bearer synthetic-e2e-key") {
    response.writeHead(401, { "content-type": "application/json" });
    return response.end(JSON.stringify({ error: { message: "Fixture key rejected." } }));
  }

  const payload = await readJson(request);
  const input = String(payload.input || "");

  if (input.includes("Rate Limited Provider Fixture")) {
    response.writeHead(429, { "content-type": "application/json" });
    return response.end(JSON.stringify({ error: { message: "Synthetic rate limit." } }));
  }

  let outputText;
  if (input.includes("Malformed Provider Fixture")) {
    outputText = "not-json";
  } else if (input.includes("Empty Provider Fixture")) {
    outputText = JSON.stringify({ message: "None", funders: [] });
  } else if (input.includes("Unsafe URL Fixture")) {
    outputText = JSON.stringify({
      message: "Unsafe candidate",
      funders: [funder("Unsafe Source Fund", { officialUrl: "javascript:alert(1)" })]
    });
  } else {
    outputText = JSON.stringify(normalResult);
  }

  response.writeHead(200, { "content-type": "application/json" });
  return response.end(JSON.stringify({ output_text: outputText }));
});

server.listen(10001, "127.0.0.1", () => {
  console.log("synthetic OpenAI fixture listening on 127.0.0.1:10001");
});
