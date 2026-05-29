import { redirect } from "next/navigation";
import { getServiceCountryByIso } from "@/app/actions/admin-services";
import StateSelectionClient, { type StateOption } from "./StateSelectionClient";

const HARDCODED_ALL_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
  "Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
  "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
  "Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
  "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

const HARDCODED_FEATURED: StateOption[] = [
  {
    id: "delaware",
    name: "Delaware",
    abbr: "DE",
    isFeatured: true,
    badge: "Most Popular",
    description: "Home to 67% of Fortune 500 companies. Court of Chancery is highly business-friendly.",
    pros: ["No state corporate income tax for out-of-state operations", "Business-friendly Court of Chancery", "Flexible corporate laws"],
  },
  {
    id: "wyoming",
    name: "Wyoming",
    abbr: "WY",
    isFeatured: true,
    badge: "Best for LLCs",
    description: "Lowest fees, strong privacy, no state income tax. Great for small businesses.",
    pros: ["No state income tax", "Strong LLC privacy protections", "Low annual fees (~$52/year)"],
  },
  {
    id: "nevada",
    name: "Nevada",
    abbr: "NV",
    isFeatured: true,
    badge: null,
    description: "No corporate or personal income tax. Minimal reporting requirements.",
    pros: ["No corporate income tax", "No franchise tax", "Strong asset protection laws"],
  },
  {
    id: "florida",
    name: "Florida",
    abbr: "FL",
    isFeatured: true,
    badge: null,
    description: "No personal income tax and a large talent pool. Good for physical businesses.",
    pros: ["No personal income tax", "Growing tech ecosystem", "Competitive business costs"],
  },
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
  let allStateNames: string[];

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
      }));

    allStateNames = serviceCountry.states
      .filter((s) => !s.isFeatured)
      .map((s) => s.name);
  } else if (country === "us") {
    featuredStates = HARDCODED_FEATURED;
    allStateNames  = HARDCODED_ALL_STATES;
  } else {
    featuredStates = [];
    allStateNames  = [];
  }

  // Skip this step entirely if the country has no states/regions configured
  if (featuredStates.length === 0 && allStateNames.length === 0) {
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
      allStateNames={allStateNames}
      defaultSelected={defaultSelected}
    />
  );
}
