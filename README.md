# Funder Discovery

Funder Discovery is a public-facing web app prototype for NGO leaders who need a ranked shortlist of funders worth pursuing. The tool is designed to reduce wasted fundraising time by scoring funders against an NGO profile, surfacing 990-backed evidence, warning about guideline-vs-990 gaps, estimating ask ranges, and flagging prospects that should not be pursued.

## What It Shows

- Page 1 intake that asks for enough NGO and project context to inform matching
- Page 2 ranked funder shortlist with a visible selected funder for briefing
- Page 3 selected funder brief with evidence, warnings, ask plan, sources, and a funder switcher
- NGO-specific funder fit scoring
- 990 and 990-PF-backed evidence fields
- Guideline-vs-990 warning severity
- Recommended ask ranges and ask risk feedback
- "Do not pursue" decision flags
- Source links for Kindora, ProPublica Nonprofit Explorer, IRS Tax Exempt Organization Search, and foundation websites

## Current Data Status

This prototype uses a curated seed dataset in `src/data.js`. It is intentionally transparent and auditable: funder records include EINs, public source URLs, source notes, scoring dimensions, warnings, and decision logic.

The production version should replace or expand the seed data with an ingestion pipeline from:

- ProPublica Nonprofit Explorer
- IRS tax-exempt organization data and XML filings
- Kindora funder records
- Foundation websites and grant guidelines
- Foundation Form 990 and 990-PF grant tables

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm ci
npm run build
```

The static build is emitted to `dist/`.

## Render Deployment

This repo includes `render.yaml` for a Render Static Site.

Render build settings:

- Runtime: static
- Build command: `npm ci && npm run build`
- Publish path: `dist`

Render can deploy the site from GitHub and redeploy automatically on commits to the default branch.

## Audit Notes

The funder ranking logic is deterministic and lives in `src/data.js`. The UI does not currently call an LLM or private API. This keeps the public prototype cheap to host and easy to audit.

Before presenting the tool as production-grade, the data pipeline should add filing-year provenance, grant-recipient examples, confidence scoring for each extracted claim, and a "last verified" timestamp per funder.
