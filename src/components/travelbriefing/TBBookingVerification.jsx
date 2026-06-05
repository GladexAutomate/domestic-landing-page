// @ts-nocheck
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, Download, User, MapPin, CreditCard, FileText, Paperclip, X } from "lucide-react";

export default function TBBookingVerification({ booking, darkMode, tk, onClose }) {
  const [expanded, setExpanded] = useState(false);

  if (!booking) return null;

  const textPrimary = tk?.textPrimary || (darkMode ? "#f0f0f0" : "#1a1a1a");
  const textMuted   = tk?.textMuted   || (darkMode ? "rgba(255,255,255,0.45)" : "#6b7280");
  const borderColor = tk?.borderColor || (darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)");
  const cardBg      = tk?.cardBg      || (darkMode ? "#141414" : "#ffffff");
  const cardShadow  = tk?.cardShadow  || "0 4px 24px rgba(0,0,0,0.15)";
  const surfaceBg   = tk?.surfaceBg   || (darkMode ? "rgba(255,255,255,0.035)" : "rgba(0,0,0,0.028)");

  const isFullyPaid = (booking.paymentStatus || "").toLowerCase().includes("fully paid");
  const isConfirmed = ["processed", "confirmed", "booked"].includes((booking.status || "").toLowerCase());

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

        {/* ── BOOKING SUMMARY ───────────────────────────────────── */}
        <Section title="Booking Summary" icon={<FileText className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
          <Row label="Booking Reference" value={`GDX-${booking.gdx}`} highlight textPrimary={textPrimary} textMuted={textMuted} />
          <Row label="Booking Status" value={booking.status} badge={isConfirmed ? "green" : "orange"} textPrimary={textPrimary} textMuted={textMuted} />
          {booking.transactionType && <Row label="Transaction Type" value={booking.transactionType} textPrimary={textPrimary} textMuted={textMuted} />}
          {booking.typeOfPackage    && <Row label="Package Type" value={booking.typeOfPackage} textPrimary={textPrimary} textMuted={textMuted} />}
          {booking.dateCreated      && <Row label="Date Booked" value={booking.dateCreated} textPrimary={textPrimary} textMuted={textMuted} />}
          {booking.agentName        && <Row label="Handling Team" value={booking.agentName} textPrimary={textPrimary} textMuted={textMuted} />}
          {booking.salesAgent       && <Row label="Sales Agent" value={booking.salesAgent} textPrimary={textPrimary} textMuted={textMuted} />}
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
          <Row label="Travel Date"    value={booking.travelDate    || "—"} textPrimary={textPrimary} textMuted={textMuted} />
          <Row label="Arrival Date"   value={booking.arrivalDate   || "—"} textPrimary={textPrimary} textMuted={textMuted} />
          <Row label="Departure Date" value={booking.departureDate || "—"} textPrimary={textPrimary} textMuted={textMuted} />
          {booking.duration           && <Row label="Duration" value={booking.duration} textPrimary={textPrimary} textMuted={textMuted} />}

          {/* Hotel from hotel_details table */}
          {booking.hotel ? (
            <>
              {booking.hotel.roomType    && <Row label="Room Type"      value={booking.hotel.roomType}    textPrimary={textPrimary} textMuted={textMuted} />}
              {booking.hotel.stayDates   && <Row label="Hotel Stay"     value={booking.hotel.stayDates}   textPrimary={textPrimary} textMuted={textMuted} />}
              {booking.hotel.nights      && <Row label="No. of Nights"  value={`${booking.hotel.nights} night${booking.hotel.nights > 1 ? "s" : ""}`} textPrimary={textPrimary} textMuted={textMuted} />}
              {booking.hotel.requests    && <Row label="Room Request"   value={booking.hotel.requests}    textPrimary={textPrimary} textMuted={textMuted} />}
            </>
          ) : (
            <Row label="Hotel" value="—" textPrimary={textPrimary} textMuted={textMuted} />
          )}

          {/* Hotel name from tour description (sometimes embedded) */}
          {booking.tour?.hotelMention && (
            <Row label="Hotel Name" value={booking.tour.hotelMention} textPrimary={textPrimary} textMuted={textMuted} />
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
            badge={isFullyPaid ? "green" : "orange"}
            textPrimary={textPrimary} textMuted={textMuted}
          />
        </Section>

        {/* ── DOCUMENTS ─────────────────────────────────────────── */}
        <Section title="Documents" icon={<Paperclip className="w-4 h-4" />} borderColor={borderColor} cardBg={cardBg} cardShadow={cardShadow} textPrimary={textPrimary}>
          <DocRow label="Voucher"           ref_={booking.voucherId}        url={null}                                             textPrimary={textPrimary} textMuted={textMuted} />
          <DocRow label="Automated Voucher" ref_={booking.automatedVoucher} url={isUrl(booking.automatedVoucher) ? booking.automatedVoucher : null} textPrimary={textPrimary} textMuted={textMuted} />

          {booking.attachments?.length > 0 ? (
            booking.attachments.map((att, i) => (
              <DocRow
                key={i}
                label={att.name || `Attachment ${i + 1}`}
                url={att.url || (typeof att === "string" ? att : null)}
                textPrimary={textPrimary}
                textMuted={textMuted}
              />
            ))
          ) : (
            <Row label="Attachments" value="Not Available" textPrimary={textPrimary} textMuted={textMuted} />
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

function Row({ label, value, badge, highlight, textPrimary, textMuted }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-xs shrink-0" style={{ color: textMuted, minWidth: "120px" }}>{label}</p>
      {badge ? (
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full text-right"
          style={{
            backgroundColor: badge === "green" ? "rgba(34,197,94,0.12)" : "rgba(249,115,22,0.12)",
            color:           badge === "green" ? "#22c55e"              : "#f97316",
            border: `1px solid ${badge === "green" ? "rgba(34,197,94,0.3)" : "rgba(249,115,22,0.3)"}`,
          }}
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

function DocRow({ label, ref_, url, textPrimary, textMuted }) {
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
        <p className="text-xs" style={{ color: ref_ ? textPrimary : textMuted }}>
          {ref_ ? "On File" : "Not Available"}
        </p>
      )}
    </div>
  );
}

function isUrl(str) {
  return typeof str === "string" && (str.startsWith("http://") || str.startsWith("https://"));
}
