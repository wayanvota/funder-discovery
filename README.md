# Funder Discovery

Funder Discovery is a public-facing web app for NGO leaders who need a ranked shortlist of funders worth pursuing. The tool is designed to reduce wasted fundraising time by discovering new funder candidates for a US 501(c)(3), scoring them against an NGO profile, surfacing 990-backed evidence, warning about guideline-vs-990 gaps, estimating ask ranges, and flagging prospects that should not be pursued.

## What It Shows

- Page 1 intake that asks for enough NGO and project context to inform matching
- Page 2 dynamic funder discovery results with a visible selected funder for briefing
- Page 3 selected funder brief with evidence, warnings, ask plan, sources, and a funder switcher
- NGO-specific funder fit scoring
- 990 and 990-PF-backed evidence fields
- Guideline-vs-990 warning severity
- Recommended ask ranges and ask risk feedback
- "Do not pursue" decision flags
- Source links for Kindora, ProPublica Nonprofit Explorer, IRS Tax Exempt Organization Search, and foundation websites

## Scope

The intended product should support:

- US 501(c)(3) nonprofits working in the US
- US 501(c)(3) nonprofits working overseas

The public tool is intended to discover new funders through the Render backend. It should not fall back to a static shortlist. If `OPENAI_API_KEY` is missing on Render, Page 2 shows a backend configuration error instead of pretending dummy funders are real results.

## Current Data Status

The frontend starts with no funders. Dynamic discovery happens through `POST /api/discover` on the Render backend. The backend calls the OpenAI Responses API with web search and asks for public evidence from foundation websites, ProPublica, IRS/990 references, Kindora pages when available, and public grant guidelines.

The production version should strengthen the live discovery pipeline with direct ingestion from:

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

## Static Deployment On wayan.com

The public frontend should live on Wayan's existing website:

`https://wayan.com/funder-discovery/`

Build the static site:

```bash
npm ci
npm run build
```

Upload the contents of `dist/` to the FTP directory that serves:

`/funder-discovery/`

The build emits:

- `dist/index.html` for the tool
- `dist/about.html` for the about page
- `dist/assets/` for JavaScript and CSS

Do not upload `node_modules/`, source files, `.env` files, or the Render backend folder to FTP.

## Render Backend Deployment

This repo includes `render.yaml` for a Render backend service only. Render should not serve the public frontend.

Render backend settings:

- Runtime: Node
- Root directory: `backend`
- Build command: `npm install`
- Start command: `npm start`
- Health path: `/api/health`

The backend currently exposes:

- `GET /api/health`
- `POST /api/discover`, dynamic funder discovery through OpenAI web search when configured
- `POST /api/report`, reserved for future OpenAI-generated reports

Set `OPENAI_API_KEY` in Render for dynamic funder discovery. Do not expose API keys in the browser. Optional: set `OPENAI_MODEL`; otherwise the backend uses `gpt-5.4-mini`.

## Audit Notes

The browser does not call OpenAI directly. It calls the Render backend, and the backend handles dynamic discovery. Ranking and warnings still use deterministic scoring logic in `src/data.js` after funders are discovered.

Before presenting the tool as production-grade, the data pipeline should add direct filing-year provenance, grant-recipient examples, confidence scoring for each extracted claim, caching, rate limits, and a "last verified" timestamp per funder.
