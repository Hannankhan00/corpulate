import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

// ── Admin ─────────────────────────────────────────────────────

async function seedAdmin() {
  const passwordHash = await bcrypt.hash("qwerty1234", 12);
  await prisma.adminUser.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@gmail.com",
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("✓ Admin seeded");
}

// ── Service Countries ─────────────────────────────────────────

async function seedServiceCountries() {
  // ── United Kingdom ──────────────────────────────────────────
  const uk = await prisma.serviceCountry.upsert({
    where: { isoCode: "GB" },
    update: { name: "United Kingdom", isActive: true },
    create: { name: "United Kingdom", isoCode: "GB", isActive: true },
  });

  // UK has no states — companies register through a single national body (Companies House)
  await prisma.serviceCountryState.deleteMany({ where: { countryId: uk.id } });

  await deleteAndCreateDocs(uk.id, [
    {
      name: "Government-Issued Photo ID",
      description: "Valid passport, UK/EEA photocard driving licence, or national identity card",
      isRequired: true,
    },
    {
      name: "Proof of Address",
      description: "Utility bill, bank statement, or credit card statement dated within the last 3 months",
      isRequired: true,
    },
    {
      name: "Selfie / Identity Verification",
      description: "A clear selfie or digital identity check (mandatory since 2024 for Companies House filings)",
      isRequired: true,
    },
    {
      name: "National Insurance Number (NINO)",
      description: "Required if the director will pay themselves through PAYE. Format: AB123456C",
      isRequired: false,
    },
  ]);

  await setFields(uk.id, [
    { fieldKey: "DATE_OF_BIRTH",   isRequired: true  },
    { fieldKey: "FATHER_NAME",     isRequired: true  },
    { fieldKey: "MOTHER_NAME",     isRequired: true  },
    { fieldKey: "ADDRESS",         isRequired: true  },
    { fieldKey: "PASSPORT_NUMBER", isRequired: true  },
    { fieldKey: "NATIONAL_ID",     isRequired: false },
    { fieldKey: "TAX_ID",          isRequired: false },
  ]);

  console.log("✓ UK seeded");

  // ── United States ───────────────────────────────────────────
  const us = await prisma.serviceCountry.upsert({
    where: { isoCode: "US" },
    update: { name: "United States", isActive: true },
    create: { name: "United States", isoCode: "US", isActive: true },
  });

  await prisma.serviceCountryState.deleteMany({ where: { countryId: us.id } });

  const usStates = [
    // Featured
    {
      name: "Delaware",
      abbr: "DE",
      isFeatured: true,
      badge: "Most Popular",
      description: "Home to 67% of Fortune 500 companies. The Court of Chancery is the gold standard for business dispute resolution.",
      pros: JSON.stringify(["No state income tax for out-of-state businesses", "Business-friendly Court of Chancery", "Highly flexible corporate laws", "Strong investor recognition"]),
      sortOrder: 1,
    },
    {
      name: "Wyoming",
      abbr: "WY",
      isFeatured: true,
      badge: "Best for LLCs",
      description: "Lowest fees, strongest privacy laws, and no state income tax. The top choice for small businesses and non-US residents.",
      pros: JSON.stringify(["No state income tax", "Strong LLC privacy — member names kept off public records", "Low annual fees (~$60/year)", "Strong asset protection"]),
      sortOrder: 2,
    },
    {
      name: "Nevada",
      abbr: "NV",
      isFeatured: true,
      badge: "Strong Privacy",
      description: "No corporate or personal income tax with minimal reporting requirements and strong asset protection laws.",
      pros: JSON.stringify(["No corporate income tax", "No franchise tax", "Strong asset protection laws", "High privacy"]),
      sortOrder: 3,
    },
    {
      name: "Florida",
      abbr: "FL",
      isFeatured: true,
      badge: null,
      description: "No personal income tax and a large talent pool. Great for businesses with physical presence in the US.",
      pros: JSON.stringify(["No personal income tax", "Growing tech and business ecosystem", "Competitive operating costs"]),
      sortOrder: 4,
    },
    // All other states
    ...["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
        "Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky",
        "Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi",
        "Missouri","Montana","Nebraska","New Hampshire","New Jersey","New Mexico",
        "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
        "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
        "Virginia","Washington","West Virginia","Wisconsin"].map((name, i) => ({
      name,
      abbr: null,
      isFeatured: false,
      badge: null,
      description: null,
      pros: null,
      sortOrder: 100 + i,
    })),
  ];

  for (const s of usStates) {
    await prisma.serviceCountryState.create({ data: { countryId: us.id, ...s } });
  }

  await deleteAndCreateDocs(us.id, [
    {
      name: "Government-Issued Photo ID",
      description: "Valid passport or driver's license. Foreign nationals should use their passport.",
      isRequired: true,
    },
    {
      name: "Proof of Address",
      description: "For non-US residents: utility bill, bank statement, or official document showing residential address, dated within 3 months",
      isRequired: true,
    },
    {
      name: "EIN Application (Form SS-4)",
      description: "Employer Identification Number from the IRS. Required for banking and tax purposes. We assist with this.",
      isRequired: false,
    },
  ]);

  await setFields(us.id, [
    { fieldKey: "DATE_OF_BIRTH",   isRequired: true  },
    { fieldKey: "FATHER_NAME",     isRequired: true  },
    { fieldKey: "MOTHER_NAME",     isRequired: true  },
    { fieldKey: "ADDRESS",         isRequired: true  },
    { fieldKey: "PASSPORT_NUMBER", isRequired: true  },
    { fieldKey: "SSN",             isRequired: false },
    { fieldKey: "TAX_ID",          isRequired: false },
  ]);

  console.log("✓ US seeded");

  // ── United Arab Emirates ────────────────────────────────────
  const ae = await prisma.serviceCountry.upsert({
    where: { isoCode: "AE" },
    update: { name: "United Arab Emirates", isActive: true },
    create: { name: "United Arab Emirates", isoCode: "AE", isActive: true },
  });

  await prisma.serviceCountryState.deleteMany({ where: { countryId: ae.id } });

  const aeZones = [
    {
      name: "DMCC Free Zone",
      abbr: "DMCC",
      isFeatured: true,
      badge: "Most Popular",
      description: "Dubai Multi Commodities Centre — the world's top-ranked free zone. Ideal for trading, commodities, and services companies.",
      pros: JSON.stringify(["100% foreign ownership", "0% corporate and personal income tax", "Fast setup (1–3 days)", "World's #1 ranked free zone"]),
      sortOrder: 1,
    },
    {
      name: "Meydan Free Zone",
      abbr: "MFZ",
      isFeatured: true,
      badge: "Best Value",
      description: "One of the most affordable free zones in Dubai with fast incorporation. Suited for e-commerce, consulting, and digital businesses.",
      pros: JSON.stringify(["Lowest cost setup in Dubai", "100% foreign ownership", "No physical office required", "Instant licence issuance"]),
      sortOrder: 2,
    },
    {
      name: "JAFZA Free Zone",
      abbr: "JAFZA",
      isFeatured: true,
      badge: "Trade & Logistics",
      description: "Jebel Ali Free Zone — the largest free zone in the UAE, adjacent to the world's 9th largest port. Best for logistics and import/export.",
      pros: JSON.stringify(["Adjacent to Jebel Ali Port", "Massive logistics infrastructure", "100% foreign ownership", "No import/export duties"]),
      sortOrder: 3,
    },
    {
      name: "Dubai South Free Zone",
      abbr: "DXB South",
      isFeatured: true,
      badge: null,
      description: "Located next to Al Maktoum International Airport. Excellent for aviation, logistics, and light manufacturing businesses.",
      pros: JSON.stringify(["Airport proximity", "100% foreign ownership", "Competitive setup costs", "Strategic location"]),
      sortOrder: 4,
    },
    {
      name: "Dubai Mainland",
      abbr: null,
      isFeatured: false,
      badge: null,
      description: "Allows trading anywhere in the UAE and with government entities. Requires a physical office of minimum 200 sq ft.",
      pros: null,
      sortOrder: 5,
    },
    {
      name: "Abu Dhabi Free Zone (ADAFZ)",
      abbr: "ADAFZ",
      isFeatured: false,
      badge: null,
      description: null,
      pros: null,
      sortOrder: 6,
    },
    {
      name: "RAK Free Zone",
      abbr: "RAKEZ",
      isFeatured: false,
      badge: null,
      description: "Ras Al Khaimah Economic Zone — one of the most affordable free zones. Good for manufacturing and trading.",
      pros: null,
      sortOrder: 7,
    },
  ];

  for (const z of aeZones) {
    await prisma.serviceCountryState.create({ data: { countryId: ae.id, ...z } });
  }

  await deleteAndCreateDocs(ae.id, [
    {
      name: "Passport Copy (Colored)",
      description: "Clear color scan of all pages of your valid passport. Must be valid for at least 6 months.",
      isRequired: true,
    },
    {
      name: "UAE Entry Stamp or Visa Copy",
      description: "Proof that you have visited the UAE at least once. Entry stamp page from passport or UAE visa copy.",
      isRequired: true,
    },
    {
      name: "Proof of Residence",
      description: "Utility bill, bank statement, or official address letter from your home country, dated within 3 months",
      isRequired: true,
    },
    {
      name: "Passport-Size Photograph",
      description: "Recent passport-size photo with white background",
      isRequired: true,
    },
    {
      name: "Emirates ID",
      description: "Required only if you are a UAE resident. Both sides of the Emirates ID card.",
      isRequired: false,
    },
    {
      name: "Specimen Signature (Notarized)",
      description: "A notarized copy of your signature, required by most free zones for the Memorandum of Association",
      isRequired: false,
    },
  ]);

  await setFields(ae.id, [
    { fieldKey: "DATE_OF_BIRTH",   isRequired: true  },
    { fieldKey: "FATHER_NAME",     isRequired: true  },
    { fieldKey: "MOTHER_NAME",     isRequired: true  },
    { fieldKey: "ADDRESS",         isRequired: true  },
    { fieldKey: "PASSPORT_NUMBER", isRequired: true  },
    { fieldKey: "NATIONAL_ID",     isRequired: false },
  ]);

  console.log("✓ UAE seeded");

  // ── Canada ──────────────────────────────────────────────────
  const ca = await prisma.serviceCountry.upsert({
    where: { isoCode: "CA" },
    update: { name: "Canada", isActive: true },
    create: { name: "Canada", isoCode: "CA", isActive: true },
  });

  await prisma.serviceCountryState.deleteMany({ where: { countryId: ca.id } });

  const caProvinces = [
    {
      name: "Ontario",
      abbr: "ON",
      isFeatured: true,
      badge: "Most Popular",
      description: "Canada's largest business hub. Home to Toronto's financial district. No director residency requirement.",
      pros: JSON.stringify(["No director residency required", "Large business ecosystem", "NUANS name search", "Fast electronic filing"]),
      sortOrder: 1,
    },
    {
      name: "British Columbia",
      abbr: "BC",
      isFeatured: true,
      badge: "Tech Hub",
      description: "Home to Vancouver, a growing tech and startup hub. No director residency requirement and straightforward filing.",
      pros: JSON.stringify(["No director residency required", "Strong tech startup ecosystem", "Free public registry search", "Clean regulatory environment"]),
      sortOrder: 2,
    },
    {
      name: "Alberta",
      abbr: "AB",
      isFeatured: true,
      badge: "Energy Sector",
      description: "No provincial sales tax and a strong economy driven by energy, agriculture, and technology.",
      pros: JSON.stringify(["No provincial sales tax (PST)", "Low corporate tax rate", "Strong economy", "Pro-business government"]),
      sortOrder: 3,
    },
    {
      name: "Quebec",
      abbr: "QC",
      isFeatured: true,
      badge: null,
      description: "Largest French-speaking province. Requires a French corporate name. Access to the Quebec market of 8M people.",
      pros: JSON.stringify(["Access to French-speaking market", "Strong arts, tech, and gaming industries", "Generous R&D tax credits"]),
      sortOrder: 4,
    },
    {
      name: "Manitoba",
      abbr: "MB",
      isFeatured: false,
      badge: null,
      description: null,
      pros: null,
      sortOrder: 5,
    },
    {
      name: "Saskatchewan",
      abbr: "SK",
      isFeatured: false,
      badge: null,
      description: null,
      pros: null,
      sortOrder: 6,
    },
    {
      name: "Nova Scotia",
      abbr: "NS",
      isFeatured: false,
      badge: null,
      description: null,
      pros: null,
      sortOrder: 7,
    },
    {
      name: "Federal (Canada-wide)",
      abbr: "FED",
      isFeatured: false,
      badge: null,
      description: "Federal incorporation lets you operate under your corporate name across all provinces and territories.",
      pros: null,
      sortOrder: 8,
    },
  ];

  for (const p of caProvinces) {
    await prisma.serviceCountryState.create({ data: { countryId: ca.id, ...p } });
  }

  await deleteAndCreateDocs(ca.id, [
    {
      name: "Certified Passport Copy",
      description: "Notarized or certified copy of your valid passport (all photo and signature pages)",
      isRequired: true,
    },
    {
      name: "Proof of Address",
      description: "Bank statement, utility bill, or government-issued document showing residential address, dated within 3 months",
      isRequired: true,
    },
    {
      name: "NUANS Name Search Report",
      description: "Required for federal and Ontario incorporation to confirm your company name is available. Valid for 90 days.",
      isRequired: true,
    },
    {
      name: "CV / Resume",
      description: "Required for Quebec incorporation only — background of directors and shareholders",
      isRequired: false,
    },
    {
      name: "Last 3 Months Bank Statements",
      description: "Required for Quebec incorporation to demonstrate financial standing",
      isRequired: false,
    },
  ]);

  await setFields(ca.id, [
    { fieldKey: "DATE_OF_BIRTH",   isRequired: true  },
    { fieldKey: "FATHER_NAME",     isRequired: true  },
    { fieldKey: "MOTHER_NAME",     isRequired: true  },
    { fieldKey: "ADDRESS",         isRequired: true  },
    { fieldKey: "PASSPORT_NUMBER", isRequired: true  },
    { fieldKey: "TAX_ID",          isRequired: false },
  ]);

  console.log("✓ Canada seeded");
}

// ── Helpers ───────────────────────────────────────────────────

async function deleteAndCreateDocs(
  countryId: string,
  docs: { name: string; description: string; isRequired: boolean }[],
) {
  await prisma.serviceCountryDoc.deleteMany({ where: { countryId } });
  for (const d of docs) {
    await prisma.serviceCountryDoc.create({ data: { countryId, ...d } });
  }
}

type FieldKey =
  | "DATE_OF_BIRTH"
  | "FATHER_NAME"
  | "MOTHER_NAME"
  | "ADDRESS"
  | "PASSPORT_NUMBER"
  | "NATIONAL_ID"
  | "SSN"
  | "TAX_ID";

async function setFields(
  countryId: string,
  fields: { fieldKey: FieldKey; isRequired: boolean }[],
) {
  await prisma.serviceCountryField.deleteMany({ where: { countryId } });
  for (const f of fields) {
    await prisma.serviceCountryField.create({ data: { countryId, ...f } });
  }
}

// ── Entry point ───────────────────────────────────────────────

async function main() {
  await seedAdmin();
  await seedServiceCountries();
  console.log("\nAll done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
