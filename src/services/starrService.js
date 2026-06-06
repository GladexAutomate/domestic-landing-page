// @ts-nocheck
/*
  starrService.js
  ───────────────
  Starr TraveLead Insurance API integration.
  API Kit: PH-APIKitv1.6_TraveLead-Intl&Domestic
  ©2025 Starr International Insurance (Asia) Ltd.

  ⚠️  SECURITY NOTE:
  The API key is used to generate an MD5 signature (X-Zxtx-Sign).
  For production, move policy issuance calls to a Supabase Edge Function
  so the key never appears in the browser bundle.
  This service works as-is for UAT testing.

  Available products (for Philippine domestic destinations):
  ┌────────────┬────────────────────────────────────┬────────┬────────────────────────┐
  │ Contract   │ Product                            │ PlanId │ Plan Name              │
  ├────────────┼────────────────────────────────────┼────────┼────────────────────────┤
  │ 147271 UAT │ TraveLead Domestic Travel Insurance│ 1086   │ Economy (Single Trip)  │
  │ 147271 UAT │ TraveLead Domestic Travel Insurance│ 1087   │ Elite (Single Trip)    │
  │ 147271 UAT │ TraveLead Domestic Travel Insurance│ 1088   │ Annual                 │
  │ 153123 PRD │ TraveLead Domestic Travel Insurance│ 1076   │ Economy (Single Trip)  │
  │ 153123 PRD │ TraveLead Domestic Travel Insurance│ 1077   │ Elite (Single Trip)    │
  │ 153123 PRD │ TraveLead Domestic Travel Insurance│ 1078   │ Annual                 │
  └────────────┴────────────────────────────────────┴────────┴────────────────────────┘
*/

import CryptoJS from "crypto-js";

// ── Environment config ────────────────────────────────────────────
const ENV = import.meta.env.VITE_STARR_ENV || "uat"; // "uat" | "prod"

const CONFIG = {
  uat: {
    baseUrl:    import.meta.env.VITE_STARR_UAT_BASE_URL  || "http://16489.phbeta.51zxtx.com",
    userId:     import.meta.env.VITE_STARR_UAT_USER_ID,   // required — set in .env.local
    key:        import.meta.env.VITE_STARR_UAT_KEY,        // required — set in .env.local
    // UAT domestic product IDs
    contracts: {
      domestic:     "147271",
      international: "147244",
    },
    plans: {
      domestic: {
        economy: "1086",
        elite:   "1087",
        annual:  "1088",
      },
      international: {
        essentialSingle: "1082",
        extraSingle:     "1083",
        essentialAnnual: "1084",
        extraAnnual:     "1085",
      },
    },
  },
  prod: {
    baseUrl:   import.meta.env.VITE_STARR_PROD_BASE_URL  || "https://17410.starrinsurance.com.ph",
    userId:    import.meta.env.VITE_STARR_PROD_USER_ID,   // required — set in .env.local
    key:       import.meta.env.VITE_STARR_PROD_KEY,        // required — set in .env.local (NEVER commit)
    contracts: {
      domestic:     "153123",
      international: "153124",
    },
    plans: {
      domestic: {
        economy: "1076",
        elite:   "1077",
        annual:  "1078",
      },
      international: {
        essentialSingle: "1072",
        extraSingle:     "1073",
        essentialAnnual: "1074",
        extraAnnual:     "1075",
      },
    },
  },
};

const cfg = CONFIG[ENV];

// ── Signature generation (MD5) ────────────────────────────────────
// X-Zxtx-Sign = MD5(url + postBody + key)
function buildSign(url, body) {
  const bodyStr = typeof body === "string" ? body : JSON.stringify(body);
  return CryptoJS.MD5(url + bodyStr + cfg.key).toString().toUpperCase();
}

// ── Edge function flag
const USE_EDGE = import.meta.env.VITE_USE_EDGE_FUNCTIONS === "true";

// ── Base request helper ───────────────────────────────────────────
async function starrRequest(endpoint, body) {
  // Production path: signing + key stay server-side in Supabase Edge Function
  if (USE_EDGE) {
    const { supabase } = await import("@/services/supabaseService");
    const { data, error } = await supabase.functions.invoke("starr-proxy", {
      body: { endpoint, body },
    });
    if (error) throw new Error(error.message);
    if (data?.success !== "1") throw new Error(`Starr error [${data?.code}]: ${data?.msg}`);
    return data.data;
  }

  // Dev/UAT path: direct API call (key in .env.local, not committed)
  const url = `${cfg.baseUrl}/${cfg.userId}/${endpoint}`;
  const bodyStr = JSON.stringify(body);
  const sign = buildSign(url, bodyStr);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Encoding": "UTF-8",
      "Accept-Language": "en",
      "X-Zxtx-Sign": sign,
    },
    body: bodyStr,
  });

  const json = await res.json();

  if (json.success !== "1") {
    throw new Error(`Starr API error [${json.code}]: ${json.msg}`);
  }

  return json.data;
}

// ── QUOTATION ─────────────────────────────────────────────────────
/*
  params: {
    contractId: string,
    planId: string,
    planOption: "Individual" | "Family",
    dateStart: "YYYY-MM-DD",
    dateEnd: "YYYY-MM-DD",
    unit: "day" | "year",
    numberOfAdults: string,
    numberOfChildren?: string,
    promotionCode?: string,
  }

  returns: {
    totalPremium, discountPremium, originalBasicPremium,
    discountedBasicPremium, optPremium, docStampTax,
    localGovTax, premiumTax
  }
*/
export const getQuotation = async (params) => {
  const body = {
    contractId:          params.contractId,
    planId:              params.planId,
    planOption:          params.planOption || "Individual",
    dateStart:           params.dateStart,
    dateEnd:             params.dateEnd,
    unit:                params.unit || "day",
    numberOfAdults:      String(params.numberOfAdults || "1"),
    numberOfChildren:    String(params.numberOfChildren || "0"),
    numberOfElder:       String(params.numberOfElder || "0"),
    numberOfSeniorCitizen: String(params.numberOfSeniorCitizen || "0"),
    promotionCode:       params.promotionCode || "",
    optionalBenefits:    params.optionalBenefits || ["Covid"],
  };

  return starrRequest("quotations", body);
};

// ── Convenience: get domestic quotation by plan name ─────────────
export const getDomesticQuote = (planName, dateStart, dateEnd, numAdults = 1, numChildren = 0) => {
  const planId = cfg.plans.domestic[planName] || cfg.plans.domestic.economy;
  return getQuotation({
    contractId: cfg.contracts.domestic,
    planId,
    dateStart,
    dateEnd,
    unit: "day",
    numberOfAdults: String(numAdults),
    numberOfChildren: String(numChildren),
    optionalBenefits: ["Covid"],
  });
};

// ── POLICY ISSUANCE ───────────────────────────────────────────────
/*
  params: full policy data per 2.4.4 in API Kit.
  The quotation result must be passed in (totalPremium etc.).

  Required traveler fields (in params.insured array):
  { title, firstName, lastName, idNoType, idNo, birth, relation }

  returns: policy data including masterPolicyNumber, cocNumber per insured
*/
export const issuePolicy = async (params) => {
  const body = {
    serialNo:              params.serialNo || `GDX-${Date.now()}`,
    paySerialNo:           params.paySerialNo || "",
    contractId:            params.contractId,
    planId:                params.planId,
    planOption:            params.planOption || "Individual",
    optionalBenefits:      params.optionalBenefits || ["Covid"],
    dateStart:             params.dateStart,
    dateEnd:               params.dateEnd,
    unit:                  params.unit || "day",
    totalPremium:          params.totalPremium,
    discountPremium:       params.discountPremium,
    originalBasicPremium:  params.originalBasicPremium,
    discountedBasicPremium: params.discountedBasicPremium,
    optPremium:            params.optPremium || 0,
    docStampTax:           params.docStampTax,
    localGovTax:           params.localGovTax,
    premiumTax:            params.premiumTax,
    promotionCode:         params.promotionCode || "",
    // Policyholder
    phTitle:               params.phTitle,
    phLastName:            params.phLastName,
    phFirstName:           params.phFirstName,
    phIdNoType:            params.phIdNoType || "Passport",
    phIdNo:                params.phIdNo,
    phBirth:               params.phBirth,
    phTel:                 params.phTel,
    phAddr:                params.phAddr,
    phCountry:             params.phCountry || "Philippines",
    phSex:                 params.phSex,
    phMail:                params.phMail,
    invoiceTag:            params.invoiceTag || 2,
    authPI:                "true",
    phPostCd:              params.phPostCd || "",
    remark:                params.remark || "",
    departure:             params.departure || "Philippines",
    destination:           params.destination || "Philippines",
    // AMLA fields (required)
    placeOfBirth:          params.placeOfBirth || "Philippines",
    citizenship:           params.citizenship || "Philippines",
    natureOfWork:          params.natureOfWork || "Other",
    nameOfEmployer:        params.nameOfEmployer || "N/A",
    sourceOfFunds:         params.sourceOfFunds || "Salary",
    // Emergency contact
    emergencyContactName:  params.emergencyContactName || "",
    emergencyContactNo:    params.emergencyContactNo || "",
    emergencyRelationship: params.emergencyRelationship || "",
    // Insured list
    insured:               params.insured || [],
  };

  return starrRequest("policies", body);
};

// ── Convenience: issue domestic policy ───────────────────────────
export const issueDomesticPolicy = async ({ planName = "economy", quote, policyholder, insured, destination = "Philippines" }) => {
  const planId = cfg.plans.domestic[planName] || cfg.plans.domestic.economy;
  return issuePolicy({
    contractId: cfg.contracts.domestic,
    planId,
    ...quote,
    ...policyholder,
    destination,
    insured,
    optionalBenefits: ["Covid"],
  });
};

// ── Export config for UI reference ───────────────────────────────
export const STARR_CONFIG = cfg;
export const STARR_ENV = ENV;
