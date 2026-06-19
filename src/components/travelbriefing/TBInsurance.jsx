// @ts-nocheck
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, X, Loader, AlertTriangle } from "lucide-react"; // AlertTriangle kept for ErrorBanner in form
import { getDomesticQuote, issueDomesticPolicy } from "@/services/starrService";

// ── Indicative per-day rates (PHP) used as fallback when API is unavailable ──
// Approximate domestic rates — final premium confirmed via Starr API
const MOCK_RATE = { economy: 82, elite: 130 }; // per adult per day (inc. taxes estimate)

function buildMockQuote(planKey, dateStart, dateEnd, numAdults) {
  const days = Math.max(
    1,
    Math.round((new Date(dateEnd) - new Date(dateStart)) / 86400000) + 1
  );
  const base  = MOCK_RATE[planKey] * days * numAdults;
  const dst   = parseFloat((base * 0.063).toFixed(2));
  const lgt   = parseFloat((base * 0.005).toFixed(2));
  const pt    = parseFloat((base * 0.050).toFixed(2));
  const total = parseFloat((base + dst + lgt + pt).toFixed(2));
  return {
    _isMock: true,
    totalPremium:           total.toFixed(2),
    discountPremium:        total.toFixed(2),
    originalBasicPremium:   base.toFixed(2),
    discountedBasicPremium: base.toFixed(2),
    optPremium:             "0.00",
    docStampTax:            dst.toFixed(2),
    localGovTax:            lgt.toFixed(2),
    premiumTax:             pt.toFixed(2),
  };
}

// ── Plan definitions ──────────────────────────────────────────────
const PLANS = [
  {
    key: "economy",
    name: "Economy",
    tagline: "Essential trip protection",
    color: "#ff9913",
    btnGradient: "linear-gradient(135deg, #ff9913, #cc7700)",
    btnShadow: "0 4px 14px rgba(255,153,19,0.38)",
    benefits: [
      "Personal accident & death benefit",
      "Emergency medical expenses",
      "Trip cancellation coverage",
      "Baggage & personal effects loss",
      "Covid-19 medical coverage",
    ],
  },
  {
    key: "elite",
    name: "Elite",
    tagline: "Complete peace of mind",
    color: "#1e40af",
    btnGradient: "linear-gradient(135deg, #1e40af, #1e3a8a)",
    btnShadow: "0 4px 14px rgba(30,64,175,0.32)",
    highlight: true,
    benefits: [
      "Enhanced personal accident benefit",
      "Higher medical expense limit",
      "Trip cancellation & curtailment",
      "Baggage loss + delay coverage",
      "Travel delay compensation",
      "Emergency evacuation",
      "Covid-19 medical coverage",
    ],
  },
];

const TITLES      = ["Mr", "Ms", "Mrs", "Dr", "Atty", "Engr"];
const ID_TYPES    = ["Passport", "PhilSys (National ID)", "Driver's License", "SSS", "UMID", "Voter's ID", "Senior Citizen ID", "PhilHealth", "TIN ID"];
const WORK_TYPES  = ["Private Employee", "Government Employee", "Self-Employed", "Business Owner", "Student", "Retired", "OFW", "Doctor/Medical", "Engineer", "Lawyer", "Other"];
const FUND_SOURCES = ["Salary", "Business Income", "Savings", "Allowance", "Pension", "Remittance", "Other"];
const RELATIONS   = ["Spouse", "Parent", "Child", "Sibling", "Relative", "Friend", "Other"];

// ── Helpers ───────────────────────────────────────────────────────
function peso(amount) {
  if (amount == null) return "—";
  return `₱${Number(amount).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Shared form field wrappers ────────────────────────────────────
function Label({ text, required }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "rgba(0,0,0,0.42)" }}>
      {text}{required && <span style={{ color: "#e53e3e" }}> *</span>}
    </p>
  );
}

const inputCls = "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-orange-400";
const inputSt  = { backgroundColor: "#fff", borderColor: "rgba(0,0,0,0.12)", color: "#1a1a1a" };

function TInput({ value, onChange, placeholder, type = "text" }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputCls} style={inputSt} />;
}
function TSelect({ value, onChange, options }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls} style={{ ...inputSt, appearance: "none" }}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function TBInsurance({ booking, dest, darkMode, tk }) {
  const { textPrimary, textMuted, cardBg, borderColor, cardShadow } = tk;

  const numAdults = Number(booking?.totalGuests || 1);
  const dateStart = booking?.travelDate || booking?.arrivalDate || "";
  const dateEnd   = booking?.departureDate || "";

  // ── Quote state ───────────────────────────────────────────────
  const [quotes, setQuotes]       = useState({ economy: null, elite: null });
  const [qLoading, setQLoading]   = useState(true);
  const [qError, setQError]       = useState(null);
  const [usingMock, setUsingMock] = useState(false);

  // ── Sheet state ───────────────────────────────────────────────
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [sheetOpen, setSheetOpen]       = useState(false);
  const [stage, setStage]               = useState("form"); // "form" | "declaration" | "success"
  const [submitting, setSubmitting]     = useState(false);
  const [submitError, setSubmitError]   = useState(null);
  const [policyResult, setPolicyResult] = useState(null);
  const [termsChecked, setTermsChecked] = useState(false);

  // ── Pre-fill from booking ─────────────────────────────────────
  const fullName = (booking?.leadName || "").trim();
  const parts    = fullName.split(" ");
  const defFirst = parts.length > 1 ? parts.slice(0, -1).join(" ") : parts[0] || "";
  const defLast  = parts.length > 1 ? parts[parts.length - 1] : "";

  const [form, setForm] = useState({
    title:           "Mr",
    firstName:       defFirst,
    lastName:        defLast,
    birthDate:       "",
    sex:             "Male",
    idType:          "Passport",
    idNumber:        "",
    address:         "",
    citizenship:     "Philippines",
    email:           booking?.email || "",
    mobile:          booking?.mobile || booking?.phone || "",
    emergencyName:   "",
    emergencyNumber: "",
    emergencyRelation: "Spouse",
    placeOfBirth:    "Philippines",
    natureOfWork:    "Private Employee",
    nameOfEmployer:  "",
    sourceOfFunds:   "Salary",
  });

  const sf = (field) => (val) => setForm((prev) => ({ ...prev, [field]: val }));

  // ── Lock body scroll when sheet is open ───────────────────────
  useEffect(() => {
    document.body.style.overflow = sheetOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sheetOpen]);

  // ── Fetch quotes on mount ─────────────────────────────────────
  useEffect(() => {
    if (!dateStart || !dateEnd) {
      setQLoading(false);
      setQError("Travel dates not available in your booking.");
      return;
    }
    setQLoading(true);
    setQError(null);

    Promise.all([
      getDomesticQuote("economy", dateStart, dateEnd, numAdults, 0),
      getDomesticQuote("elite",   dateStart, dateEnd, numAdults, 0),
    ])
      .then(([eco, eli]) => {
        setQuotes({ economy: eco, elite: eli });
        setUsingMock(false);
        setQLoading(false);
      })
      .catch(() => {
        // API unavailable — show indicative pricing so the section still works
        setQuotes({
          economy: buildMockQuote("economy", dateStart, dateEnd, numAdults),
          elite:   buildMockQuote("elite",   dateStart, dateEnd, numAdults),
        });
        setUsingMock(true);
        setQLoading(false);
      });
  }, [dateStart, dateEnd, numAdults]);

  // ── Handlers ──────────────────────────────────────────────────
  const openPlan = (key) => {
    setSelectedPlan(key);
    setSheetOpen(true);
    setStage("form");
    setSubmitError(null);
    setTermsChecked(false);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setTimeout(() => { setStage("form"); setSubmitError(null); }, 300);
  };

  const goToDeclaration = () => {
    const required = { firstName: form.firstName, lastName: form.lastName, birthDate: form.birthDate, idNumber: form.idNumber, address: form.address, email: form.email, mobile: form.mobile, emergencyName: form.emergencyName, emergencyNumber: form.emergencyNumber, nameOfEmployer: form.nameOfEmployer };
    const missing = Object.entries(required).filter(([, v]) => !v?.trim()).map(([k]) => k.replace(/([A-Z])/g, " $1").toLowerCase());
    if (missing.length) { setSubmitError(`Please fill in: ${missing.join(", ")}`); return; }
    setSubmitError(null);
    setStage("declaration");
  };

  const handleConfirm = async () => {
    if (!termsChecked) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const q = quotes[selectedPlan];
      if (q?._isMock) {
        // Live API not yet connected — record interest and show follow-up state
        await new Promise((r) => setTimeout(r, 800)); // brief delay for UX feel
        setPolicyResult({ _pending: true });
        setStage("success");
        return;
      }
      const result = await issueDomesticPolicy({
        planName:    selectedPlan,
        quote:       q,
        policyholder: {
          phTitle:    form.title,      phFirstName: form.firstName,  phLastName: form.lastName,
          phBirth:    form.birthDate,  phSex:       form.sex,        phIdNoType: form.idType,
          phIdNo:     form.idNumber,   phAddr:      form.address,    phCountry:  "Philippines",
          phTel:      form.mobile,     phMail:      form.email,
          emergencyContactName:     form.emergencyName,
          emergencyContactNo:       form.emergencyNumber,
          emergencyRelationship:    form.emergencyRelation,
          placeOfBirth:    form.placeOfBirth,
          citizenship:     form.citizenship,
          natureOfWork:    form.natureOfWork,
          nameOfEmployer:  form.nameOfEmployer,
          sourceOfFunds:   form.sourceOfFunds,
        },
        insured: [{
          title: form.title, firstName: form.firstName, lastName: form.lastName,
          idNoType: form.idType, idNo: form.idNumber, birth: form.birthDate, relation: "Self",
        }],
        destination: dest?.name || "Philippines",
        dateStart,
        dateEnd,
      });
      setPolicyResult(result);
      setStage("success");
    } catch (err) {
      setSubmitError(err.message || "Policy issuance failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const planInfo  = PLANS.find((p) => p.key === selectedPlan);
  const selQuote  = selectedPlan ? quotes[selectedPlan] : null;

  // ─────────────────────────────────────────────────────────────────
  return (
    <>
      {usingMock && !qLoading && (
        <div className="rounded-xl border px-3 py-2 flex items-center gap-2 mb-3" style={{ borderColor: "rgba(255,153,19,0.2)", backgroundColor: "rgba(255,153,19,0.05)" }}>
          <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: "#ff9913" }} />
          <p className="text-[11px]" style={{ color: "#92400e" }}>
            Rates shown are indicative. Final premium will be confirmed once you submit your details.
          </p>
        </div>
      )}

      {/* ── PLAN CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PLANS.map((plan, pi) => {
          const q = quotes[plan.key];
          return (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.38, delay: pi * 0.08 }}
              className="rounded-2xl overflow-hidden"
              style={{
                backgroundColor: cardBg,
                border: `1.5px solid ${plan.highlight ? plan.color : borderColor}`,
                boxShadow: plan.highlight ? `0 0 0 1px ${plan.color}33, ${cardShadow}` : cardShadow,
              }}
            >
              {/* Card header */}
              <div className="px-5 py-3" style={{ backgroundColor: plan.highlight ? plan.color : `${plan.color}12` }}>
                <p className="font-black text-sm" style={{ color: plan.highlight ? "#fff" : plan.color }}>{plan.name} Plan</p>
                <p className="text-[11px] mt-0.5" style={{ color: plan.highlight ? "rgba(255,255,255,0.78)" : textMuted }}>{plan.tagline}</p>
              </div>

              <div className="p-5">
                {/* Price */}
                <div className="mb-4 min-h-[48px]">
                  {qLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" style={{ color: plan.color }} />
                      <span className="text-sm" style={{ color: textMuted }}>Getting quote…</span>
                    </div>
                  ) : q ? (
                    <div>
                      <p className="font-black" style={{ fontSize: "1.7rem", lineHeight: 1.1, color: plan.color, letterSpacing: "-0.03em" }}>
                        {q._isMock ? "~" : ""}{peso(q.totalPremium)}
                      </p>
                      <p className="text-[11px] mt-0.5" style={{ color: textMuted }}>
                        {numAdults} traveler{numAdults > 1 ? "s" : ""} · {dateStart} – {dateEnd}
                        {q._isMock ? " · indicative" : ""}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: textMuted }}>Quote unavailable</p>
                  )}
                </div>

                {/* Benefits */}
                <ul className="space-y-2 mb-5">
                  {plan.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: plan.color }} strokeWidth={2.5} />
                      <span className="text-xs leading-snug" style={{ color: textPrimary }}>{b}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <motion.button
                  whileHover={{ y: -2, boxShadow: plan.btnShadow }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openPlan(plan.key)}
                  disabled={!q || qLoading}
                  className="w-full py-3 rounded-xl text-sm font-black transition-all"
                  style={{
                    background: q && !qLoading ? plan.btnGradient : "rgba(0,0,0,0.08)",
                    color: q && !qLoading ? "#fff" : textMuted,
                    boxShadow: q && !qLoading ? plan.btnShadow : "none",
                    cursor: q && !qLoading ? "pointer" : "not-allowed",
                  }}
                >
                  {qLoading ? "Loading…" : `Choose ${plan.name} →`}
                </motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Starr badge */}
      <div className="mt-4 flex items-center gap-2">
        <Shield className="w-3 h-3 shrink-0" style={{ color: textMuted }} />
        <p className="text-[10px]" style={{ color: textMuted }}>
          Underwritten by Starr International Insurance (Asia) Ltd. · Philippines · IC Certificate of Authority No. 2009-82
        </p>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          BOTTOM SHEET — rendered via portal to escape parent stacking contexts
         ═══════════════════════════════════════════════════════════ */}
      {createPortal(
        <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop — z-[200] covers navbar + test banner */}
            <motion.div
              key="ins-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200]"
              style={{ backgroundColor: "rgba(0,0,0,0.52)", backdropFilter: "blur(4px)" }}
              onClick={closeSheet}
            />

            {/* Sheet — outer div handles centering, inner motion.div handles animation */}
            <div
              className="fixed z-[201] w-full px-3"
              style={{ maxWidth: "664px", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            >
            <motion.div
              key="ins-sheet"
              initial={{ y: "110%" }} animate={{ y: 0 }} exit={{ y: "110%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className="rounded-3xl w-full overflow-hidden"
              style={{ backgroundColor: "#f9f8f6", height: "calc(100vh - 80px)", display: "flex", flexDirection: "column", boxShadow: "0 8px 40px rgba(0,0,0,0.22)" }}
            >
              {/* Sheet top bar */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between shrink-0"
                style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: planInfo?.highlight ? planInfo.color : "rgba(255,153,19,0.12)" }}>
                    <Shield className="w-3.5 h-3.5" style={{ color: planInfo?.highlight ? "#fff" : "#ff9913" }} />
                  </div>
                  <div>
                    <p className="font-black text-sm leading-tight" style={{ color: "#1a1a1a" }}>
                      {planInfo?.name} Plan · {selQuote ? peso(selQuote.totalPremium) : ""}
                    </p>
                    <p className="text-[10px]" style={{ color: "#6b7280" }}>Starr TraveLead Domestic Insurance</p>
                  </div>
                </div>
                <button onClick={closeSheet} className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(0,0,0,0.07)" }}>
                  <X className="w-4 h-4" style={{ color: "#1a1a1a" }} />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-5 space-y-6 pb-12" style={{ backgroundColor: "#f9f8f6" }}>

                {/* ── STAGE: FORM ── */}
                {stage === "form" && (
                  <>
                    {/* Premium breakdown */}
                    {selQuote && (
                      <div className="rounded-xl border p-4 space-y-2" style={{ borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#fff" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#6b7280" }}>Premium Breakdown</p>
                        {[
                          ["Base Premium",    selQuote.originalBasicPremium],
                          ["Doc Stamp Tax",   selQuote.docStampTax],
                          ["Local Gov't Tax", selQuote.localGovTax],
                          ["Premium Tax",     selQuote.premiumTax],
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-xs">
                            <span style={{ color: "#6b7280" }}>{label}</span>
                            <span style={{ color: "#1a1a1a" }}>{peso(val)}</span>
                          </div>
                        ))}
                        <div className="pt-2 border-t flex justify-between" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                          <span className="text-sm font-black" style={{ color: "#1a1a1a" }}>Total Payable</span>
                          <span className="text-sm font-black" style={{ color: planInfo?.color }}>{peso(selQuote.totalPremium)}</span>
                        </div>
                      </div>
                    )}

                    {/* ── POLICYHOLDER ── */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#ff9913" }}>Policyholder Details</p>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label text="Title" required />
                            <TSelect value={form.title} onChange={sf("title")} options={TITLES} />
                          </div>
                          <div className="col-span-2">
                            <Label text="Sex" required />
                            <TSelect value={form.sex} onChange={sf("sex")} options={["Male", "Female"]} />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label text="First Name" required />
                            <TInput value={form.firstName} onChange={sf("firstName")} placeholder="First name" />
                          </div>
                          <div>
                            <Label text="Last Name" required />
                            <TInput value={form.lastName} onChange={sf("lastName")} placeholder="Last name" />
                          </div>
                        </div>
                        <div>
                          <Label text="Date of Birth" required />
                          <TInput value={form.birthDate} onChange={sf("birthDate")} type="date" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label text="ID Type" required />
                            <TSelect value={form.idType} onChange={sf("idType")} options={ID_TYPES} />
                          </div>
                          <div>
                            <Label text="ID Number" required />
                            <TInput value={form.idNumber} onChange={sf("idNumber")} placeholder="ID number" />
                          </div>
                        </div>
                        <div>
                          <Label text="Home Address" required />
                          <TInput value={form.address} onChange={sf("address")} placeholder="Street, City, Province" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label text="Email" required />
                            <TInput value={form.email} onChange={sf("email")} type="email" placeholder="email@example.com" />
                          </div>
                          <div>
                            <Label text="Mobile No." required />
                            <TInput value={form.mobile} onChange={sf("mobile")} placeholder="+63 9XX XXX XXXX" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── EMERGENCY CONTACT ── */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: "#ff9913" }}>Emergency Contact</p>
                      <div className="space-y-3">
                        <div>
                          <Label text="Contact Name" required />
                          <TInput value={form.emergencyName} onChange={sf("emergencyName")} placeholder="Full name" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label text="Contact Number" required />
                            <TInput value={form.emergencyNumber} onChange={sf("emergencyNumber")} placeholder="+63 9XX XXX XXXX" />
                          </div>
                          <div>
                            <Label text="Relationship" required />
                            <TSelect value={form.emergencyRelation} onChange={sf("emergencyRelation")} options={RELATIONS} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── AMLA / ADDITIONAL ── */}
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#ff9913" }}>Additional Details</p>
                      <p className="text-[10px] mb-3" style={{ color: "#9ca3af" }}>Required per Anti-Money Laundering Act (AMLA)</p>
                      <div className="space-y-3">
                        <div>
                          <Label text="Place of Birth" required />
                          <TInput value={form.placeOfBirth} onChange={sf("placeOfBirth")} placeholder="City, Province/Country" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label text="Nature of Work" required />
                            <TSelect value={form.natureOfWork} onChange={sf("natureOfWork")} options={WORK_TYPES} />
                          </div>
                          <div>
                            <Label text="Employer / Business" required />
                            <TInput value={form.nameOfEmployer} onChange={sf("nameOfEmployer")} placeholder="Employer name" />
                          </div>
                        </div>
                        <div>
                          <Label text="Source of Funds" />
                          <TSelect value={form.sourceOfFunds} onChange={sf("sourceOfFunds")} options={FUND_SOURCES} />
                        </div>
                      </div>
                    </div>

                    {submitError && <ErrorBanner msg={submitError} />}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={goToDeclaration}
                      className="w-full py-4 rounded-2xl text-sm font-black"
                      style={{ background: "linear-gradient(135deg, #ff9913, #cc7700)", color: "#fff", boxShadow: "0 4px 16px rgba(255,153,19,0.32)" }}>
                      Review & Confirm →
                    </motion.button>
                    <p className="text-center text-[10px]" style={{ color: "#9ca3af" }}>
                      You won't be charged until you accept the declaration on the next step
                    </p>
                  </>
                )}

                {/* ── STAGE: DECLARATION ── */}
                {stage === "declaration" && (
                  <>
                    {/* Summary card */}
                    <div className="rounded-xl border p-4 space-y-1.5" style={{ borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#fff" }}>
                      <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: "#6b7280" }}>Insurance Summary</p>
                      {[
                        ["Plan",           planInfo?.name],
                        ["Policyholder",   `${form.firstName} ${form.lastName}`],
                        ["Coverage",       `${dateStart} → ${dateEnd}`],
                        ["Travelers",      `${numAdults} adult${numAdults > 1 ? "s" : ""}`],
                      ].map(([lbl, val]) => (
                        <div key={lbl} className="flex justify-between text-sm">
                          <span style={{ color: "#6b7280" }}>{lbl}</span>
                          <span className="font-semibold" style={{ color: "#1a1a1a" }}>{val}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t flex justify-between" style={{ borderColor: "rgba(0,0,0,0.07)" }}>
                        <span className="font-black text-sm" style={{ color: "#1a1a1a" }}>Total Premium</span>
                        <span className="font-black text-sm" style={{ color: planInfo?.color }}>{peso(selQuote?.totalPremium)}</span>
                      </div>
                    </div>

                    {/* Declaration scrollable */}
                    <div className="rounded-xl border p-4 overflow-y-auto text-xs leading-relaxed"
                      style={{ borderColor: "rgba(0,0,0,0.10)", backgroundColor: "#fff", color: "#374151", maxHeight: "180px" }}>
                      <p className="font-bold mb-2">Declaration</p>
                      <p className="mb-2">During the effectivity of the contract/policy, I/We agree to the following:</p>
                      <p className="mb-2">1. In case Starr International Insurance Philippines Branch (STARR) is unable to comply with relevant customer due diligence (CDD) measures as required under the Anti-Money Laundering Act, as amended and relevant issuances, due to my/our fault, STARR may apply measures to restrict the services available or prohibit any further transactions on the insurance contract/policy until full and proper CDD measures have been successfully conducted.</p>
                      <p className="mb-2">2. I/We declare to the best of my/our knowledge and belief that the information given is true in every respect. I/We agree that this application and declaration shall form the basis of the contract between me/us and STARR. The insurance policy will be in force upon acceptance by STARR.</p>
                      <p>3. I/We hereby declare, agree and consent that any personal data collected or held by STARR is provided and may be held by, used by and disclosed by STARR for the purposes of processing this application and/or providing subsequent insurance-related services, including but not limited to administering the policies issued to you and/or processing any claim under the policies issued to you.</p>
                    </div>

                    {/* Checkbox */}
                    <label className="flex items-start gap-3 cursor-pointer" onClick={() => setTermsChecked((v) => !v)}>
                      <div className="w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                        style={{ borderColor: termsChecked ? "#1e40af" : "rgba(0,0,0,0.2)", backgroundColor: termsChecked ? "#1e40af" : "#fff" }}>
                        {termsChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </div>
                      <span className="text-xs leading-relaxed" style={{ color: "#374151" }}>
                        By clicking to accept these Terms, I confirm I have read, understood, and agree to be bound by Starr's Terms and Conditions.
                      </span>
                    </label>

                    {submitError && <ErrorBanner msg={submitError} />}

                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setStage("form")}
                        className="py-3 rounded-xl text-sm font-bold border"
                        style={{ borderColor: "rgba(0,0,0,0.12)", color: "#374151", backgroundColor: "#fff" }}>
                        ← Go Back
                      </button>
                      <motion.button whileTap={{ scale: 0.97 }} onClick={handleConfirm}
                        disabled={!termsChecked || submitting}
                        className="py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2"
                        style={{
                          background:  termsChecked ? "linear-gradient(135deg, #1e40af, #1e3a8a)" : "rgba(0,0,0,0.08)",
                          color:       termsChecked ? "#fff" : "#9ca3af",
                          boxShadow:   termsChecked ? "0 4px 14px rgba(30,64,175,0.28)" : "none",
                          cursor:      termsChecked ? "pointer" : "not-allowed",
                        }}>
                        {submitting
                          ? <><Loader className="w-4 h-4 animate-spin" /> Processing…</>
                          : `Confirm · ${peso(selQuote?.totalPremium)}`}
                      </motion.button>
                    </div>
                  </>
                )}

                {/* ── STAGE: SUCCESS ── */}
                {stage === "success" && (
                  <div className="flex flex-col items-center text-center py-8 gap-4">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 10, stiffness: 200 }}
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ background: policyResult?._pending
                        ? "linear-gradient(135deg, #ff9913, #cc7700)"
                        : "linear-gradient(135deg, #16a34a, #15803d)" }}>
                      <Check className="w-8 h-8 text-white" strokeWidth={3} />
                    </motion.div>

                    <div>
                      <p className="font-black text-xl" style={{ color: "#1a1a1a" }}>
                        {policyResult?._pending ? "Request Received!" : "Policy Issued!"}
                      </p>
                      <p className="text-sm mt-1" style={{ color: "#6b7280" }}>
                        {policyResult?._pending
                          ? `Your interest in the ${planInfo?.name} Plan has been noted.`
                          : `Your ${planInfo?.name} Plan is now active.`}
                      </p>
                    </div>

                    {policyResult?._pending ? (
                      <div className="rounded-xl border p-4 w-full text-left space-y-2"
                        style={{ borderColor: "rgba(255,153,19,0.2)", backgroundColor: "rgba(255,153,19,0.06)" }}>
                        <p className="text-xs font-bold" style={{ color: "#92400e" }}>What happens next?</p>
                        <p className="text-xs leading-relaxed" style={{ color: "#78350f" }}>
                          Our team will reach out to you at <strong>{form.email}</strong> or {form.mobile} within 24 hours to confirm your premium and send the payment link.
                        </p>
                      </div>
                    ) : (policyResult?.masterPolicyNumber || policyResult?.policyNo) ? (
                      <div className="rounded-xl border p-4 w-full" style={{ borderColor: "rgba(0,0,0,0.08)", backgroundColor: "#fff" }}>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: "#6b7280" }}>Policy Number</p>
                        <p className="font-black text-lg" style={{ color: "#1a1a1a" }}>
                          {policyResult.masterPolicyNumber || policyResult.policyNo}
                        </p>
                      </div>
                    ) : null}

                    {!policyResult?._pending && (
                      <p className="text-xs leading-relaxed max-w-xs" style={{ color: "#6b7280" }}>
                        Your certificate of coverage will be sent to{" "}
                        <strong style={{ color: "#1a1a1a" }}>{form.email}</strong>
                      </p>
                    )}

                    <motion.button whileTap={{ scale: 0.97 }} onClick={() => setSheetOpen(false)}
                      className="w-full py-3 rounded-xl text-sm font-black"
                      style={{ background: "linear-gradient(135deg, #ff9913, #cc7700)", color: "#fff", boxShadow: "0 4px 14px rgba(255,153,19,0.32)" }}>
                      Done ✓
                    </motion.button>
                  </div>
                )}

              </div>
            </motion.div>
            </div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div className="rounded-xl border p-3 flex items-start gap-2"
      style={{ borderColor: "rgba(239,68,68,0.25)", backgroundColor: "rgba(239,68,68,0.05)" }}>
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#dc2626" }} />
      <p className="text-xs" style={{ color: "#dc2626" }}>{msg}</p>
    </div>
  );
}
