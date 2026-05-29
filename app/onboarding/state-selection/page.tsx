import { redirect } from "next/navigation";
import { getServiceCountryByIso } from "@/app/actions/admin-services";
import StateSelectionClient, { type StateOption } from "./StateSelectionClient";

const HARDCODED_ALL_STATE_NAMES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const HARDCODED_ALL_STATES: StateOption[] = HARDCODED_ALL_STATE_NAMES.map((name) => ({
  id: name.toLowerCase().replace(/\s+/g, "-"),
  name,
  abbr: null,
  isFeatured: false,
  badge: null,
  description: null,
  pros: [],
  fee: null,
}));

const HARDCODED_FEATURED: StateOption[] = [
  { id: "delaware", name: "Delaware", abbr: "DE", isFeatured: true, badge: "Most Popular", description: "Home to 67% of Fortune 500 companies. Court of Chancery is highly business-friendly.", pros: ["No state corporate income tax for out-of-state operations", "Business-friendly Court of Chancery", "Flexible corporate laws"], fee: null },
  { id: "wyoming",  name: "Wyoming",  abbr: "WY", isFeatured: true, badge: "Best for LLCs", description: "Lowest fees, strong privacy, no state income tax. Great for small businesses.",         pros: ["No state income tax", "Strong LLC privacy protections", "Low annual fees (~$52/year)"],                                   fee: null },
  { id: "nevada",   name: "Nevada",   abbr: "NV", isFeatured: true, badge: null,            description: "No corporate or personal income tax. Minimal reporting requirements.",                  pros: ["No corporate income tax", "No franchise tax", "Strong asset protection laws"],                                           fee: null },
  { id: "florida",  name: "Florida",  abbr: "FL", isFeatured: true, badge: null,            description: "No personal income tax and a large talent pool. Good for physical businesses.",         pros: ["No personal income tax", "Growing tech ecosystem", "Competitive business costs"],                                        fee: null },
];

export default async function StateSelectionPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string; type?: string; plan?: string; billing?: string }>;
}) {
  const { country: countryParam, type, plan, billing } = await searchParams;
  const country = countryParam ?? "uk";

  const serviceCountry = await getServiceCountryByIso(country);

  let featuredStates: typeof HARDCODED_FEATURED;
  let allStates: StateOption[];

  if (serviceCountry && serviceCountry.states.length > 0) {
    featuredStates = serviceCountry.states
      .filter((s) => s.isFeatured)
      .map((s) => ({
        id: s.name.toLowerCase().replace(/\s+/g, "-"),
        name: s.name,
        abbr: s.abbr,
        isFeatured: s.isFeatured,
        badge: s.badge,
        description: s.description,
        pros: s.pros ? (JSON.parse(s.pros) as string[]) : [],
        fee: s.fee,
      }));

    allStates = serviceCountry.states
      .filter((s) => !s.isFeatured)
      .map((s) => ({
        id: s.name.toLowerCase().replace(/\s+/g, "-"),
        name: s.name,
        abbr: s.abbr,
        isFeatured: false,
        badge: null,
        description: s.description,
        pros: s.pros ? (JSON.parse(s.pros) as string[]) : [],
        fee: s.fee,
      }));
  } else if (country === "us") {
    featuredStates = HARDCODED_FEATURED;
    allStates      = HARDCODED_ALL_STATES;
  } else {
    featuredStates = [];
    allStates      = [];
  }

  // Skip this step entirely if the country has no states/regions configured
  if (featuredStates.length === 0 && allStates.length === 0) {
    const q = new URLSearchParams({ country, type: type ?? "llc", plan: plan ?? "starter", billing: billing ?? "monthly" });
    redirect(`/onboarding/company-info?${q.toString()}`);
  }

  const defaultSelected = featuredStates[0]?.id ?? "";

  return (
    <StateSelectionClient
      country={country}
      type={type ?? "llc"}
      plan={plan ?? "starter"}
      billing={billing ?? "monthly"}
      featuredStates={featuredStates}
      allStates={allStates}
      defaultSelected={defaultSelected}
    />
  );
}
