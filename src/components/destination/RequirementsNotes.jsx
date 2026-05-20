import { useState } from "react";

const ITEMS = [
  {
    title: "Visa Requirements",
    content: "Philippine citizens do not require a visa for domestic travel. Valid Philippine government-issued ID required at check-in. For foreign nationals, a valid passport and appropriate Philippine visa are required."
  },
  {
    title: "Payment Terms",
    content: "A downpayment is required to confirm your booking. Full payment must be settled at least 14 days before departure. Payments can be made via bank transfer, GCash, or Maya. Contact Gladex for full payment details."
  },
  {
    title: "Travel Reminders",
    content: "Book transportation and accommodations early, especially during peak season (December–May). Bring reef-safe sunscreen. Follow LGU entry requirements. Keep emergency contact numbers handy."
  },
  {
    title: "Important Notices",
    content: "Some island destinations require environmental fees upon entry. Weather and sea conditions may affect travel schedules. Gladex reserves the right to modify itineraries due to safety or force majeure. Travel insurance is strongly recommended."
  },
  {
    title: "Terms & Conditions",
    content: "Package rates are subject to change without prior notice. Cancellation fees apply depending on notice period. Gladex Travel and Tours Corp. is not liable for delays caused by airline or ferry operations, weather, or government-imposed travel restrictions."
  },
];

function AccordionItem({ title, content, darkMode }) {
  const [open, setOpen] = useState(false);
  const border = darkMode ? "border-white/8" : "border-gray-200";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";

  return (
    <div className={`rounded-xl border overflow-hidden ${border}`} style={{ borderWidth: "1px" }}>
      <button
        className={`w-full flex items-center justify-between px-5 py-4 text-left transition-colors ${darkMode ? "hover:bg-white/3" : "hover:bg-gray-50"}`}
        onClick={() => setOpen(!open)}
      >
        <span className={`font-semibold text-sm ${textPrimary}`}>{title}</span>
        <svg
          className="w-4 h-4 flex-shrink-0 transition-transform duration-300"
          style={{ color: "#FF8C00", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className={`px-5 pb-5 text-sm leading-relaxed font-light ${darkMode ? "text-white/55" : "text-[#64748B]"}`}>
          {content}
        </div>
      )}
    </div>
  );
}

export default function RequirementsNotes({ darkMode, noPadding }) {
  const bg = darkMode ? "bg-[#0a0a0a]" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";

  return (
    <section className={noPadding ? "" : `py-20 px-6 ${bg}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-4">
          <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Important</span>
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-10 ${textPrimary}`}>
          Requirements & Notes
        </h2>

        <div className="space-y-3">
          {ITEMS.map((item) => (
            <AccordionItem key={item.title} {...item} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </section>
  );
}