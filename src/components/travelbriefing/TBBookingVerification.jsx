// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Download, User, MapPin, CreditCard, FileText, Paperclip, X, Check } from "lucide-react";

// Maps raw Fusioo status values to client-facing labels
function getDisplayStatus(rawStatus) {
  if (!rawStatus) return "Confirmed";
  const s = rawStatus.toLowerCase().trim();
  if (["processed", "confirmed", "booked", "complete", "completed", "verified", "approved", "active"].includes(s)) {
    return "Confirmed";
  }
  if (s.includes("pending")) return "Pending";
  if (s.includes("cancel")) return "Cancelled";
  return rawStatus;
}

export default function TBBookingVerification({ booking, dest, darkMode, tk, onClose }) {
  const [expanded, setExpanded] = useState(false);

  if (!booking) return null;

  const textPrimary = tk?.textPrimary || (darkMode ? "#f0f0f0" : "#1a1a1a");
  const textMuted   = tk?.textMuted   || (darkMode ? "rgba(255,255,255,0.45)" : "#6b7280");
  const borderColor = tk?.borderColor || (darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)");
  const cardBg      = tk?.cardBg      || (darkMode ? "#141414" : "#ffffff");
  const cardShadow  = tk?.cardShadow  || "0 4px 24px rgba(0,0,0,0.15)";
  const surfaceBg   = tk?.surfaceBg   || (darkMode ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.028)");

  const isFullyPaid  = (booking.paymentStatus || "").toLowerCase().includes("fully paid");
  const isConfirmed  = ["processed", "confirmed", "booked", "complete", "completed", "verified", "approved"].includes(
    (booking.status || "").toLowerCase()
  );
  const displayStatus = getDisplayStatus(booking.status);

  // Determine best available voucher URL
  const voucherUrl = booking.automatedVoucherUrl || booking.voucherUrl || booking.tourVoucherUrl || null;
  const hasAnyVoucher = !!voucherUrl || booking.attachments?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── "View Full Booking Details" toggle ───────────────────── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border mb-3 transition-all"
        style={{ borderColor, backgroundColor: surfaceBg }}
      >
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4" style={{ color: "#22c55e" }} />
          <span className="text-sm font-bold" style={{ color: textPrimary }}>
            {expanded ? "Hide Booking Details" : "View Full Booking Details"}
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.22 }}>
          <X className="w-4 h-4 rotate-45" style={{ color: textMuted }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="space-y-4">

              {/* ── PACKAGE INCLUSIONS & EXCLUSIONS ──────────────── */}
              {dest && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl border p-4" style={{ borderColor, backgroundColor: cardBg, boxShadow: cardShadow }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#22c55e" }}>✓ Package Inclusions</p>
                    <ul className="space-y-2">
                      {dest.inclusions.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                          <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-green-500" strokeWidth={2.5} /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl border p-4" style={{ borderColor, backgroundColor: cardBg, boxShadow: cardShadow }}>
                    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>✗ Exclusions</p>
                    <ul className="space-y-2">
                      {dest.exclusions.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-xs" style={{ color: textPrimary }}>
                          <X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-red-500" strokeWidth={2.5} /> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── BOOKING SUMMARY ───────────────────────────────────── */}
              <Section title="Booking Summary" icon={<FileText className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
                <Row label="Booking Reference" value={`GDX-${booking.gdx}`} highlight textPrimary={textPrimary} textMuted={textMuted} />
                <Row label="Booking Status" value={displayStatus} badge={isConfirmed ? "green" : "orange"} textPrimary={textPrimary} textMuted={textMuted} />
                {booking.transactionType && <Row label="Transaction Type" value={booking.transactionType} textPrimary={textPrimary} textMuted={textMuted} />}
                {booking.typeOfPackage    && <Row label="Package Type" value={booking.typeOfPackage} textPrimary={textPrimary} textMuted={textMuted} />}
                {booking.dateCreated      && <Row label="Date Booked" value={booking.dateCreated} textPrimary={textPrimary} textMuted={textMuted} />}
                {booking.agentName        && <Row label="Handling Team" value={booking.agentName} textPrimary={textPrimary} textMuted={textMuted} />}
                {booking.salesAgent       && <Row label="Sales Agent" value={booking.salesAgent} textPrimary={textPrimary} textMuted={textMuted} />}
                {booking.consultantName   && <Row label="Travel Consultant" value={booking.consultantName} textPrimary={textPrimary} textMuted={textMuted} />}
              </Section>

              {/* ── TRAVELER INFORMATION ──────────────────────────────── */}
              <Section title="Traveler Information" icon={<User className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
                <Row label="Lead Guest"      value={booking.leadName} textPrimary={textPrimary} textMuted={textMuted} />
                <Row label="Contact Number"  value={booking.phone  || "—"} textPrimary={textPrimary} textMuted={textMuted} />
                <Row label="Email"           value={booking.email  || "—"} textPrimary={textPrimary} textMuted={textMuted} />
                <Row label="Total Guests"    value={booking.totalGuests ? `${booking.totalGuests} person${Number(booking.totalGuests) !== 1 ? "s" : ""}` : "—"} textPrimary={textPrimary} textMuted={textMuted} />
                {booking.guestList?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>Guest Names</p>
                    {booking.guestList.map((g, i) => (
                      <p key={i} className="text-xs flex items-center gap-1.5 mb-0.5" style={{ color: textPrimary }}>
                        <span className="text-orange-400 shrink-0">•</span> {g}
                      </p>
                    ))}
                  </div>
                )}
              </Section>

              {/* ── TRAVEL INFORMATION ────────────────────────────────── */}
              <Section title="Travel Information" icon={<MapPin className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
                <Row label="Travel Date"    value={booking.arrivalDate || booking.travelDate    || "—"} textPrimary={textPrimary} textMuted={textMuted} />
                <Row label="Arrival Date"   value={booking.arrivalDate   || "—"} textPrimary={textPrimary} textMuted={textMuted} />
                <Row label="Departure Date" value={booking.departureDate || "—"} textPrimary={textPrimary} textMuted={textMuted} />
                {booking.duration           && <Row label="Duration" value={booking.duration} textPrimary={textPrimary} textMuted={textMuted} />}

                {/* Hotel */}
                {booking.hotel ? (
                  <>
                    {booking.hotel.hotelName  && <Row label="Hotel" value={booking.hotel.hotelName} highlight textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.hotel.roomType   && <Row label="Room Type"      value={booking.hotel.roomType}    textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.hotel.stayDates  && <Row label="Hotel Stay"     value={booking.hotel.stayDates}   textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.hotel.nights     && <Row label="No. of Nights"  value={`${booking.hotel.nights} night${booking.hotel.nights > 1 ? "s" : ""}`} textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.hotel.requests   && <Row label="Room Request"   value={booking.hotel.requests}    textPrimary={textPrimary} textMuted={textMuted} />}
                  </>
                ) : (
                  <Row label="Hotel" value="—" textPrimary={textPrimary} textMuted={textMuted} />
                )}

                {/* Hotel name extracted from tour description (fallback) */}
                {!booking.hotel?.hotelName && booking.tour?.hotelMention && (
                  <Row label="Hotel (from tour)" value={booking.tour.hotelMention} textPrimary={textPrimary} textMuted={textMuted} />
                )}

                {/* Airline / Ticket */}
                {booking.ticket ? (
                  <>
                    {booking.ticket.airline    && <Row label="Airline"    value={booking.ticket.airline}                       textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.ticket.pnr        && <Row label="PNR / Ref"  value={booking.ticket.pnr}                           textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.ticket.ticketType && <Row label="Ticket Type" value={booking.ticket.ticketType}                   textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.ticket.departingFlight && <Row label="Departing Flight" value={booking.ticket.departingFlight}    textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.ticket.returningFlight && <Row label="Returning Flight" value={booking.ticket.returningFlight}    textPrimary={textPrimary} textMuted={textMuted} />}
                  </>
                ) : (
                  <Row label="Airline" value="—" textPrimary={textPrimary} textMuted={textMuted} />
                )}

                {/* Tour Details */}
                {booking.tour ? (
                  <>
                    {booking.tour.tourName   && <Row label="Tour"      value={booking.tour.tourName}                           textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.tour.tourDate   && <Row label="Tour Date" value={booking.tour.tourDate}                           textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.tour.description && (
                      <div className="mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>Tour Details</p>
                        {booking.tour.description.split("\n").filter(Boolean).map((line, i) => (
                          <p key={i} className="text-xs mb-0.5" style={{ color: textPrimary }}>{line}</p>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Row label="Tour Details" value="—" textPrimary={textPrimary} textMuted={textMuted} />
                )}

                {/* Transfer Details */}
                {booking.transfer ? (
                  <>
                    {booking.transfer.transferType && <Row label="Transfer Type" value={booking.transfer.transferType}         textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.transfer.supplier     && <Row label="Transfer Provider" value={booking.transfer.supplier}         textPrimary={textPrimary} textMuted={textMuted} />}
                    {booking.transfer.description  && (
                      <div className="mt-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>Transfer Info</p>
                        {booking.transfer.description.split("\n").filter(Boolean).map((line, i) => (
                          <p key={i} className="text-xs mb-0.5" style={{ color: textPrimary }}>{line}</p>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Row label="Transfer" value="—" textPrimary={textPrimary} textMuted={textMuted} />
                )}
              </Section>

              {/* ── PAYMENT INFORMATION ───────────────────────────────── */}
              <Section title="Payment Information" icon={<CreditCard className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
                <Row
                  label="Package Price"
                  value={booking.packagePrice ? `₱${Number(booking.packagePrice).toLocaleString("en-PH")}` : "—"}
                  textPrimary={textPrimary} textMuted={textMuted}
                />
                <Row
                  label="Amount Paid"
                  value={booking.amountPaid ? `₱${Number(booking.amountPaid).toLocaleString("en-PH")}` : "—"}
                  textPrimary={textPrimary} textMuted={textMuted}
                />
                {booking.paymentMethod && (
                  <div className="mt-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: textMuted }}>Payment Method</p>
                    {booking.paymentMethod.split(",").map((m, i) => (
                      <p key={i} className="text-xs mb-0.5" style={{ color: textPrimary }}>{m.trim()}</p>
                    ))}
                  </div>
                )}
                <Row
                  label="Payment Status"
                  value={booking.paymentStatus || "—"}
                  badge={(() => {
                    const ps = (booking.paymentStatus || "").toLowerCase();
                    if (ps.includes("fully paid") || ps.includes("complete")) return "green";
                    if (ps.includes("partial")) return "amber";
                    if (ps.includes("unpaid") || ps.includes("fail")) return "red";
                    return "orange";
                  })()}
                  textPrimary={textPrimary} textMuted={textMuted}
                />
              </Section>

              {/* ── DOCUMENTS ─────────────────────────────────────────── */}
              <Section title="Documents" icon={<Paperclip className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
                {/* Primary voucher — best available URL */}
                <DocRow
                  label="Travel Voucher"
                  url={voucherUrl}
                  notAvailableMessage="Voucher not yet available — contact your travel consultant."
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                />

                {/* Tour voucher (if separate) */}
                {booking.tourVoucherUrl && booking.tourVoucherUrl !== voucherUrl && (
                  <DocRow label="Tour Voucher" url={booking.tourVoucherUrl} textPrimary={textPrimary} textMuted={textMuted} />
                )}

                {/* Attachments */}
                {booking.attachments?.length > 0 ? (
                  booking.attachments.map((att, i) => (
                    <DocRow
                      key={i}
                      label={att.name || `Attachment ${i + 1}`}
                      url={att.url}
                      textPrimary={textPrimary}
                      textMuted={textMuted}
                    />
                  ))
                ) : (
                  !hasAnyVoucher && (
                    <p className="text-xs italic" style={{ color: textMuted }}>
                      No documents attached. Your voucher will be sent once processing is complete.
                    </p>
                  )
                )}
              </Section>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Sub-components ────────────────────────────────────────────────
function Section({ title, icon, children, borderColor, cardBg, cardShadow, textPrimary }) {
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor, backgroundColor: cardBg, boxShadow: cardShadow }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor }}>
        <span style={{ color: "#f97316" }}>{icon}</span>
        <p className="font-bold text-sm" style={{ color: textPrimary }}>{title}</p>
      </div>
      <div className="p-4 space-y-2.5">{children}</div>
    </div>
  );
}

const BADGE_STYLES = {
  green:  { bg: "rgba(22,163,74,0.12)",   color: "#16a34a", border: "1px solid rgba(22,163,74,0.3)" },
  teal:   { bg: "rgba(13,148,136,0.12)",  color: "#0d9488", border: "1px solid rgba(13,148,136,0.3)" },
  blue:   { bg: "rgba(59,130,246,0.12)",  color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)" },
  amber:  { bg: "rgba(245,158,11,0.12)",  color: "#d97706", border: "1px solid rgba(245,158,11,0.3)" },
  orange: { bg: "rgba(249,115,22,0.12)",  color: "#f97316", border: "1px solid rgba(249,115,22,0.3)" },
  red:    { bg: "rgba(239,68,68,0.12)",   color: "#dc2626", border: "1px solid rgba(239,68,68,0.3)" },
};

function Row({ label, value, badge, highlight, textPrimary, textMuted }) {
  const bs = badge ? (BADGE_STYLES[badge] || BADGE_STYLES.orange) : null;
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs shrink-0" style={{ color: textMuted, minWidth: "120px" }}>{label}</p>
      {bs ? (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-right"
          style={{ backgroundColor: bs.bg, color: bs.color, border: bs.border }}
        >
          {value}
        </span>
      ) : (
        <p
          className="text-xs text-right"
          style={{ color: highlight ? "#f97316" : textPrimary, fontWeight: highlight ? "700" : "400", wordBreak: "break-word" }}
        >
          {value || "—"}
        </p>
      )}
    </div>
  );
}

function DocRow({ label, url, notAvailableMessage, textPrimary, textMuted }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <p className="text-xs" style={{ color: textMuted }}>{label}</p>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border transition-all hover:opacity-80"
          style={{ borderColor: "rgba(249,115,22,0.35)", color: "#f97316", backgroundColor: "rgba(249,115,22,0.08)" }}
        >
          <Download className="w-3 h-3" /> Download
        </a>
      ) : (
        <p className="text-xs text-right max-w-[180px]" style={{ color: textMuted }}>
          {notAvailableMessage || "Not Available"}
        </p>
      )}
    </div>
  );
}
