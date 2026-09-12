# End-to-end test report

## Scope

The harness joins the production Vite build, Chromium, the running Node API,
and a local fake OpenAI Responses API. It verifies the public intake, dynamic
shortlist, decision filters, funder brief, human verification links, backend
validation, provider failures, and request boundaries. All fixture identities,
organizations, funders, and evidence are fictional.

The permanent GitHub Actions suite has no provider secret. One separately
authorized live smoke used the local OpenAI key named `github` with a synthetic
profile. It returned six candidates and exposed no key or user data.

## Results

| ID | Category | Expected behavior | Result |
|---|---|---|---|
| U01 | Public intake | The product page and promise render | Pass |
| U02 | About and evidence | The about page exposes the 990 evidence boundary | Pass |
| U03 | Intake quality | Incomplete intake is blocked before discovery | Pass |
| U04 | Dynamic discovery | Complete intake reaches a three-funder shortlist | Pass |
| U05 | Ranking | The strongest candidate is selected for briefing | Pass |
| U06 | Search | Shortlist search narrows visible funders | Pass |
| U07 | Decision filter | Do-not-pursue records can be isolated | Pass |
| U08 | Funder brief | The selected candidate opens a complete evidence brief | Pass |
| U09 | Ask risk | Raising an ask beyond the modeled range shows a warning | Pass |
| U10 | Source verification | The sources tab preserves four public verification links | Pass |
| A01 | CORS boundary | An untrusted origin is never reflected | Pass |
| A02 | Malformed JSON | Invalid JSON receives a controlled 400 response | Pass |
| A03 | Missing profile | Direct API use without a profile is rejected before OpenAI | Pass |
| A04 | Impossible amount | A negative ask is rejected before OpenAI | Pass |
| A05 | Body limit | A request over 200 KB receives 413 without a dropped socket | Pass |
| A06 | Missing secret | A backend without an OpenAI key fails closed with 503 | Pass |
| A07 | Invalid provider output | Non-JSON model output is contained | Pass |
| A08 | Provider throttling | A 429 remains visible to the caller | Pass |
| A09 | Empty result | An empty model shortlist fails closed | Pass |
| A10 | Unsafe source URL | A candidate without a safe HTTP(S) official URL is discarded | Pass |

Local result: 20 of 20 categories passed in Chromium. The production build,
clean frontend and backend installs, JavaScript syntax checks, and both package
audits passed. The first run passed 19 of 20 because the test client converted
the malformed body into valid JSON; the corrected raw-request test passed in the
complete rerun.

[GitHub Actions run 34667443393](https://github.com/wayanvota/funder-discovery/actions/runs/34667443393)
passed the production build, all 20 categories in Chromium, clean installs, and
both dependency audits on Node 22.16.0.

## Defects fixed

- Direct API callers could bypass all browser-side profile validation. The
  backend now requires the core organization fields and positive, bounded
  budget and ask values before a provider call.
- Requests over 200 KB destroyed the connection. The backend now returns a
  stable 413 JSON response with `request_too_large`.
- Source URL normalization accepted any string beginning with `http`. It now
  parses the URL, allows only HTTP(S), and rejects embedded credentials.
- The frontend lock contained high-severity Nano ID and PostCSS advisories.
  Non-breaking lockfile updates removed both; the audit now reports zero known
  vulnerabilities.
- Render used a non-deterministic backend install. The Blueprint now uses
  `npm ci` against the committed lockfile.

## Run locally

```bash
npm ci
npm ci --prefix backend
npx playwright install chromium
npm run test:ci
npm audit --audit-level=high
npm audit --prefix backend --audit-level=high
```

## Debug and extend

- The test stack uses ports 4173, 10000, and 10001. Stop another local service
  on those ports before running the suite.
- `tests/fixtures/openai-server.mjs` implements deterministic success, invalid
  JSON, rate-limit, empty-result, and unsafe-link responses.
- Keep exactly 10 `U` and 10 `A` categories. Replace a weaker scenario when a
  more consequential user or adversarial behavior is added.
- Test through the browser or running HTTP boundary. Do not call private helper
  functions when the same behavior is reachable through the product.
- Do not add a provider key, real nonprofit profile, grant data, relationship
  data, or real funder record to fixtures or GitHub Actions.
