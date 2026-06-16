import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  adjustedDimensions,
  askRisk,
  confidenceLabel,
  decisionFor,
  fitScore,
  funders,
  guideline990Gap,
  money,
  organization,
  scoreWeights
} from "./data";
import "./styles.css";

const tabs = ["Evidence", "Warnings", "Ask plan", "Sources"];
const filters = [
  "All",
  "Best outreach prospect",
  "Research first",
  "Do not pursue",
  "Benchmark only"
];
const coreChecks = [
  "NGO-specific fit",
  "990-backed evidence",
  "Guideline-vs-990 warnings",
  "Ask range and risk",
  "Do not pursue flags"
];

function App() {
  const [profile, setProfile] = useState(organization);
  const [selectedId, setSelectedId] = useState("chcf");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Evidence");
  const [asks, setAsks] = useState(
    Object.fromEntries(funders.map((funder) => [funder.id, funder.currentAsk]))
  );

  const ranked = useMemo(
    () => [...funders].sort((a, b) => fitScore(b, profile) - fitScore(a, profile)),
    [profile]
  );

  const enriched = ranked.map((funder) => ({
    ...funder,
    score: fitScore(funder, profile),
    dimensions: adjustedDimensions(funder, profile),
    decision: decisionFor(funder, profile),
    gap: guideline990Gap(funder, profile)
  }));

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

  const selected =
    enriched.find((funder) => funder.id === selectedId) ?? enriched[0];
  const selectedAsk = asks[selected.id];
  const risk = askRisk(selected, selectedAsk);
  const buckets = filters
    .filter((item) => item !== "All")
    .map((item) => ({
      label: item,
      count: enriched.filter((funder) => funder.decision.label === item).length
    }));

  function updateProfile(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: field === "askAmount" ? Number(value) : value
    }));
  }

  function updateAsk(value) {
    setAsks((current) => ({ ...current, [selected.id]: Number(value) }));
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-lockup">
          <div className="brand-mark">FD</div>
          <div>
            <p className="eyebrow">Funder Discovery</p>
            <h1>Stop chasing the wrong funders.</h1>
          </div>
        </div>

        <section className="org-panel intake-panel">
          <p className="section-label">1. NGO Intake</p>
          <label>
            Organization
            <input
              value={profile.name}
              onChange={(event) => updateProfile("name", event.target.value)}
            />
          </label>
          <label>
            Geography served
            <input
              value={profile.geography}
              onChange={(event) => updateProfile("geography", event.target.value)}
            />
          </label>
          <label>
            Program needing funding
            <textarea
              value={profile.programFocus}
              onChange={(event) => updateProfile("programFocus", event.target.value)}
            />
          </label>
          <label>
            Target ask
            <input
              type="number"
              min="10000"
              step="5000"
              value={profile.askAmount}
              onChange={(event) => updateProfile("askAmount", event.target.value)}
            />
          </label>
          <label>
            Evidence available
            <textarea
              value={profile.evidenceLevel}
              onChange={(event) => updateProfile("evidenceLevel", event.target.value)}
            />
          </label>
          <p className="model-note">
            This preview reranks a curated 990-backed funder set from the intake
            fields. The public version should expand ingestion across
            ProPublica, IRS records, Kindora, and foundation websites.
          </p>
        </section>

        <section className="scoring-panel">
          <p className="section-label">Scoring Model</p>
          <p className="model-note">
            Scores are deterministic. The model ranks fit, then forces weak
            prospects into research, benchmark, or do-not-pursue buckets.
          </p>
          {Object.entries(scoreWeights).map(([key, weight]) => (
            <div className="weight-row" key={key}>
              <span>{labelize(key)}</span>
              <strong>{Math.round(weight * 100)}%</strong>
            </div>
          ))}
        </section>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="section-label">2. Ranked Shortlist</p>
            <h2>Funders actually worth your time</h2>
            <p>
              Built for NGO leaders who need a defensible shortlist, not another
              database to sort through.
            </p>
          </div>
          <div className="source-strip" aria-label="Primary data sources">
            <span>IRS-derived</span>
            <span>990 / 990-PF</span>
            <span>ProPublica</span>
            <span>Official site</span>
          </div>
        </header>

        <div className="proof-strip" aria-label="Core funder discovery checks">
          {coreChecks.map((check) => (
            <span key={check}>{check}</span>
          ))}
        </div>

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
              </tr>
            </thead>
            <tbody>
              {filtered.map((funder) => (
                <tr
                  className={funder.id === selected.id ? "selected" : ""}
                  key={funder.id}
                  onClick={() => {
                    setSelectedId(funder.id);
                    setActiveTab("Evidence");
                  }}
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="briefing">
        <section className="brief-card">
          <div className="brief-head">
            <div>
              <p className="section-label">3. Funder Brief</p>
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
                    Math.max(
                      Math.round(selected.askRange[0] * 0.6),
                      selectedAsk - 25000
                    )
                  )
                }
              >
                Lower ask
              </button>
              <button
                type="button"
                onClick={() =>
                  updateAsk(
                    Math.min(
                      Math.round(selected.askRange[1] * 1.45),
                      selectedAsk + 25000
                    )
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
      </aside>
    </main>
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
      <Block title="Source confidence" body={`${confidenceLabel(funder.dimensions.confidence)} confidence based on available public-record and official-site signals.`} />
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
  return (
    <div className="stack">
      <div className="source-links">
        <a href={funder.kindoraUrl} target="_blank" rel="noreferrer">
          Kindora profile
        </a>
        <a href={funder.propublicaUrl} target="_blank" rel="noreferrer">
          ProPublica Nonprofit Explorer
        </a>
        <a href={funder.officialEvidenceUrl} target="_blank" rel="noreferrer">
          Official evidence page
        </a>
        <a href={funder.irsUrl} target="_blank" rel="noreferrer">
          IRS Tax Exempt Organization Search
        </a>
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
