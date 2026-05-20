export default function DestinationCard({ delay, visible }) {
  return (
    <div
      className={`card-animate group relative rounded-2xl overflow-hidden cursor-pointer`}
      style={{
        animationDelay: visible ? `${delay}ms` : "9999s",
        animationPlayState: visible ? "running" : "paused",
        opacity: visible ? undefined : 0,
        height: "360px",
        background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
        boxShadow: "0 4px 24px rgba(15,23,42,0.12)",
      }}
    >
      {/* Placeholder shimmer background */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, #1e293b 0%, #162032 40%, #1a2840 70%, #0f172a 100%)",
        }}
      />

      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 30% 20%, rgba(0,180,216,0.25) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(255,107,0,0.12) 0%, transparent 50%)",
        }}
      />

      {/* Decorative line accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "rgba(255,107,0,0.25)" }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-5">
        {/* Top — Badge */}
        <div className="flex items-start justify-between">
          <span
            className="badge-pulse inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.18em] uppercase text-white"
            style={{
              background: "#FF6B00",
              backdropFilter: "blur(8px)",
              boxShadow: "0 2px 12px rgba(255,107,0,0.35)",
            }}
          >
            Domestic
          </span>
        </div>

        {/* Bottom — Info */}
        <div>
          {/* Country label */}
          <p
            className="text-[10px] font-semibold tracking-[0.25em] uppercase mb-1.5"
            style={{ color: "rgba(255,107,0,0.9)" }}
          >
            Philippines
          </p>

          {/* Destination name placeholder */}
          <h3 className="text-white font-bold text-xl mb-1 leading-tight tracking-tight">
            Destination Name
          </h3>

          {/* Duration placeholder */}
          <p
            className="text-sm font-light mb-4"
            style={{ color: "rgba(248,250,252,0.55)" }}
          >
            X Days / X Nights
          </p>

          {/* Decorative divider */}
          <div
            className="w-8 h-[1px] mb-4"
            style={{ background: "rgba(255,107,0,0.4)" }}
          />

          {/* On Request Ghost Button */}
          <button
            className="ghost-btn w-full py-2.5 rounded-full border-2 text-white text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-300"
            style={{
              borderColor: "rgba(255,107,0,0.7)",
              color: "rgba(255,255,255,0.85)",
            }}
            onClick={(e) => e.preventDefault()}
          >
            <span>On Request</span>
          </button>
        </div>
      </div>
    </div>
  );
}