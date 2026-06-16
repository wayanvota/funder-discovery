import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  adjustedDimensions,
  askRisk,
  confidenceLabel,
  decisionFor,
  fitScore,
  guideline990Gap,
  money,
  organization,
  scoreWeights
} from "./data";
import "./styles.css";

const pages = [
  { id: "intake", eyebrow: "1. Data input", title: "Tell us what needs funding" },
  { id: "shortlist", eyebrow: "2. Ranked shortlist", title: "Funders worth your time" },
  { id: "brief", eyebrow: "3. Funder brief", title: "Why this funder is or is not worth pursuing" }
];

const tabs = ["Evidence", "Warnings", "Ask plan", "Sources"];
const filters = [
  "All",
  "Best outreach prospect",
  "Research first",
  "Do not pursue",
  "Benchmark only"
];
const coreChecks = [
  "Live funder discovery",
  "NGO-specific fit",
  "990-backed evidence",
  "Guideline-vs-990 warnings",
  "Ask range and risk",
  "Do not pursue flags"
];

const apiBase =
  window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost"
    ? "http://127.0.0.1:10000"
    : "https://funder-discovery-api.onrender.com";

const discoveryNote =
  "This tool should discover new funders for each US 501(c)(3) profile, then rank them with 990-backed evidence, warnings, ask ranges, and do-not-pursue flags.";

const scopeNote =
  "Intended scope: US 501(c)(3)s working in the US and US 501(c)(3)s working overseas. The backend discovery step must search for eligible funders before scoring, especially when geography is international.";

const intakeFields = [
  {
    field: "name",
    label: "Organization name",
    helper: "Use the public name a funder would recognize in a proposal or Form 990 search.",
    type: "text"
  },
  {
    field: "entityType",
    label: "Legal status",
    helper: "Example: US 501(c)(3) working in the US, US 501(c)(3) working overseas, fiscally sponsored project, or non-US NGO.",
    type: "text"
  },
  {
    field: "annualBudget",
    label: "Annual operating budget",
    helper: "A rough number is fine. This helps flag asks that are too large for the organization.",
    type: "number"
  },
  {
    field: "geography",
    label: "Geography served",
    helper: "Name countries, states, counties, or cities. Geography mismatches are a major waste of time.",
    type: "text"
  },
  {
    field: "targetPopulation",
    label: "Who benefits",
    helper: "Be specific about populations, communities, or institutions served by the funded work.",
    multiline: true
  },
  {
    field: "programFocus",
    label: "Program needing funding",
    helper: "Describe the work in funder language: issue area, service model, and primary outcome.",
    multiline: true
  },
  {
    field: "fundingUse",
    label: "What the grant would pay for",
    helper: "Examples: staff, evaluation, field pilots, technology, regranting, policy research, training.",
    multiline: true
  },
  {
    field: "askAmount",
    label: "Target ask",
    helper: "Enter the grant amount you would like to request. The tool compares it with modeled ask ranges.",
    type: "number"
  },
  {
    field: "projectStage",
    label: "Stage of work",
    helper: "Example: idea, pilot, expansion, proven program, research study, policy campaign.",
    type: "text"
  },
  {
    field: "evidenceLevel",
    label: "Evidence available",
    helper: "List outcomes, partners, evaluations, baseline data, prior grants, or admit where proof is thin.",
    multiline: true
  },
  {
    field: "relationshipAssets",
    label: "Relationship assets",
    helper: "Name board members, partners, peer grantees, or warm paths that could unlock invitation-only funders.",
    multiline: true
  }
];

const emptyProfile = Object.fromEntries(intakeFields.map((field) => [field.field, ""]));
const fieldLabels = Object.fromEntries(intakeFields.map((field) => [field.field, field.label]));

function textValue(value) {
  return String(value ?? "").trim();
}

function wordCount(value) {
  return textValue(value).split(/\s+/).filter(Boolean).length;
}

function isGenericGeography(value) {
  return ["global", "national", "international", "usa", "us", "united states"].includes(
    textValue(value).toLowerCase()
  );
}

function evaluateIntake(profile) {
  const fieldFeedback = {};
  const errors = [];
  const warnings = [];

  function add(field, severity, message) {
    const item = {
      field,
      label: fieldLabels[field] || field,
      severity,
      message
    };
    fieldFeedback[field] = item;
    if (severity === "error") {
      errors.push(item);
    } else {
      warnings.push(item);
    }
  }

  if (wordCount(profile.name) < 1) {
    add("name", "error", "Enter the public name a funder can recognize.");
  }

  const entityType = textValue(profile.entityType).toLowerCase();
  if (!entityType) {
    add("entityType", "error", "Say whether this is a US 501(c)(3), fiscal sponsorship, or non-US NGO.");
  } else if (!/(501|public charity|fiscal|sponsor|ngo|nonprofit|charity)/.test(entityType)) {
    add("entityType", "warning", "Add the legal status. The public version is strongest for US 501(c)(3)s.");
  }

  const annualBudget = Number(profile.annualBudget || 0);
  if (!annualBudget) {
    add("annualBudget", "warning", "Add a rough annual budget so ask-size risk can be judged.");
  }

  if (wordCount(profile.geography) < 2) {
    add("geography", "error", "Name the countries, states, counties, cities, or region served.");
  } else if (isGenericGeography(profile.geography)) {
    add("geography", "warning", "Generic geography produces generic funders. Add specific places served.");
  }

  if (wordCount(profile.targetPopulation) < 5) {
    add("targetPopulation", "error", "Name who benefits, not just the issue area.");
  }

  if (wordCount(profile.programFocus) < 6) {
    add("programFocus", "error", "Describe the program model and outcome in funder language.");
  }

  if (wordCount(profile.fundingUse) < 5) {
    add("fundingUse", "error", "Say what grant dollars would pay for.");
  }

  const askAmount = Number(profile.askAmount || 0);
  if (!askAmount) {
    add("askAmount", "error", "Enter the target ask so the tool can flag unrealistic grant sizes.");
  } else if (annualBudget && askAmount > annualBudget * 0.35) {
    add("askAmount", "warning", "This ask is more than 35% of the annual budget. Expect ask-size risk warnings.");
  }

  if (wordCount(profile.projectStage) < 2) {
    add("projectStage", "warning", "Add the stage of work so funders are matched to pilot, scale, research, or capital needs.");
  }

  if (wordCount(profile.evidenceLevel) < 5) {
    add("evidenceLevel", "warning", "List outcomes, evaluations, partners, prior grants, or say where proof is thin.");
  }

  if (wordCount(profile.relationshipAssets) < 4) {
    add("relationshipAssets", "warning", "Name warm paths, peer grantees, board links, partners, or say none are known.");
  }

  const score = Math.max(0, 100 - errors.length * 14 - warnings.length * 6);
  const status = errors.length ? "blocked" : warnings.length ? "usable" : "strong";

  return {
    errors,
    warnings,
    fieldFeedback,
    score,
    status,
    canSubmit: errors.length === 0
  };
}

function App() {
  const [profile, setProfile] = useState(emptyProfile);
  const [page, setPage] = useState("intake");
  const [discoveredFunders, setDiscoveredFunders] = useState([]);
  const [discoveryState, setDiscoveryState] = useState({
    status: "idle",
    message: "Enter an NGO profile, then run dynamic discovery.",
    source: null
  });
  const [selectedId, setSelectedId] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Evidence");
  const [asks, setAsks] = useState({});
  const [intakeAttempted, setIntakeAttempted] = useState(false);

  const intakeQuality = useMemo(() => evaluateIntake(profile), [profile]);

  const enriched = useMemo(() => {
    return [...discoveredFunders]
      .sort((a, b) => fitScore(b, profile) - fitScore(a, profile))
      .map((funder) => ({
        ...funder,
        score: fitScore(funder, profile),
        dimensions: adjustedDimensions(funder, profile),
        decision: decisionFor(funder, profile),
        gap: guideline990Gap(funder, profile)
      }));
  }, [discoveredFunders, profile]);

  const filtered = enriched.filter((funder) => {
    const haystack = [
      funder.displayName,
      funder.priorities,
      funder.geography,
      funder.tags.join(" "),
      funder.warnings.join(" "),
      funder.decision.label
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = haystack.includes(query.toLowerCase());
    const matchesFilter = filter === "All" || funder.decision.label === filter;
    return matchesQuery && matchesFilter;
  });

  const selected = enriched.find((funder) => funder.id === selectedId) ?? enriched[0] ?? null;
  const selectedAsk = selected ? asks[selected.id] ?? selected.currentAsk : 0;
  const buckets = filters
    .filter((item) => item !== "All")
    .map((item) => ({
      label: item,
      count: enriched.filter((funder) => funder.decision.label === item).length
    }));

  function updateProfile(field, value) {
    const normalizedValue =
      ["askAmount", "annualBudget"].includes(field) && value !== "" ? Number(value) : value;
    setProfile((current) => ({
      ...current,
      [field]: normalizedValue
    }));
  }

  function updateAsk(value) {
    if (!selected) return;
    setAsks((current) => ({ ...current, [selected.id]: Number(value) }));
  }

  function chooseFunder(id, nextPage = "brief") {
    setSelectedId(id);
    setActiveTab("Evidence");
    setPage(nextPage);
  }

  async function discoverFunders() {
    const quality = evaluateIntake(profile);
    setIntakeAttempted(true);

    if (!quality.canSubmit) {
      setDiscoveryState({
        status: "error",
        message: `Improve the intake before discovery: ${quality.errors
          .slice(0, 3)
          .map((item) => item.message)
          .join(" ")}`,
        source: null
      });
      return;
    }

    setDiscoveryState({
      status: "loading",
      message: "Searching for new funders and checking public evidence.",
      source: null
    });

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 80000);
      let response;
      try {
        response = await fetch(`${apiBase}/api/discover`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ profile }),
          signal: controller.signal
        });
      } finally {
        window.clearTimeout(timeout);
      }
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Dynamic discovery failed.");
      }

      setDiscoveredFunders(payload.funders);
      setAsks(
        Object.fromEntries(
          payload.funders.map((funder) => [funder.id, funder.currentAsk ?? funder.askRange?.[0] ?? 0])
        )
      );
      setSelectedId(payload.funders[0]?.id ?? "");
      setDiscoveryState({
        status: "success",
        message: payload.message || `Found ${payload.funders.length} candidate funders.`,
        source: payload.source || "Dynamic backend discovery"
      });
      setPage("shortlist");
    } catch (error) {
      setDiscoveredFunders([]);
      setSelectedId("");
      setDiscoveryState({
        status: "error",
        message:
          error.name === "AbortError"
            ? "Discovery took too long. Tighten the intake fields or try again with more specific geography and program details."
            : error.message,
        source: "Render backend"
      });
      setPage("shortlist");
    }
  }

  return (
    <main className="site-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <div className="brand-mark">FD</div>
          <div>
            <p className="eyebrow">Funder Discovery</p>
            <h1>Stop chasing the wrong funders.</h1>
          </div>
        </div>
        <nav className="step-nav" aria-label="Funder Discovery pages">
          {pages.map((item) => (
            <button
              className={page === item.id ? "active" : ""}
              key={item.id}
              onClick={() => setPage(item.id)}
              type="button"
            >
              <span>{item.eyebrow}</span>
              <strong>{item.title}</strong>
            </button>
          ))}
          <a className="about-link" href="./about.html">
            About
          </a>
        </nav>
      </header>

      {page === "intake" && (
        <IntakePage
          buckets={buckets}
          discoveryState={discoveryState}
          intakeAttempted={intakeAttempted}
          intakeQuality={intakeQuality}
          onContinue={discoverFunders}
          profile={profile}
          updateProfile={updateProfile}
        />
      )}

      {page === "shortlist" && (
        <ShortlistPage
          buckets={buckets}
          discoveryState={discoveryState}
          enriched={enriched}
          filter={filter}
          filtered={filtered}
          profile={profile}
          query={query}
          selected={selected}
          setFilter={setFilter}
          setPage={setPage}
          setQuery={setQuery}
          chooseFunder={chooseFunder}
        />
      )}

      {page === "brief" && (
        selected ? (
          <BriefPage
            activeTab={activeTab}
            enriched={enriched}
            selected={selected}
            selectedAsk={selectedAsk}
            setActiveTab={setActiveTab}
            setPage={setPage}
            updateAsk={updateAsk}
            chooseFunder={chooseFunder}
          />
        ) : (
          <EmptyBrief setPage={setPage} />
        )
      )}
    </main>
  );
}

function IntakePage({
  buckets,
  discoveryState,
  intakeAttempted,
  intakeQuality,
  onContinue,
  profile,
  updateProfile
}) {
  return (
    <section className="page-card intake-page">
      <div className="page-hero">
        <p className="section-label">1. Data input</p>
        <h2>Enough context to avoid bad funder matches</h2>
        <p>
          The shortlist is only useful if the tool knows what the NGO actually
          does, where it works, how much it needs, and how strong the evidence is.
        </p>
      </div>

      <div className="intake-grid">
        <form className="intake-form" onSubmit={(event) => event.preventDefault()}>
          {intakeFields.map((field) => (
            <IntakeField
              config={field}
              feedback={intakeQuality.fieldFeedback[field.field]}
              intakeAttempted={intakeAttempted}
              key={field.field}
              profile={profile}
              updateProfile={updateProfile}
            />
          ))}
        </form>

        <aside className="intake-aside">
          <section className="brief-card">
            <p className="section-label">What this changes</p>
            <h3>Ranking inputs</h3>
            <p>
              These fields affect mission match, geography eligibility, ask-size
              risk, relationship risk, and evidence confidence.
            </p>
            <p className="model-note">{discoveryNote}</p>
            <div className="proof-strip stacked" aria-label="Core funder discovery checks">
              {coreChecks.map((check) => (
                <span key={check}>{check}</span>
              ))}
            </div>
          </section>

          <section className="scope-panel">
            <p className="section-label">Who this is for</p>
            <h3>US nonprofits at home or overseas</h3>
            <p>{scopeNote}</p>
          </section>

          <ProfileQualityPanel intakeQuality={intakeQuality} />

          <section className="brief-card">
            <p className="section-label">Current model read</p>
            <p className={`status-line ${discoveryState.status}`}>{discoveryState.message}</p>
            <div className="bucket-grid compact">
              {buckets.map((bucket) => (
                <div className="bucket readonly" key={bucket.label}>
                  <span>{bucket.label}</span>
                  <strong>{bucket.count}</strong>
                </div>
              ))}
            </div>
            <button
              className="primary-action"
              disabled={discoveryState.status === "loading"}
              onClick={onContinue}
              type="button"
            >
              {discoveryState.status === "loading" ? "Finding funders" : "Find new funders"}
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function ProfileQualityPanel({ intakeQuality }) {
  const headline =
    intakeQuality.status === "strong"
      ? "Strong enough for discovery"
      : intakeQuality.status === "usable"
        ? "Usable, but sharpen it"
        : "Needs better data";
  const guidance = [...intakeQuality.errors, ...intakeQuality.warnings].slice(0, 5);

  return (
    <section className={`quality-panel ${intakeQuality.status}`}>
      <div className="quality-header">
        <div>
          <p className="section-label">Profile quality</p>
          <h3>{headline}</h3>
        </div>
        <strong>{intakeQuality.score}</strong>
      </div>
      {guidance.length ? (
        <ul>
          {guidance.map((item) => (
            <li className={item.severity} key={`${item.field}-${item.message}`}>
              <span>{item.label}</span>
              {item.message}
            </li>
          ))}
        </ul>
      ) : (
        <p>
          The intake has enough specificity for the backend to search by mission,
          geography, ask size, evidence, and relationship path.
        </p>
      )}
    </section>
  );
}

function IntakeField({ config, feedback, intakeAttempted, profile, updateProfile }) {
  const value = profile[config.field] ?? "";
  const id = `field-${config.field}`;
  const placeholder = String(organization[config.field] ?? "");
  const shouldShowFeedback = feedback && (intakeAttempted || value !== "");
  return (
    <label className={`field-block ${shouldShowFeedback ? feedback.severity : ""}`} htmlFor={id}>
      <span>{config.label}</span>
      <small>{config.helper}</small>
      {config.multiline ? (
        <textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(event) => updateProfile(config.field, event.target.value)}
        />
      ) : (
        <input
          id={id}
          min={config.type === "number" ? "0" : undefined}
          step={config.type === "number" ? "5000" : undefined}
          placeholder={placeholder}
          type={config.type ?? "text"}
          value={value}
          onChange={(event) => updateProfile(config.field, event.target.value)}
        />
      )}
      {shouldShowFeedback && <em className={`field-feedback ${feedback.severity}`}>{feedback.message}</em>}
    </label>
  );
}

function ShortlistPage({
  buckets,
  discoveryState,
  enriched,
  filter,
  filtered,
  profile,
  query,
  selected,
  setFilter,
  setPage,
  setQuery,
  chooseFunder
}) {
  return (
    <section className="page-card">
      <header className="topbar split">
        <div>
          <p className="section-label">2. Funders worth your time</p>
          <h2>Ranked shortlist for {profile.name || "your NGO"}</h2>
          <p>
            Pick a funder to build the brief. The highlighted row is the funder
            currently selected for Page 3.
          </p>
          <p className="model-note">{discoveryNote}</p>
        </div>
        <div className="source-strip" aria-label="Primary data sources">
          <span>Live web search</span>
          <span>IRS-derived</span>
          <span>990 / 990-PF</span>
          <span>ProPublica</span>
          <span>Official site</span>
        </div>
      </header>

      <div className="shortlist-layout">
        <section className="shortlist-main">
          <DiscoveryNotice discoveryState={discoveryState} profile={profile} />

          <div className="bucket-grid">
            {buckets.map((bucket) => (
              <button
                className={filter === bucket.label ? "bucket active" : "bucket"}
                key={bucket.label}
                onClick={() => setFilter(bucket.label)}
                type="button"
              >
                <span>{bucket.label}</span>
                <strong>{bucket.count}</strong>
              </button>
            ))}
          </div>

          <div className="toolbar">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search funders, warnings, geographies"
              aria-label="Search funders"
            />
            <div className="filter-row" aria-label="Prospect filters">
              {filters.map((item) => (
                <button
                  className={filter === item ? "active" : ""}
                  key={item}
                  onClick={() => setFilter(item)}
                  type="button"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <FunderTable
            filtered={filtered}
            selected={selected}
            chooseFunder={(id) => chooseFunder(id, "shortlist")}
          />
        </section>

        {selected ? (
          <aside className="selection-panel">
            <p className="section-label">Selected for brief</p>
            <h3>{selected.displayName}</h3>
            <DecisionBanner funder={selected} />
            <p>
              Page 3 will explain the evidence, warnings, ask range, and next
              action for this selected funder.
            </p>
            <div className="selected-actions">
              <button className="secondary-action" onClick={() => setPage("intake")} type="button">
                Edit intake
              </button>
              <button className="primary-action" onClick={() => setPage("brief")} type="button">
                View funder brief
              </button>
            </div>
            <div className="mini-list" aria-label="Change selected funder">
              {enriched.slice(0, 5).map((funder) => (
                <button
                  className={funder.id === selected.id ? "active" : ""}
                  key={funder.id}
                  onClick={() => chooseFunder(funder.id, "shortlist")}
                  type="button"
                >
                  <span>{funder.displayName}</span>
                  <strong>{funder.score}</strong>
                </button>
              ))}
            </div>
          </aside>
        ) : (
          <aside className="selection-panel">
            <p className="section-label">No selected funder</p>
            <h3>Run discovery first</h3>
            <p>
              The tool will not invent a shortlist from bundled dummy data. Enter
              the NGO profile on Page 1 and run dynamic discovery.
            </p>
            <button className="primary-action" onClick={() => setPage("intake")} type="button">
              Edit intake
            </button>
          </aside>
        )}
      </div>
    </section>
  );
}

function DiscoveryNotice({ discoveryState, profile }) {
  const profileText = [
    profile.geography,
    profile.targetPopulation,
    profile.programFocus,
    profile.fundingUse
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const likelyOutsideSeed = [
    "south asia",
    "india",
    "bangladesh",
    "nepal",
    "africa",
    "latin america",
    "global"
  ].some((term) => profileText.includes(term));

  if (discoveryState.status === "error") {
    return (
      <section className="warning-panel">
        <p className="section-label">Dynamic discovery blocked</p>
        <h3>The backend did not return new funders</h3>
        <p>{discoveryState.message}</p>
      </section>
    );
  }

  if (discoveryState.status === "idle") {
    return (
      <section className="empty-panel">
        <p className="section-label">No static shortlist</p>
        <h3>Discovery has not run yet</h3>
        <p>
          This page now stays empty until the Render backend searches for new
          funders for the NGO profile.
        </p>
      </section>
    );
  }

  if (discoveryState.status === "loading") {
    return (
      <section className="empty-panel">
        <p className="section-label">Searching</p>
        <h3>Finding new funders</h3>
        <p>{discoveryState.message}</p>
      </section>
    );
  }

  if (!likelyOutsideSeed) {
    return (
      <section className="success-panel">
        <p className="section-label">Dynamic discovery</p>
        <h3>New funders returned by the backend</h3>
        <p>{discoveryState.message}</p>
      </section>
    );
  }

  return (
    <section className="success-panel">
      <p className="section-label">International scope</p>
      <h3>Overseas work requires geography evidence</h3>
      <p>
        A US 501(c)(3) working overseas can use this workflow. The shortlist
        still has to prove each funder funds the relevant geography, not just the
        issue area.
      </p>
    </section>
  );
}

function FunderTable({ filtered, selected, chooseFunder }) {
  if (!filtered.length) {
    return (
      <section className="empty-panel table-empty">
        <p className="section-label">No funders yet</p>
        <h3>No dynamic shortlist is available</h3>
        <p>
          The table will populate only after backend discovery returns candidate
          funders with public evidence.
        </p>
      </section>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Funder</th>
            <th>Decision</th>
            <th>Fit</th>
            <th>Ask range</th>
            <th>990 warning</th>
            <th>Confidence</th>
            <th>Brief</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((funder) => (
            <tr
              className={funder.id === selected?.id ? "selected" : ""}
              key={funder.id}
              onClick={() => chooseFunder(funder.id)}
            >
              <td data-label="Funder">
                <button className="row-title" type="button">
                  <strong>{funder.displayName}</strong>
                  <span>
                    EIN {funder.ein} | {funder.city}, {funder.state}
                  </span>
                </button>
              </td>
              <td data-label="Decision">
                <DecisionPill decision={funder.decision} />
              </td>
              <td data-label="Fit">
                <Score score={funder.score} />
              </td>
              <td data-label="Ask range">
                {money(funder.askRange[0])} to {money(funder.askRange[1])}
              </td>
              <td data-label="990 warning">
                <span className={`gap-pill ${funder.gap.severity.toLowerCase()}`}>
                  {funder.gap.severity}
                </span>
              </td>
              <td data-label="Confidence">
                {confidenceLabel(funder.dimensions.confidence)}
              </td>
              <td data-label="Brief">
                <button
                  className="table-action"
                  onClick={(event) => {
                    event.stopPropagation();
                    chooseFunder(funder.id);
                  }}
                  type="button"
                >
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BriefPage({
  activeTab,
  enriched,
  selected,
  selectedAsk,
  setActiveTab,
  setPage,
  updateAsk,
  chooseFunder
}) {
  const risk = askRisk(selected, selectedAsk);
  return (
    <section className="page-card brief-page">
      <header className="topbar split">
        <div>
          <p className="section-label">3. Funder brief</p>
          <h2>{selected.displayName}</h2>
          <p>
            This brief belongs to the funder selected on Page 2. Change the funder
            here or return to the shortlist to review the full ranking.
          </p>
        </div>
        <div className="selected-actions">
          <button className="secondary-action" onClick={() => setPage("shortlist")} type="button">
            Back to shortlist
          </button>
          <button className="secondary-action" onClick={() => setPage("intake")} type="button">
            Edit intake
          </button>
        </div>
      </header>

      <div className="brief-layout">
        <aside className="selection-panel">
          <p className="section-label">Change funder brief</p>
          <div className="mini-list" aria-label="Choose a different funder brief">
            {enriched.map((funder) => (
              <button
                className={funder.id === selected.id ? "active" : ""}
                key={funder.id}
                onClick={() => chooseFunder(funder.id, "brief")}
                type="button"
              >
                <span>{funder.displayName}</span>
                <strong>{funder.score}</strong>
              </button>
            ))}
          </div>
        </aside>

        <FunderBrief
          activeTab={activeTab}
          risk={risk}
          selected={selected}
          selectedAsk={selectedAsk}
          setActiveTab={setActiveTab}
          updateAsk={updateAsk}
        />
      </div>
    </section>
  );
}

function EmptyBrief({ setPage }) {
  return (
    <section className="page-card brief-page">
      <header className="topbar split">
        <div>
          <p className="section-label">3. Funder brief</p>
          <h2>No funder selected yet</h2>
          <p>
            A brief only exists after dynamic discovery returns funders and you
            select one from the shortlist.
          </p>
        </div>
        <button className="primary-action" onClick={() => setPage("intake")} type="button">
          Start discovery
        </button>
      </header>
    </section>
  );
}

function FunderBrief({ activeTab, risk, selected, selectedAsk, setActiveTab, updateAsk }) {
  return (
    <section className="brief-card full-brief">
      <div className="brief-head">
        <div>
          <p className="section-label">Selected funder</p>
          <h2>{selected.displayName}</h2>
          <p>
            {selected.type} | EIN {selected.ein}
          </p>
        </div>
        <Score score={selected.score} />
      </div>

      <DecisionBanner funder={selected} />

      <div className="metrics">
        <Metric label="Assets" value={money(selected.assets)} />
        <Metric label="Annual grants" value={money(selected.annualGrants)} />
        <Metric label="Geography" value={selected.geography} />
      </div>

      <div className="score-breakdown">
        <div className="breakdown-head">
          <span>Score breakdown</span>
          <strong>{selected.score}/100</strong>
        </div>
        {Object.entries(scoreWeights).map(([key, weight]) => {
          const value = selected.dimensions[key];
          return (
            <div className="breakdown-row" key={key}>
              <div>
                <span>{labelize(key)}</span>
                <small>{Math.round(weight * 100)}% weight</small>
              </div>
              <meter min="0" max="100" value={value} />
              <strong>{value}</strong>
            </div>
          );
        })}
      </div>

      <div className="ask-control">
        <div className="ask-label">
          <span>Recommended ask</span>
          <strong>{money(selectedAsk)}</strong>
        </div>
        <div className="ask-buttons" aria-label="Adjust ask amount by 25,000 dollars">
          <button
            type="button"
            onClick={() =>
              updateAsk(
                Math.max(Math.round(selected.askRange[0] * 0.6), selectedAsk - 25000)
              )
            }
          >
            Lower ask
          </button>
          <button
            type="button"
            onClick={() =>
              updateAsk(
                Math.min(Math.round(selected.askRange[1] * 1.45), selectedAsk + 25000)
              )
            }
          >
            Raise ask
          </button>
        </div>
        <input
          type="range"
          min={Math.round(selected.askRange[0] * 0.6)}
          max={Math.round(selected.askRange[1] * 1.45)}
          step="5000"
          value={selectedAsk}
          onChange={(event) => updateAsk(event.target.value)}
          onInput={(event) => updateAsk(event.target.value)}
          aria-label="Adjust ask amount"
        />
        <div className={`risk-callout ${risk.level.toLowerCase().replaceAll(" ", "-")}`}>
          <strong>{risk.level}</strong>
          <span>{risk.message}</span>
        </div>
      </div>

      <nav className="tabs" aria-label="Briefing tabs">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab ? "active" : ""}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </nav>

      <div className="tab-panel">
        {activeTab === "Evidence" && <Evidence funder={selected} />}
        {activeTab === "Warnings" && <Warnings funder={selected} />}
        {activeTab === "Ask plan" && <AskPlan funder={selected} />}
        {activeTab === "Sources" && <Sources funder={selected} />}
      </div>
    </section>
  );
}

function DecisionBanner({ funder }) {
  return (
    <section className={`decision-banner ${funder.decision.tone}`}>
      <DecisionPill decision={funder.decision} />
      <p>{funder.decision.summary}</p>
    </section>
  );
}

function DecisionPill({ decision }) {
  return <span className={`decision-pill ${decision.tone}`}>{decision.label}</span>;
}

function Evidence({ funder }) {
  return (
    <div className="stack">
      <Block title="990-backed evidence" body={funder.evidence} />
      <Block title="Eligibility and geography" body={funder.eligibility} />
      <Block
        title="Source confidence"
        body={`${confidenceLabel(funder.dimensions.confidence)} confidence based on available public-record and official-site signals.`}
      />
    </div>
  );
}

function Warnings({ funder }) {
  return (
    <div className="skeptic-panel">
      <Block title="Guideline-vs-990 gap" body={funder.gap.summary} />
      {funder.gap.flags.map((flag) => (
        <Block key={flag} title="Warning" body={flag} />
      ))}
      <Block title="Do not submit until" body={funder.doNotSubmit} />
    </div>
  );
}

function AskPlan({ funder }) {
  return (
    <div className="stack">
      <Block title="Best program angle" body={funder.strongest} />
      <Block title="Likely objection" body={funder.likelyObjection} />
      <Block title="Next action" body={funder.nextAction} />
      <Block title="What not to say" body={funder.weakest} />
    </div>
  );
}

function Sources({ funder }) {
  const links = [
    ["Kindora profile", funder.kindoraUrl],
    ["ProPublica Nonprofit Explorer", funder.propublicaUrl],
    ["Official evidence page", funder.officialEvidenceUrl],
    ["IRS Tax Exempt Organization Search", funder.irsUrl]
  ].filter(([, url]) => url);

  return (
    <div className="stack">
      <div className="source-links">
        {links.map(([label, url]) => (
          <a href={url} key={label} target="_blank" rel="noreferrer">
            {label}
          </a>
        ))}
      </div>
      {funder.sourceNotes.map((note) => (
        <Block key={note.label} title={note.label} body={note.value} />
      ))}
      <Block title="Most recent available 990 year" body={funder.sourceYear} />
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Block({ title, body }) {
  return (
    <section className="text-block">
      <h3>{title}</h3>
      <p>{body}</p>
    </section>
  );
}

function Score({ score }) {
  return (
    <div className="score" aria-label={`Fit score ${score}`}>
      <span>{score}</span>
    </div>
  );
}

function labelize(value) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (letter) => letter.toUpperCase());
}

createRoot(document.getElementById("root")).render(<App />);
