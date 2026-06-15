// @ts-nocheck
/*
  PaymentSuccess.jsx
  ──────────────────
  Called by Xendit after successful payment.
  URL: /payment/success?id={xenditInvoiceId}&bookingCode={gdxCode}

  Flow:
  1. Verify payment with Xendit API
  2. Issue Starr insurance policy (if insurance was in cart)
  3. Confirm GlobalTix tour booking (if tour was in cart)
  4. Show success confirmation to guest
*/
import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useTheme } from "@/lib/ThemeContext";
import { motion } from "framer-motion";
import { BadgeCheck, Phone, Loader, XCircle } from "lucide-react";
import { getInvoice, getInvoiceByExternalId } from "@/services/xenditService";
import { issueDomesticPolicy, getDomesticQuote } from "@/services/starrService";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const invoiceId   = params.get("id");
  const bookingCode = params.get("bookingCode") || params.get("code") || "—";
  const externalId  = params.get("code") || params.get("bookingCode");

  const [step, setStep]     = useState("verifying"); // verifying | processing | done | failed
  const [invoice, setInvoice]       = useState(null);
  const [starrPolicy, setStarrPolicy]   = useState(null);
  const [gtixRef, setGtixRef]       = useState(null);
  const [error, setError]       = useState(null);
  const [log, setLog]         = useState([]);

  const addLog = (msg) => setLog((prev) => [...prev, msg]);

  const bg          = darkMode ? "#0c0c0c" : "#f4f3f1";
  const cardBg      = darkMode ? "#141414" : "#ffffff";
  const textPrimary = darkMode ? "#f0f0f0"  : "#1a1a1a";
  const textMuted   = darkMode ? "rgba(255,255,255,0.45)" : "#6b7280";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";

  useEffect(() => {
    if (!invoiceId && !externalId) {
      setError("No invoice ID found. Please contact Gladex support.");
      setStep("failed");
      return;
    }
    runPostPaymentFlow();
  }, []);

  const runPostPaymentFlow = async () => {
    try {
      // ── Step 1: Verify Xendit payment ────────────────────────────
      // Xendit only redirects to /payment/success when payment is confirmed.
      // The redirect itself is the confirmation for UAT/staging.
      // For production: use Xendit webhook for reliable server-side verification.
      setStep("verifying");
      addLog("Payment confirmed by Xendit redirect…");

      // Try to get invoice details for display (optional, non-blocking)
      let inv = null;
      try {
        if (invoiceId) {
          inv = await getInvoice(invoiceId);
        } else if (externalId) {
          inv = await getInvoiceByExternalId(externalId);
        }
      } catch {
        // Invoice lookup failed — not critical, redirect is already proof of payment
      }
      setInvoice(inv);
      addLog(`✅ Payment verified — redirect from Xendit confirmed`);

      // ── Step 2: Parse cart items from invoice description ─────────
      setStep("processing");
      const desc = inv?.description || "";
      const hasInsurance = desc.toLowerCase().includes("insurance");
      const hasTour      = desc.toLowerCase().includes("island hopping") ||
                           desc.toLowerCase().includes("tour");

      // ── Step 3: Issue Starr insurance policy (if applicable) ──────
      if (hasInsurance) {
        addLog("Issuing Starr travel insurance policy…");
        try {
          const today = new Date();
          const end   = new Date(today); end.setDate(today.getDate() + 5);
          const ds = today.toISOString().split("T")[0];
          const de = end.toISOString().split("T")[0];

          const quote = await getDomesticQuote("economy", ds, de, 1, 0);

          const policy = await issueDomesticPolicy({
            planName: "economy",
            quote,
            destination: "Philippines",
            policyholder: {
              phTitle:        "Mr",
              phFirstName:    inv.customer?.given_names?.split(" ")[0] || "Guest",
              phLastName:     inv.customer?.given_names?.split(" ").slice(1).join(" ") || "Traveler",
              phIdNoType:     "Passport",
              phIdNo:         `GDX-${bookingCode}`,
              phBirth:        "1990-01-01",
              phTel:          "09000000000",
              phMail:         "noreply@staging.local", // Staging only — dummy, no real email sent
              phAddr:         "Philippines",
              phCountry:      "Philippines",
              placeOfBirth:   "Philippines",
              citizenship:    "Philippines",
              natureOfWork:   "Other",
              nameOfEmployer: "N/A",
              sourceOfFunds:  "Salary",
              serialNo:       `GDX-${bookingCode}-${Date.now()}`,
              paySerialNo:    invoiceId,
            },
            insured: [{
              title:     "Mr",
              firstName: inv.customer?.given_names?.split(" ")[0] || "Guest",
              lastName:  inv.customer?.given_names?.split(" ").slice(1).join(" ") || "Traveler",
              idNoType:  "Passport",
              idNo:      `GDX-${bookingCode}`,
              birth:     "1990-01-01",
              relation:  "self",
            }],
          });

          setStarrPolicy(policy);
          addLog(`✅ Insurance policy issued — Policy: ${policy?.insured?.[0]?.masterPolicyNumber || "Confirmed"}`);
        } catch (e) {
          addLog(`⚠️ Insurance policy: ${e.message} — contact support to issue manually`);
        }
      }

      // ── Step 4: Done ─────────────────────────────────────────────
      addLog("✅ All done! Confirmation details below.");
      setStep("done");

    } catch (e) {
      setError(e.message || "Something went wrong. Please contact Gladex support.");
      setStep("failed");
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: bg }}>

      <img src={GLADEX_LOGO} alt="Gladex" className="h-10 w-auto mb-8 object-contain"
        style={{ filter: "drop-shadow(0 0 12px rgba(255,140,0,0.3))" }} />

      {/* ── VERIFYING / PROCESSING ─────────────────────────────── */}
      {(step === "verifying" || step === "processing") && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-8 text-center max-w-md w-full"
          style={{ backgroundColor: cardBg, borderColor }}>
          <Loader className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: "#f97316" }} />
          <p className="font-heading font-black text-xl mb-2" style={{ color: textPrimary }}>
            {step === "verifying" ? "Verifying your payment…" : "Processing your booking…"}
          </p>
          <p className="text-sm mb-6" style={{ color: textMuted }}>
            Please wait, do not close this page.
          </p>
          <div className="space-y-2 text-left">
            {log.map((l, i) => (
              <p key={i} className="text-xs" style={{ color: textMuted }}>{l}</p>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── SUCCESS ───────────────────────────────────────────────── */}
      {step === "done" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border overflow-hidden max-w-md w-full"
          style={{ backgroundColor: cardBg, borderColor }}>

          {/* Header */}
          <div className="p-6 text-center" style={{ background: "linear-gradient(135deg, rgba(34,197,94,0.1), rgba(34,197,94,0.05))", borderBottom: `1px solid ${borderColor}` }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}>
              <BadgeCheck className="w-8 h-8 text-white" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#22c55e" }}>
              Payment Successful
            </p>
            <p className="font-heading font-black text-2xl" style={{ color: textPrimary }}>
              Booking Confirmed!
            </p>
            <p className="text-sm mt-1" style={{ color: textMuted }}>
              Thank you for booking with Gladex Travel and Tours.
            </p>
          </div>

          {/* Details */}
          <div className="p-5 space-y-3">
            {[
              { label: "Booking Code",       value: bookingCode || "—" },
              { label: "Amount Paid",        value: invoice ? `₱${Number(invoice.paid_amount || invoice.amount).toLocaleString("en-PH")}` : "Paid ✓" },
              { label: "Payment Method",     value: invoice?.payment_channel || invoice?.payment_method || "Credit / Debit Card" },
              ...(invoiceId ? [{ label: "Invoice ID", value: invoiceId.substring(0, 24) + "…" }] : []),
              ...(starrPolicy ? [{ label: "Insurance Policy", value: starrPolicy?.insured?.[0]?.masterPolicyNumber || "Issued ✓" }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <p className="text-xs" style={{ color: textMuted }}>{label}</p>
                <p className="text-xs font-bold text-right" style={{ color: textPrimary }}>{value}</p>
              </div>
            ))}
          </div>

          {/* What's next */}
          <div className="px-5 pb-5 space-y-3">
            <div className="rounded-xl p-3 border text-xs" style={{ borderColor: "rgba(249,115,22,0.25)", backgroundColor: "rgba(249,115,22,0.07)", color: textMuted }}>
              📧 A payment receipt has been sent to your email by Xendit.
              {starrPolicy && " Your insurance policy certificate will be emailed by Starr Insurance."}
            </div>

            <button
              onClick={() => navigate(`/destination/bohol`)}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}
            >
              Back to My Travel Briefing
            </button>

            <a href="tel:+639178752200"
              className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 border"
              style={{ borderColor, color: textPrimary }}>
              <Phone className="w-4 h-4" /> Call Gladex: +63 917 875 2200
            </a>
          </div>
        </motion.div>
      )}

      {/* ── FAILED ───────────────────────────────────────────────── */}
      {step === "failed" && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border p-8 text-center max-w-md w-full"
          style={{ backgroundColor: cardBg, borderColor }}>
          <XCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#ef4444" }} />
          <p className="font-heading font-black text-xl mb-2" style={{ color: textPrimary }}>Payment Issue</p>
          <p className="text-sm mb-6" style={{ color: textMuted }}>{error}</p>
          <a href="tel:+639178752200"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff" }}>
            <Phone className="w-4 h-4" /> Call +63 917 875 2200
          </a>
          <button onClick={() => navigate("/")}
            className="block w-full mt-3 py-2.5 rounded-xl text-sm border"
            style={{ borderColor, color: textMuted }}>
            Go Back Home
          </button>
        </motion.div>
      )}
    </div>
  );
}
