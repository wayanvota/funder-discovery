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
  "NGO-specific fit",
  "990-backed evidence",
  "Guideline-vs-990 warnings",
  "Ask range and risk",
  "Do not pursue flags"
];

const seedFundersNote =
  "This public prototype currently reranks a curated 990-backed seed set. It does not yet search Kindora, ProPublica, IRS, or foundation sites for new funders.";

const scopeNote =
  "Intended scope: US 501(c)(3)s working in the US and US 501(c)(3)s working overseas. Current prototype caveat: overseas work can be entered, but the shortlist is only a seed-set reranking until backend discovery searches international funders and geography rules.";

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

function App() {
  const [profile, setProfile] = useState(organization);
  const [page, setPage] = useState("intake");
  const [selectedId, setSelectedId] = useState("chcf");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("Evidence");
  const [asks, setAsks] = useState(
    Object.fromEntries(funders.map((funder) => [funder.id, funder.currentAsk]))
  );

  const enriched = useMemo(() => {
    return [...funders]
      .sort((a, b) => fitScore(b, profile) - fitScore(a, profile))
      .map((funder) => ({
        ...funder,
        score: fitScore(funder, profile),
        dimensions: adjustedDimensions(funder, profile),
        decision: decisionFor(funder, profile),
        gap: guideline990Gap(funder, profile)
      }));
  }, [profile]);

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

  const selected = enriched.find((funder) => funder.id === selectedId) ?? enriched[0];
  const selectedAsk = asks[selected.id];
  const buckets = filters
    .filter((item) => item !== "All")
    .map((item) => ({
      label: item,
      count: enriched.filter((funder) => funder.decision.label === item).length
    }));

  function updateProfile(field, value) {
    setProfile((current) => ({
      ...current,
      [field]: ["askAmount", "annualBudget"].includes(field) ? Number(value) : value
    }));
  }

  function updateAsk(value) {
    setAsks((current) => ({ ...current, [selected.id]: Number(value) }));
  }

  function chooseFunder(id, nextPage = "brief") {
    setSelectedId(id);
    setActiveTab("Evidence");
    setPage(nextPage);
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
          onContinue={() => setPage("shortlist")}
          profile={profile}
          updateProfile={updateProfile}
        />
      )}

      {page === "shortlist" && (
        <ShortlistPage
          buckets={buckets}
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
      )}
    </main>
  );
}

function IntakePage({ buckets, onContinue, profile, updateProfile }) {
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
            <p className="model-note">{seedFundersNote}</p>
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

          <section className="brief-card">
            <p className="section-label">Current model read</p>
            <div className="bucket-grid compact">
              {buckets.map((bucket) => (
                <div className="bucket readonly" key={bucket.label}>
                  <span>{bucket.label}</span>
                  <strong>{bucket.count}</strong>
                </div>
              ))}
            </div>
            <button className="primary-action" onClick={onContinue} type="button">
              Rank current funder set
            </button>
          </section>
        </aside>
      </div>
    </section>
  );
}

function IntakeField({ config, profile, updateProfile }) {
  const value = profile[config.field] ?? "";
  const id = `field-${config.field}`;
  return (
    <label className="field-block" htmlFor={id}>
      <span>{config.label}</span>
      <small>{config.helper}</small>
      {config.multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(event) => updateProfile(config.field, event.target.value)}
        />
      ) : (
        <input
          id={id}
          min={config.type === "number" ? "0" : undefined}
          step={config.type === "number" ? "5000" : undefined}
          type={config.type ?? "text"}
          value={value}
          onChange={(event) => updateProfile(config.field, event.target.value)}
        />
      )}
    </label>
  );
}

function ShortlistPage({
  buckets,
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
          <h2>Ranked shortlist for {profile.name}</h2>
          <p>
            Pick a funder to build the brief. The highlighted row is the funder
            currently selected for Page 3.
          </p>
          <p className="model-note">{seedFundersNote}</p>
        </div>
        <div className="source-strip" aria-label="Primary data sources">
          <span>IRS-derived</span>
          <span>990 / 990-PF</span>
          <span>ProPublica</span>
          <span>Official site</span>
        </div>
      </header>

      <div className="shortlist-layout">
        <section className="shortlist-main">
          <SeedSetWarning profile={profile} />

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
      </div>
    </section>
  );
}

function SeedSetWarning({ profile }) {
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

  if (!likelyOutsideSeed) return null;

  return (
    <section className="warning-panel">
      <p className="section-label">Prototype limitation</p>
      <h3>This is not a complete funder search yet</h3>
      <p>
        A US 501(c)(3) working overseas can use the finished tool, but this
        public prototype is not a complete overseas funder search. Your intake
        points to international or South Asia work, and the current prototype only
        reranks the seed funders already in the app. A real version needs the
        Render backend to query funder data sources and return a new shortlist
        before scoring.
      </p>
    </section>
  );
}

function FunderTable({ filtered, selected, chooseFunder }) {
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
              className={funder.id === selected.id ? "selected" : ""}
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
