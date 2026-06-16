export const organization = {
  name: "Civic Health Labs",
  mission:
    "Helping community health organizations improve patient outreach, maternal health navigation, and multilingual benefits enrollment.",
  description:
    "A fictional US nonprofit helping community health organizations improve patient outreach, maternal health navigation, and multilingual benefits enrollment.",
  budget: "$4.2M",
  annualBudget: 4200000,
  fundingGap: "$850K",
  entityType: "501(c)(3) public charity",
  geography: "US, with California and multistate pilots",
  targetPopulation:
    "Low-income pregnant people, safety-net clinic patients, and multilingual families navigating benefits enrollment.",
  programFocus: "Maternal health navigation and multilingual benefits enrollment",
  fundingUse:
    "Navigator staff, partner training, benefits-enrollment workflow improvements, evaluation, and California pilot expansion.",
  askAmount: 340000,
  projectStage: "Pilot with early expansion partners",
  evidenceLevel: "Pilot outcomes, partner letters, and baseline enrollment metrics still need strengthening.",
  relationshipAssets:
    "Community health center partners, maternal health coalitions, and possible warm paths through safety-net clinic networks.",
  proof:
    "Prototype assumes documented pilots with community health centers, enrollment navigators, and maternal health partners. Outcome proof is intentionally treated as incomplete until uploaded."
};

const kindora = "Kindora, IRS-derived funder profile";

export const funders = [
  {
    id: "chcf",
    legalName: "California HealthCare Foundation",
    displayName: "California HealthCare Foundation",
    ein: "954523231",
    city: "Oakland",
    state: "CA",
    type: "Health conversion foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 806876271,
    annualGrants: 115699495,
    askRange: [225000, 450000],
    currentAsk: 340000,
    priorities:
      "Health equity, health insurance coverage, Medi-Cal, maternal health, primary care, technology and innovation.",
    geography: "California",
    eligibility: "California fit is strong. National expansion claim would be weak without a California deployment partner.",
    relationshipPath: "Warm path needed through California health policy, Medi-Cal, or community clinic networks.",
    evidence:
      "Official site navigation surfaces health equity, coverage, Medi-Cal, maternal health, primary care, and technology and innovation. Kindora reports $806.9M in assets and $115.7M in annual grants.",
    strongest:
      "Civic Health Labs can frame the ask as a California safety-net access and navigation pilot, not a general AI product.",
    weakest:
      "The organization is fictional in this prototype, so there is no verified California implementation evidence yet.",
    likelyObjection:
      "CHCF may see the case as too software-led unless it is anchored in Medi-Cal access, workflow adoption, and patient outcomes.",
    nextAction:
      "Identify a California community health center partner before sending an LOI.",
    doNotSubmit:
      "Do not submit until there is a California partner, a Medi-Cal use case, and baseline enrollment metrics.",
    tags: ["strong fit", "source-linked", "state-specific"],
    warnings: ["Evidence gap", "State fit required"],
    officialUrl: "https://www.chcf.org/",
    officialEvidenceUrl: "https://www.chcf.org/about/what-we-do/",
    kindoraUrl: "https://www.kindora.co/funders/california-healthcare-foundation",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/954523231",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$806,876,271 assets; $115,699,495 annual grants." },
      { label: "Official site", value: "Topic areas include health equity, health insurance coverage, Medi-Cal, maternal health, primary care, and technology and innovation." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 92,
      geography: 95,
      grantSize: 86,
      evidence: 72,
      history: 78,
      eligibilityRisk: 74,
      timing: 70,
      relationship: 56,
      confidence: 82
    }
  },
  {
    id: "commonwealth",
    legalName: "The Commonwealth Fund",
    displayName: "The Commonwealth Fund",
    ein: "131635260",
    city: "New York",
    state: "NY",
    type: "Independent foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 922680894,
    annualGrants: 57467571,
    askRange: [175000, 350000],
    currentAsk: 260000,
    priorities:
      "Equitable high-performing health care, access, affordability, care delivery, Medicaid, policy, and research.",
    geography: "National and international learning",
    eligibility: "Research and policy angle is stronger than service delivery implementation.",
    relationshipPath: "LOI through online portal, with program fit to coverage, access, Medicaid, or care delivery.",
    evidence:
      "The Fund states that it promotes a high-performing equitable health care system for everyone, especially vulnerable populations, and accepts LOIs through its grants portal.",
    strongest:
      "A study-backed benefits enrollment and patient outreach model could fit if framed as policy-relevant evidence.",
    weakest:
      "A direct implementation ask without independent evaluation would look thin.",
    likelyObjection:
      "The funder may ask whether the work produces generalizable evidence rather than only operating support.",
    nextAction:
      "Convert the proposal into a research and dissemination ask with an external evaluator.",
    doNotSubmit:
      "Do not submit until the case names a research question, comparison group, and policy audience.",
    tags: ["research fit", "national", "LOI"],
    warnings: ["Needs evaluator", "Avoid operating-support framing"],
    officialUrl: "https://www.commonwealthfund.org/",
    officialEvidenceUrl: "https://www.commonwealthfund.org/grants",
    kindoraUrl: "https://www.kindora.co/funders/the-commonwealth-fund",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/131635260",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$922,680,894 assets; $57,467,571 annual grants." },
      { label: "Official grants page", value: "Mission emphasizes equitable access, quality, efficiency, and vulnerable populations; LOIs are accepted through the portal." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 86,
      geography: 86,
      grantSize: 78,
      evidence: 66,
      history: 82,
      eligibilityRisk: 64,
      timing: 76,
      relationship: 58,
      confidence: 88
    }
  },
  {
    id: "united",
    legalName: "United Health Foundation",
    displayName: "United Health Foundation",
    ein: "411941615",
    city: "Eden Prairie",
    state: "MN",
    type: "Corporate foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 80229597,
    annualGrants: 138110719,
    askRange: [300000, 750000],
    currentAsk: 500000,
    priorities:
      "Health workforce, maternal and infant health, health outcomes, and selected community partnerships.",
    geography: "National, invitation-oriented",
    eligibility:
      "Grant seekers must receive an invitation. 501(c)(3) nonprofits and public agencies are eligible.",
    relationshipPath: "Invitation required. Treat as a relationship-first target.",
    evidence:
      "Official page says the foundation has committed $880M to programs and communities, including $100M for the health care workforce, and lists maternal and infant health as a work area.",
    strongest:
      "The maternal navigation angle is credible if tied to workforce extension and trusted community partners.",
    weakest:
      "Cold submission is not viable because the foundation says applicants must receive an invitation.",
    likelyObjection:
      "They may see the ask as outside their named partnership channels or too early for a corporate foundation scale grant.",
    nextAction:
      "Seek an introduction through a current grantee or health workforce partner before preparing materials.",
    doNotSubmit:
      "Do not submit until there is a named internal champion or invitation path.",
    tags: ["corporate", "invitation only", "maternal health"],
    warnings: ["No cold LOI", "Relationship risk"],
    officialUrl: "https://www.unitedhealthfoundation.org/",
    officialEvidenceUrl: "https://www.unitedhealthfoundation.org/our-work.html",
    kindoraUrl: "https://www.kindora.co/funders/united-health-foundation",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/411941615",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$80,229,597 assets; $138,110,719 annual grants." },
      { label: "Official site", value: "Grant seekers must receive an invitation. The site lists health workforce and maternal and infant health work." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 80,
      geography: 84,
      grantSize: 82,
      evidence: 62,
      history: 70,
      eligibilityRisk: 38,
      timing: 68,
      relationship: 30,
      confidence: 86
    }
  },
  {
    id: "elevance",
    legalName: "Elevance Health Foundation Inc",
    displayName: "Elevance Health Foundation",
    ein: "352122763",
    city: "Indianapolis",
    state: "IN",
    type: "Corporate foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 139880517,
    annualGrants: 92991285,
    askRange: [250000, 600000],
    currentAsk: 420000,
    priorities:
      "Maternal and infant health, Food as Medicine, patient safety, vulnerable populations, and community health.",
    geography: "National",
    eligibility: "Foundation programming is targeted. Grant-seeker path should be checked before outreach.",
    relationshipPath: "Corporate foundation path through named focus areas and partner introductions.",
    evidence:
      "Official site describes a five-year $150M commitment beginning in 2025 and shows focus areas including Maternal/Infant Health and Food as Medicine.",
    strongest:
      "Benefits navigation can be positioned as social-needs infrastructure if paired with Food as Medicine or maternal health partners.",
    weakest:
      "The app's benefits enrollment use case is adjacent to, rather than directly inside, the named focus areas.",
    likelyObjection:
      "They may prefer food access, patient safety, or maternal outcomes projects over general outreach infrastructure.",
    nextAction:
      "Map the ask to one focus area, then cut the generic benefits-enrollment language.",
    doNotSubmit:
      "Do not submit until the proposal chooses either Food as Medicine or maternal and infant health as the lead frame.",
    tags: ["corporate", "focus areas", "health equity"],
    warnings: ["Adjacent fit", "Frame too broad"],
    officialUrl: "https://www.elevancehealth.foundation/",
    officialEvidenceUrl: "https://www.elevancehealth.foundation/",
    kindoraUrl: "https://www.kindora.co/funders/elevance-health-foundation-inc",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/352122763",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$139,880,517 assets; $92,991,285 annual grants." },
      { label: "Official site", value: "Site lists Maternal/Infant Health, Food as Medicine, and a $150M five-year commitment beginning in 2025." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 78,
      geography: 82,
      grantSize: 80,
      evidence: 60,
      history: 68,
      eligibilityRisk: 52,
      timing: 84,
      relationship: 40,
      confidence: 82
    }
  },
  {
    id: "carequest",
    legalName: "Carequest Foundation Inc",
    displayName: "CareQuest Foundation",
    ein: "043265080",
    city: "Boston",
    state: "MA",
    type: "Independent foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 21053071,
    annualGrants: 14527259,
    askRange: [75000, 180000],
    currentAsk: 125000,
    priorities:
      "Oral health systems change, access, equity, policy, community voice, care delivery, workforce, and research.",
    geography: "National, oral health-specific",
    eligibility:
      "Fit depends on whether Civic Health Labs can connect benefits navigation to oral health access.",
    relationshipPath: "Use the application process only if the oral health systems-change angle is real.",
    evidence:
      "CareQuest describes grantmaking for oral health systems change across policy, community voice, care delivery, and data-driven research.",
    strongest:
      "A dental benefits or oral-health referral navigation pilot could fit tightly.",
    weakest:
      "Without an oral health partner, this is mostly a thematic stretch.",
    likelyObjection:
      "They may reject the proposal as general health access rather than oral health systems change.",
    nextAction:
      "Find a community dental provider or Medicaid dental-access partner before outreach.",
    doNotSubmit:
      "Do not submit until the case names the oral health access problem and a relevant partner.",
    tags: ["narrow fit", "oral health", "systems change"],
    warnings: ["Program mismatch risk", "Partner required"],
    officialUrl: "https://www.carequest.org/",
    officialEvidenceUrl: "https://carequest.org/grants-overview/",
    kindoraUrl: "https://www.kindora.co/funders/carequest-foundation-inc",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/043265080",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$21,053,071 assets; $14,527,259 annual grants." },
      { label: "Official grants page", value: "Grantmaking focuses on oral health systems change, policy, community voice, care delivery, and research." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 56,
      geography: 78,
      grantSize: 75,
      evidence: 42,
      history: 54,
      eligibilityRisk: 50,
      timing: 66,
      relationship: 46,
      confidence: 84
    }
  },
  {
    id: "perigee",
    legalName: "PERIGEE FUND",
    displayName: "Perigee Fund",
    ein: "830847498",
    city: "Seattle",
    state: "WA",
    type: "Place-based fund",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 20642968,
    annualGrants: 48741931,
    askRange: [100000, 275000],
    currentAsk: 190000,
    priorities:
      "Maternal mental health, infant and early childhood mental health, family supports, communities of color, and caregiver relationships.",
    geography: "Regional and selected national learning",
    eligibility:
      "Strong only if the benefits navigation work is centered on perinatal mental health or family supports.",
    relationshipPath: "Prospect through grantee directory and maternal mental health networks.",
    evidence:
      "Official site says Perigee supports infant-caregiver relationships and focuses on Mental Health and Family Supports for Well-Being, centering communities of color.",
    strongest:
      "Maternal navigation could fit if the case focuses on caregivers, perinatal mental health, and warm referrals.",
    weakest:
      "A broad benefits enrollment pitch would dilute the focus on infant-caregiver relationships.",
    likelyObjection:
      "They may see the technology layer as secondary to relationship-based family support.",
    nextAction:
      "Rewrite the ask around caregiver trust, perinatal mental health, and referral continuity.",
    doNotSubmit:
      "Do not submit until maternal mental health outcomes are the center of the case.",
    tags: ["maternal", "family supports", "narrow thesis"],
    warnings: ["Reframe needed", "Outcome proof weak"],
    officialUrl: "https://perigeefund.org/",
    officialEvidenceUrl: "https://perigeefund.org/",
    kindoraUrl: "https://www.kindora.co/funders/perigee-fund",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/830847498",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$20,642,968 assets; $48,741,931 annual grants." },
      { label: "Official site", value: "Focuses on infant-caregiver relationships, Mental Health, Family Supports for Well-Being, and communities of color." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 70,
      geography: 58,
      grantSize: 72,
      evidence: 48,
      history: 60,
      eligibilityRisk: 58,
      timing: 70,
      relationship: 48,
      confidence: 82
    }
  },
  {
    id: "mehaf",
    legalName: "Maine Health Access Foundation Inc",
    displayName: "Maine Health Access Foundation",
    ein: "010535144",
    city: "Augusta",
    state: "ME",
    type: "Health conversion foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 154407890,
    annualGrants: 16449441,
    askRange: [60000, 160000],
    currentAsk: 115000,
    priorities:
      "Access to quality health care in Maine, community-responsive grants, health advocacy, equity capacity building, and systems improvement.",
    geography: "Maine",
    eligibility: "Weak unless Civic Health Labs has a Maine delivery partner.",
    relationshipPath: "Apply through Grants Center only after a Maine-specific project is defined.",
    evidence:
      "Official site describes the foundation as promoting access to quality health care to everyone in Maine and lists community responsive, health advocacy, health equity capacity building, and systems improvement grants.",
    strongest:
      "The model could fit a rural access or multilingual enrollment partner in Maine.",
    weakest:
      "No Maine partner is named, which makes the current case unready.",
    likelyObjection:
      "They may reject anything that looks national or California-first.",
    nextAction:
      "Pause outreach until there is a Maine clinic, navigator, or advocacy partner.",
    doNotSubmit:
      "Do not submit until the proposal is Maine-specific and led with a Maine partner.",
    tags: ["place-based", "weak current fit", "Maine"],
    warnings: ["No geography fit", "Do not submit"],
    officialUrl: "https://mehaf.org/",
    officialEvidenceUrl: "https://mehaf.org/grants-center/funding-opportunites",
    kindoraUrl: "https://www.kindora.co/funders/maine-health-access-foundation-inc",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/010535144",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$154,407,890 assets; $16,449,441 annual grants." },
      { label: "Official site", value: "Site describes promoting access to quality health care to everyone in Maine and lists grant programs." },
      { label: "Source limitation", value: "Connector profile did not expose the exact Form 990 filing year." }
    ],
    dimensions: {
      mission: 76,
      geography: 28,
      grantSize: 70,
      evidence: 38,
      history: 56,
      eligibilityRisk: 42,
      timing: 60,
      relationship: 36,
      confidence: 78
    }
  },
  {
    id: "colorado",
    legalName: "THE COLORADO HEALTH FOUNDATION",
    displayName: "The Colorado Health Foundation",
    ein: "742568941",
    city: "Denver",
    state: "CO",
    type: "Health conversion foundation",
    sourceYear: "Latest IRS record in Kindora profile, 990 year not exposed",
    assets: 2893236966,
    annualGrants: 327606412,
    askRange: [150000, 400000],
    currentAsk: 280000,
    priorities:
      "Health access and equity in Colorado. Official source access was blocked during prototype verification.",
    geography: "Colorado",
    eligibility: "Weak unless Civic Health Labs has a Colorado partner and community-led design.",
    relationshipPath: "Treat as a Colorado-only prospect until official program pages are verified.",
    evidence:
      "Kindora reports $2.89B in assets and $327.6M in annual grants. Official site blocked automated access during verification, so program detail is marked lower confidence.",
    strongest:
      "Large health foundation with clear health-access relevance if a Colorado deployment exists.",
    weakest:
      "Official program fit was not verified in this run, and no Colorado partner is named.",
    likelyObjection:
      "They may reject national or technology-first projects without Colorado community ownership.",
    nextAction:
      "Manually verify current funding priorities and identify a Colorado partner before outreach.",
    doNotSubmit:
      "Do not submit until official priorities are verified and the project is Colorado-specific.",
    tags: ["large funder", "blocked source", "place-based"],
    warnings: ["Official source blocked", "Geography gap"],
    officialUrl: "https://coloradohealth.org/",
    officialEvidenceUrl: "https://coloradohealth.org/funding",
    kindoraUrl: "https://www.kindora.co/funders/the-colorado-health-foundation",
    propublicaUrl: "https://projects.propublica.org/nonprofits/organizations/742568941",
    irsUrl: "https://apps.irs.gov/app/eos/",
    sourceNotes: [
      { label: kindora, value: "$2,893,236,966 assets; $327,606,412 annual grants." },
      { label: "Official site", value: "Automated request returned an access-block page during verification." },
      { label: "Source limitation", value: "Program priorities should be checked manually before use." }
    ],
    dimensions: {
      mission: 78,
      geography: 32,
      grantSize: 80,
      evidence: 30,
      history: 60,
      eligibilityRisk: 38,
      timing: 54,
      relationship: 34,
      confidence: 62
    }
  }
];

export const scoreWeights = {
  mission: 0.18,
  geography: 0.14,
  grantSize: 0.12,
  evidence: 0.14,
  history: 0.1,
  eligibilityRisk: 0.12,
  timing: 0.08,
  relationship: 0.06,
  confidence: 0.06
};

const profileTerms = {
  maternal: ["maternal", "infant", "perinatal", "caregiver"],
  access: ["access", "coverage", "medicaid", "medi-cal", "benefits", "enrollment"],
  equity: ["equity", "vulnerable", "underserved", "communities of color"],
  workforce: ["workforce", "navigator", "community health worker"],
  oral: ["oral", "dental"],
  food: ["food", "nutrition"]
};

function includesAny(text, terms) {
  const haystack = text.toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function adjustedDimensions(funder, profile = organization) {
  const profileText = [
    profile.name,
    profile.mission,
    profile.entityType,
    profile.geography,
    profile.targetPopulation,
    profile.programFocus,
    profile.fundingUse,
    profile.projectStage,
    profile.evidenceLevel,
    profile.relationshipAssets
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const funderText = [funder.priorities, funder.geography, funder.eligibility]
    .join(" ")
    .toLowerCase();

  const dimensions = { ...funder.dimensions };

  if (funder.geography.toLowerCase().includes("california")) {
    dimensions.geography = includesAny(profileText, ["california", " ca ", "medi-cal"])
      ? Math.max(dimensions.geography, 94)
      : Math.min(dimensions.geography, 48);
  } else if (funder.geography.toLowerCase().includes("maine")) {
    dimensions.geography = includesAny(profileText, ["maine", " me "])
      ? Math.max(dimensions.geography, 92)
      : Math.min(dimensions.geography, 35);
  } else if (funder.geography.toLowerCase().includes("colorado")) {
    dimensions.geography = includesAny(profileText, ["colorado", " co "])
      ? Math.max(dimensions.geography, 92)
      : Math.min(dimensions.geography, 38);
  } else if (funder.geography.toLowerCase().includes("national")) {
    dimensions.geography = includesAny(profileText, ["national", "u.s.", "us,", "united states"])
      ? Math.max(dimensions.geography, 82)
      : dimensions.geography;
  }

  const matchedCategories = Object.values(profileTerms).filter(
    (terms) => includesAny(profileText, terms) && includesAny(funderText, terms)
  ).length;
  dimensions.mission = clamp(dimensions.mission + matchedCategories * 4 - (matchedCategories ? 0 : 8));

  const askAmount = Number(profile.askAmount || organization.askAmount);
  if (askAmount < funder.askRange[0]) dimensions.grantSize = clamp(dimensions.grantSize - 6);
  if (askAmount > funder.askRange[1]) dimensions.grantSize = clamp(dimensions.grantSize - 16);
  if (askAmount >= funder.askRange[0] && askAmount <= funder.askRange[1]) {
    dimensions.grantSize = clamp(dimensions.grantSize + 6);
  }

  if (includesAny(profileText, ["no outcomes", "early", "idea", "concept"])) {
    dimensions.evidence = clamp(dimensions.evidence - 18);
  }
  if (includesAny(profileText, ["pilot", "baseline", "partner", "outcomes"])) {
    dimensions.evidence = clamp(dimensions.evidence + 6);
  }

  if (includesAny(profileText, ["evaluation", "study", "research", "comparison group"])) {
    dimensions.evidence = clamp(dimensions.evidence + 5);
    dimensions.history = clamp(dimensions.history + 3);
  }

  if (includesAny(profileText, ["board", "warm", "partner", "coalition", "peer grantee", "introduction"])) {
    dimensions.relationship = clamp(dimensions.relationship + 8);
  }

  const annualBudget = Number(profile.annualBudget || 0);
  if (annualBudget && askAmount > annualBudget * 0.35) {
    dimensions.grantSize = clamp(dimensions.grantSize - 8);
    dimensions.eligibilityRisk = clamp(dimensions.eligibilityRisk - 4);
  }

  return dimensions;
}

export function fitScore(funder, profile = organization) {
  const dimensions = adjustedDimensions(funder, profile);
  return Math.round(
    Object.entries(scoreWeights).reduce((total, [key, weight]) => {
      return total + dimensions[key] * weight;
    }, 0)
  );
}

export function decisionFor(funder, profile = organization) {
  const dimensions = adjustedDimensions(funder, profile);
  const score = fitScore(funder, profile);
  if (dimensions.geography < 42 || dimensions.evidence < 35) {
    return {
      label: "Do not pursue",
      tone: "bad",
      summary: "Fit is too weak for outreach without changing the project facts."
    };
  }
  if (funder.annualGrants > 100000000 && score < 66) {
    return {
      label: "Benchmark only",
      tone: "neutral",
      summary: "Useful for learning the market, not for immediate outreach."
    };
  }
  if (score >= 78 && dimensions.relationship >= 45 && dimensions.evidence >= 55) {
    return {
      label: "Best outreach prospect",
      tone: "good",
      summary: "Strong enough to justify a next-step outreach plan."
    };
  }
  return {
    label: "Research first",
    tone: "warn",
    summary: "Potential fit, but the case needs verification before outreach."
  };
}

export function guideline990Gap(funder, profile = organization) {
  const dimensions = adjustedDimensions(funder, profile);
  const flags = [];
  if (dimensions.evidence < 50) {
    flags.push("Stated program fit is not backed by enough visible recent-giving evidence.");
  }
  if (dimensions.geography < 50) {
    flags.push("Stated issue fit does not overcome the geography mismatch.");
  }
  if (dimensions.relationship < 45) {
    flags.push("Recent giving may be relationship-led or invitation-gated.");
  }
  if (dimensions.grantSize < 62) {
    flags.push("Actual ask may not match the funder's visible grant-size pattern.");
  }

  if (!flags.length) {
    return {
      severity: "Low",
      summary: "Website priorities and public-record fit are aligned enough for outreach due diligence.",
      flags: ["No major guideline-vs-990 warning in this prototype scoring pass."]
    };
  }

  return {
    severity: flags.length >= 3 ? "High" : "Medium",
    summary:
      "The funder may sound relevant publicly, but the public-record signals are not strong enough to treat that as proof.",
    flags
  };
}

export function confidenceLabel(score) {
  if (score >= 82) return "High";
  if (score >= 70) return "Medium";
  return "Low";
}

export function money(value) {
  if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  return `$${Math.round(value / 1000)}K`;
}

export function askRisk(funder, amount) {
  const [min, max] = funder.askRange;
  if (amount < min) {
    return {
      level: "Under-asked",
      message: "This leaves money on the table if the funder is already a strategic fit."
    };
  }
  if (amount > max) {
    return {
      level: "Too high",
      message: "This ask exceeds the modeled range. Expect harder questions about traction, cofunding, and outcomes."
    };
  }
  if (funder.dimensions.evidence < 50) {
    return {
      level: "Evidence weak",
      message: "The amount is plausible, but the proof base is not ready for this funder."
    };
  }
  if (funder.dimensions.relationship < 45) {
    return {
      level: "Relationship risk",
      message: "The amount is plausible only if an introduction path is found first."
    };
  }
  return {
    level: "Defensible",
    message: "The amount sits inside the modeled range and can be defended if the evidence gaps are closed."
  };
}
