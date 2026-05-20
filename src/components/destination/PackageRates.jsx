const RATES = [
  { label: "Adult Rate", price: "TBD", note: "Per person, twin sharing" },
  { label: "Child Rate", price: "TBD", note: "Subject to availability" },
  { label: "Single Supplement", price: "TBD", note: "Solo traveler add-on" },
  { label: "Downpayment", price: "TBD", note: "To confirm your booking", highlight: true },
];

export default function PackageRates({ destination, noPadding }) {
  return (
    <section className={noPadding ? "" : "py-20 px-6"} style={noPadding ? {} : { background: "#0a0a0a" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Investment</span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className="text-center font-black text-3xl md:text-4xl mb-2 text-white">Package Rates</h2>
        <p className="text-center text-sm font-light mb-12 text-white/50">Transparent pricing. No hidden fees.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {RATES.map((rate) => (
            <div
              key={rate.label}
              className="rounded-xl p-5 flex flex-col items-center justify-center text-center"
              style={{
                background: rate.highlight ? "#FF8C00" : "transparent",
                border: rate.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <p className={`text-xs font-medium mb-2 ${rate.highlight ? "text-white/80" : "text-white/50"}`}>{rate.label}</p>
              <p className={`font-black text-xl mb-1 ${rate.highlight ? "text-white" : "text-white"}`}>
                {rate.price === "TBD" ? <span className="text-sm font-medium opacity-60">On Request</span> : `PHP ${rate.price}`}
              </p>
              <p className={`text-[11px] ${rate.highlight ? "text-white/80" : "text-white/40"}`}>{rate.note}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs mt-8 text-white/30">
          * Rates are subject to change without prior notice. Contact us for the latest pricing.
        </p>
      </div>
    </section>
  );
}