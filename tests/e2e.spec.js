import { expect, test } from "@playwright/test";
import { spawn } from "node:child_process";

const API = "http://127.0.0.1:10000";

const profile = {
  name: "Synthetic Health Alliance",
  entityType: "US 501(c)(3) public charity",
  annualBudget: 2000000,
  geography: "North Carolina and the United States",
  targetPopulation: "Low-income families using community health services",
  programFocus: "Maternal health navigation and community health access",
  fundingUse: "Navigator staff, partner training, evaluation, and field operations",
  askAmount: 125000,
  projectStage: "Pilot with documented partner support",
  evidenceLevel: "Synthetic outcomes, baseline measures, and partner letters",
  relationshipAssets: "Synthetic board links and peer grantee introductions"
};

async function fillProfile(page) {
  for (const [field, value] of Object.entries(profile)) {
    await page.locator(`#field-${field}`).fill(String(value));
  }
}

async function runDiscovery(page) {
  await page.goto("/");
  await fillProfile(page);
  await page.getByRole("button", { name: "Find new funders" }).click();
  await expect(
    page.getByRole("heading", { name: "Ranked shortlist for Synthetic Health Alliance" })
  ).toBeVisible();
}

function apiProfile(name) {
  return { ...profile, name };
}

async function waitForHealth(url) {
  await expect
    .poll(async () => {
      try {
        return (await fetch(url)).ok;
      } catch {
        return false;
      }
    })
    .toBe(true);
}

test("U01 public intake renders the product promise", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Funder Discovery");
  await expect(page.getByRole("heading", { name: "Stop chasing the wrong funders." })).toBeVisible();
});

test("U02 about page explains the evidence boundary", async ({ page }) => {
  await page.goto("/about.html");
  await expect(page.getByText("990", { exact: false }).first()).toBeVisible();
});

test("U03 incomplete intake is blocked before discovery", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Find new funders" }).click();
  await expect(page.getByText("Improve the intake before discovery", { exact: false })).toBeVisible();
});

test("U04 complete intake reaches dynamic shortlist", async ({ page }) => {
  await runDiscovery(page);
  await expect(page.getByText("Found 3 dynamically discovered funders.")).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(3);
});

test("U05 strongest candidate is selected for briefing", async ({ page }) => {
  await runDiscovery(page);
  await expect(page.locator("aside.selection-panel h3")).toHaveText("North Star Health Foundation");
});

test("U06 shortlist search narrows visible funders", async ({ page }) => {
  await runDiscovery(page);
  await page.getByLabel("Search funders").fill("Maine Only");
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Maine Only Health Fund");
});

test("U07 decision filter isolates do-not-pursue records", async ({ page }) => {
  await runDiscovery(page);
  await page.locator(".filter-row").getByRole("button", { name: "Do not pursue" }).click();
  await expect(page.locator("tbody tr")).toHaveCount(1);
  await expect(page.locator("tbody tr")).toContainText("Maine Only Health Fund");
});

test("U08 selected funder opens a full evidence brief", async ({ page }) => {
  await runDiscovery(page);
  await page.getByRole("button", { name: "View funder brief" }).click();
  await expect(page.getByRole("heading", { name: "990-backed evidence" })).toBeVisible();
});

test("U09 ask controls expose an excessive-ask warning", async ({ page }) => {
  await runDiscovery(page);
  await page.getByRole("button", { name: "View funder brief" }).click();
  for (let index = 0; index < 4; index += 1) {
    await page.getByRole("button", { name: "Raise ask" }).click();
  }
  await expect(page.getByText("Too high", { exact: true })).toBeVisible();
});

test("U10 sources tab preserves public verification links", async ({ page }) => {
  await runDiscovery(page);
  await page.getByRole("button", { name: "View funder brief" }).click();
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await expect(page.locator(".source-links a")).toHaveCount(4);
});

test("A01 untrusted origins are never reflected by CORS", async ({ request }) => {
  const response = await request.get(`${API}/api/health`, {
    headers: { Origin: "https://attacker.invalid" }
  });
  expect(response.headers()["access-control-allow-origin"]).not.toBe("https://attacker.invalid");
});

test("A02 malformed JSON is rejected", async () => {
  const response = await fetch(`${API}/api/discover`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{not-json"
  });
  expect(response.status).toBe(400);
  expect((await response.json()).ok).toBe(false);
});

test("A03 a missing NGO profile is rejected before provider use", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, { data: {} });
  expect(response.status()).toBe(422);
  expect((await response.json()).code).toBe("invalid_profile");
});

test("A04 a negative ask is rejected before provider use", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, {
    data: { profile: { ...profile, askAmount: -1 } }
  });
  expect(response.status()).toBe(422);
  expect((await response.json()).message).toContain("positive, realistic number");
});

test("A05 an oversized request receives 413 without dropping the socket", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, {
    data: { profile: { ...profile, evidenceLevel: "x".repeat(210000) } }
  });
  expect(response.status()).toBe(413);
  expect((await response.json()).code).toBe("request_too_large");
});

test("A06 a backend without a provider key fails closed", async () => {
  const child = spawn(process.execPath, ["backend/server.js"], {
    cwd: process.cwd(),
    env: { ...process.env, PORT: "10002", HOST: "127.0.0.1", OPENAI_API_KEY: "" },
    stdio: "ignore"
  });
  try {
    await waitForHealth("http://127.0.0.1:10002/api/health");
    const response = await fetch("http://127.0.0.1:10002/api/discover", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile })
    });
    expect(response.status).toBe(503);
    expect((await response.json()).code).toBe("openai_not_configured");
  } finally {
    child.kill("SIGTERM");
  }
});

test("A07 malformed provider output is contained", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, {
    data: { profile: apiProfile("Malformed Provider Fixture") }
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).code).toBe("dynamic_discovery_failed");
});

test("A08 provider rate limits remain visible", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, {
    data: { profile: apiProfile("Rate Limited Provider Fixture") }
  });
  expect(response.status()).toBe(429);
  expect((await response.json()).message).toBe("Synthetic rate limit.");
});

test("A09 an empty provider shortlist fails closed", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, {
    data: { profile: apiProfile("Empty Provider Fixture") }
  });
  expect(response.status()).toBe(502);
  expect((await response.json()).message).toBe("Dynamic discovery returned no funders.");
});

test("A10 candidates without a safe official URL are discarded", async ({ request }) => {
  const response = await request.post(`${API}/api/discover`, {
    data: { profile: apiProfile("Unsafe URL Fixture") }
  });
  expect(response.status()).toBe(502);
  expect((await response.json()).message).toBe("Dynamic discovery returned no funders.");
});
