// @ts-nocheck
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader, AlertTriangle, Check, Users } from "lucide-react";
import { createInvoice } from "@/services/xenditService";

export default function TBAddOnsCheckout({ isOpen, onClose, addOnsCart, booking, slug, darkMode, tk }) {
  const { cardBg, borderColor, textPrimary, textMuted, surfaceBg } = tk;

  const totalGuests = booking?.totalGuests || 1;
  const gdx         = booking?.gdx || null;

  const [name,    setName]    = useState(booking?.leadName || "");
  const [email,   setEmail]   = useState(booking?.email   || "");
  const [guests,  setGuests]  = useState(totalGuests);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Sync fields when booking loads in
  useEffect(() => {
    if (booking?.leadName && !name) setName(booking.leadName);
    if (booking?.email    && !email) setEmail(booking.email);
    setGuests(booking?.totalGuests || 1);
  }, [booking]);

  // Reset error when re-opened
  useEffect(() => {
    if (isOpen) setError(null);
  }, [isOpen]);

  // Group items by day for display
  const byDay = Object.values(
    addOnsCart.reduce((acc, item) => {
      if (!acc[item.day]) acc[item.day] = { day: item.day, dayTitle: item.dayTitle, items: [] };
      acc[item.day].items.push(item);
      return acc;
    }, {})
  ).sort((a, b) => a.day - b.day);

  const totalAmount = addOnsCart.reduce((sum, item) => sum + (item.price * guests), 0);

  const handlePay = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (guests < 1)   { setError("Number of guests must be at least 1."); return; }
    setLoading(true);
    setError(null);

    try {
      const externalId = `${gdx || slug?.toUpperCase() || "GLADEX"}-ADDONS-${Date.now()}`;
      const items = addOnsCart.map((item) => ({
        name:     `Day ${item.day} · ${item.name}`,
        quantity: guests,
        price:    item.price,
      }));

      const invoice = await createInvoice({
        externalId,
        amount:      totalAmount,
        description: `Gladex Optional Add-Ons${gdx ? ` — GDX-${gdx}` : ""}`,
        payerName:   name.trim(),
        payerEmail:  email.trim() || undefined,
        items,
        successRedirectUrl: `${window.location.origin}/payment/success?bookingCode=${encodeURIComponent(externalId)}&type=addons`,
        failureRedirectUrl: `${window.location.origin}/payment/failed?bookingCode=${encodeURIComponent(externalId)}`,
      });

      if (invoice?.invoice_url) {
        window.location.href = invoice.invoice_url;
      } else {
        throw new Error("No payment URL returned from Xendit.");
      }
    } catch (err) {
      setError(err?.message || "Could not create payment link. Please try again.");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={onClose}
          />

          {/* Sheet — slides up from bottom */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl overflow-hidden flex flex-col"
            style={{
              backgroundColor: cardBg,
              maxHeight: "90dvh",
              boxShadow: "0 -8px 40px rgba(0,0,0,0.35)",
            }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full" style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 shrink-0"
              style={{ borderBottom: `1px solid ${borderColor}` }}>
              <div>
                <p className="font-black text-lg" style={{ color: textPrimary }}>Book Your Add-Ons</p>
                <p className="text-xs" style={{ color: textMuted }}>
                  {addOnsCart.length} activit{addOnsCart.length === 1 ? "y" : "ies"} selected
                </p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
                <X className="w-4 h-4" style={{ color: textMuted }} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* Per-day breakdown */}
              {byDay.map(({ day, dayTitle, items }) => (
                <div key={day}>
                  {/* Day label */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full"
                      style={{ background: "#f97316", color: "#fff" }}>
                      Day {day}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: textMuted }}>{dayTitle}</span>
                  </div>

                  {/* Items under this day */}
                  <div className="space-y-2 pl-1">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5"
                        style={{ backgroundColor: surfaceBg, border: `1px solid ${borderColor}` }}>
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: textPrimary }}>{item.name}</p>
                            <p className="text-[11px]" style={{ color: textMuted }}>
                              ₱{Number(item.price).toLocaleString("en-PH")} × {guests} {guests === 1 ? "guest" : "guests"}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-black shrink-0" style={{ color: "#f97316" }}>
                          ₱{(item.price * guests).toLocaleString("en-PH")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${borderColor}` }} />

              {/* Number of guests — editable */}
              <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3"
                style={{ backgroundColor: surfaceBg, border: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 shrink-0" style={{ color: "#f97316" }} />
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>Number of guests</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-opacity hover:opacity-70"
                    style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>−</button>
                  <span className="w-6 text-center font-black text-sm" style={{ color: textPrimary }}>{guests}</span>
                  <button onClick={() => setGuests(guests + 1)}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg transition-opacity hover:opacity-70"
                    style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>+</button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between px-1">
                <p className="text-sm font-bold" style={{ color: textMuted }}>Total Amount</p>
                <p className="font-black text-2xl" style={{ color: "#f97316", letterSpacing: "-0.02em" }}>
                  ₱{totalAmount.toLocaleString("en-PH")}
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: `1px solid ${borderColor}` }} />

              {/* Guest details */}
              <div className="space-y-3">
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: textMuted }}>Paying as</p>
                <input
                  type="text"
                  placeholder="Full name *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: surfaceBg,
                    borderColor: name.trim() ? borderColor : "rgba(249,115,22,0.4)",
                    color: textPrimary,
                  }}
                />
                <input
                  type="email"
                  placeholder="Email address (for receipt)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors"
                  style={{ backgroundColor: surfaceBg, borderColor, color: textPrimary }}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                  style={{ backgroundColor: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <p className="text-xs" style={{ color: "#f87171" }}>{error}</p>
                </div>
              )}

              {/* Xendit note */}
              <p className="text-[11px] text-center" style={{ color: textMuted }}>
                Powered by Xendit — pay via credit card, GCash, Maya, OTC, or bank transfer.
              </p>
            </div>

            {/* Sticky pay button */}
            <div className="shrink-0 px-5 pb-6 pt-3" style={{ borderTop: `1px solid ${borderColor}` }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handlePay}
                disabled={loading || !name.trim()}
                className="w-full py-4 rounded-2xl text-base font-black flex items-center justify-center gap-2.5 transition-all"
                style={{
                  background: loading || !name.trim()
                    ? (darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)")
                    : "linear-gradient(135deg, #f97316, #b45309)",
                  color: loading || !name.trim() ? textMuted : "#fff",
                  boxShadow: loading || !name.trim() ? "none" : "0 4px 20px rgba(249,115,22,0.4)",
                }}
              >
                {loading ? (
                  <><Loader className="w-5 h-5 animate-spin" /> Creating payment link…</>
                ) : (
                  <>Pay ₱{totalAmount.toLocaleString("en-PH")} via Xendit <ArrowRight className="w-5 h-5" /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
