import { useState } from "react";

const ACCORDION_ITEMS = [
  {
    title: "Travel Requirements",
    content: "Valid Philippine ID or passport required. Check current local government unit (LGU) entry requirements before travel. Health protocols may apply depending on destination."
  },
  {
    title: "Travel Reminders",
    content: "Book transportation and accommodations in advance, especially during peak season (December–May). Bring reef-safe sunscreen and follow eco-tourism guidelines."
  },
  {
    title: "Important Notices",
    content: "Some island destinations may require environmental fees upon entry. Weather conditions can affect travel schedules. Always have travel insurance."
  },
  {
    title: "Terms & Conditions",
    content: "Package details, pricing, and availability are subject to change without prior notice. Gladex Travel and Tours Corp. reserves the right to modify itineraries due to force majeure."
  },
  {
    title: "Package Overview",
    content: "All packages are placeholder and will be updated with full details. Contact Gladex for current pricing, inclusions, and travel date availability."
  },
];

function AccordionItem({ title, content, darkMode }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all"
      style={{
        border: darkMode ? "1px solid rgba(255,255,255,0.07)" : "1px solid rgba(0,0,0,0.08)",
        background: darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
      }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className={`font-semibold text-sm ${darkMode ? "text-white" : "text-[#0F172A]"}`}>{title}</span>
        <svg
          className="w-4 h-4 transition-transform duration-300 flex-shrink-0"
          style={{ color: "#FF8C00", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className={`px-5 pb-4 text-sm font-light leading-relaxed ${darkMode ? "text-white/60" : "text-[#64748B]"}`}>
          {content}
        </div>
      )}
    </div>
  );
}

export default function DestinationRequirements({ destination, darkMode }) {
  return (
    <section className={`py-20 px-6 ${darkMode ? "bg-[#0a0a0a]" : "bg-[#faf9f7]"}`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            Important
          </span>
        </div>
        <h2 className={`text-center font-black text-3xl md:text-4xl mb-10 ${darkMode ? "text-white" : "text-[#0F172A]"}`}>
          Requirements & Notes
        </h2>

        <div className="space-y-3">
          {ACCORDION_ITEMS.map((item) => (
            <AccordionItem key={item.title} {...item} darkMode={darkMode} />
          ))}
        </div>
      </div>
    </section>
  );
}