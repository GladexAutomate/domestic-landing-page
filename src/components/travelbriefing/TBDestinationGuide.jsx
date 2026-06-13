// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";

const MONTH_MAP = {
  january: "Jan", february: "Feb", march: "Mar", april: "Apr",
  may: "May", june: "Jun", july: "Jul", august: "Aug",
  september: "Sep", october: "Oct", november: "Nov", december: "Dec",
};

function parseMonthRange(text) {
  const match = text.match(/([A-Za-z]+)\s+to\s+([A-Za-z]+)/i);
  if (match) {
    const a = MONTH_MAP[match[1].toLowerCase()] || match[1].slice(0, 3);
    const b = MONTH_MAP[match[2].toLowerCase()] || match[2].slice(0, 3);
    return `${a} – ${b}`;
  }
  return text.split("(")[0].trim().split(",")[0].trim();
}

function parseTemp(text) {
  const match = text.match(/\d+°[CF]?\s*[–\-]\s*\d+°[CF]?/);
  return match ? match[0] : text.split(",")[0].trim();
}

function parseCurrencyTip(tip) {
  const t = tip.toLowerCase();
  let icon = "💡";
  let title = "";
  let sub   = "";

  if (t.includes("atm")) {
    icon  = "🏧";
    title = "ATM Available";
    const loc = tip.match(/at\s+([^—\-–]+?)(?:\s*[—\-–]|$)/i);
    sub   = loc ? loc[1].trim().slice(0, 22) : "";
  } else if (t.includes("gcash") && (t.includes("credit") || t.includes("card"))) {
    icon  = "📱";
    title = "GCash & Cards";
    sub   = "Accepted at most shops";
  } else if (t.includes("gcash")) {
    icon  = "📱";
    title = "GCash Accepted";
  } else if (t.includes("credit") || t.includes("card")) {
    icon  = "💳";
    title = "Cards Accepted";
  } else if (t.includes("small bill") || (t.includes("bill") && t.includes("small"))) {
    icon  = "💵";
    title = "Small Bills";
    sub   = "For stalls & vendors";
  } else if (t.includes("terminal") || t.includes("fee") || t.includes("port")) {
    icon  = "🎫";
    title = "Port / Terminal Fees";
    const rng = tip.match(/₱[\d,]+[–\-–]?[\d,]*/);
    sub   = rng ? `${rng[0]} · cash only` : "Cash required on-site";
  } else {
    const first = tip.split("—")[0].trim().split(" ");
    title = first.slice(0, 3).join(" ");
  }
  return { icon, title, sub };
}

function parseSafetyTip(tip) {
  const t = tip.toLowerCase();
  let icon = "⚠️";
  if (t.includes("swim") || t.includes("zone") || t.includes("flag"))          icon = "🏊";
  else if (t.includes("valuabl") || t.includes("unattend") || t.includes("bag")) icon = "🎒";
  else if (t.includes("accredit") || t.includes("provider") || t.includes("unauthor") || t.includes("boat")) icon = "🚤";
  else if (t.includes("sunscreen") || t.includes("reef") || t.includes("chemical")) icon = "🧴";
  else if (t.includes("sticker") || t.includes("wristband") || t.includes("southwest")) icon = "🔖";
  else if (t.includes("gladex") || t.includes("contact") || t.includes("coordinat")) icon = "📞";
  else if (t.includes("alcohol") || t.includes("drink"))      icon = "🚫";
  else if (t.includes("litter") || t.includes("trash") || t.includes("waste"))   icon = "♻️";

  const raw = tip.split("—")[0].trim().replace(/\.$/, "");
  const title = raw.split(" ").slice(0, 5).join(" ");
  return { icon, title, detail: tip };
}

function parseLocalTip(tip) {
  const t = tip.toLowerCase();
  let icon = "💡";
  if (t.includes("cash") || t.includes("small"))              icon = "💰";
  else if (t.includes("trike") || t.includes("e-trike") || t.includes("transport")) icon = "🛺";
  else if (t.includes("book") || t.includes("advance") || t.includes("reserv"))     icon = "📅";
  else if (t.includes("morning") || t.includes("early"))      icon = "🌅";
  else if (t.includes("bargain") || t.includes("haggle"))     icon = "🤝";
  else if (t.includes("photo"))                               icon = "📸";
  else if (t.includes("hydrat") || t.includes("water"))       icon = "💧";
  else if (t.includes("food") || t.includes("eat") || t.includes("try")) icon = "🍽️";
  else if (t.includes("tour") || t.includes("hop"))           icon = "🗺️";

  const dashIdx = tip.indexOf("—");
  let title, detail;
  if (dashIdx > 0) {
    title  = tip.slice(0, dashIdx).trim();
    detail = tip.slice(dashIdx + 1).trim();
  } else {
    const commaIdx = tip.indexOf(",");
    if (commaIdx > 0) {
      title  = tip.slice(0, commaIdx).trim();
      detail = tip.slice(commaIdx + 1).trim();
    } else {
      title  = tip.split(" ").slice(0, 4).join(" ");
      detail = "";
    }
  }
  return { icon, title, detail: detail || tip };
}

function PhotoSpotCarousel({ spots, darkMode, tk }) {
  const [current, setCurrent] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  const prev = () => { setImgFailed(false); setCurrent((c) => (c - 1 + spots.length) % spots.length); };
  const next = () => { setImgFailed(false); setCurrent((c) => (c + 1) % spots.length); };

  const spot = spots[current];

  return (
    <div className="rounded-2xl overflow-hidden border relative" style={{ borderColor: tk.borderColor, boxShadow: tk.cardShadow }}>
      {/* Photo — 4:3 on mobile (taller), 16:9 on sm+ */}
      <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
        {spot.image && !imgFailed ? (
          <img
            src={spot.image}
            alt={spot.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: darkMode ? "#1a1a1a" : "#e8e8e8" }}
          >
            📸
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 52%)" }} />

        {/* Counter badge */}
        <div className="absolute top-3 right-3 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}>
          {current + 1} / {spots.length}
        </div>

        {/* Left arrow — 44px tap target */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "1.25rem" }}
          aria-label="Previous"
        >‹</button>

        {/* Right arrow — 44px tap target */}
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-95"
          style={{ background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "1.25rem" }}
          aria-label="Next"
        >›</button>

        {/* Name + note overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 pt-8">
          <p className="font-black text-base text-white leading-snug">{spot.name}</p>
          {spot.note && <p className="text-xs leading-snug mt-1" style={{ color: "rgba(255,255,255,0.72)" }}>{spot.note}</p>}
        </div>
      </div>

      {/* Dot indicators — padded for tap area */}
      <div className="flex items-center justify-center gap-2 py-3" style={{ backgroundColor: tk.cardBg }}>
        {spots.map((_, i) => (
          <button
            key={i}
            onClick={() => { setImgFailed(false); setCurrent(i); }}
            className="rounded-full transition-all py-2 px-0.5"
            aria-label={`Go to photo ${i + 1}`}
          >
            <span
              className="block rounded-full transition-all"
              style={{
                width: i === current ? "22px" : "7px",
                height: "7px",
                background: i === current ? "#f97316" : tk.borderColor,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function ImageCard({ item, darkMode, tk, priority = false }) {
  const [failed, setFailed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: tk.borderColor, boxShadow: tk.cardShadow }}
    >
      <div className="overflow-hidden" style={{ aspectRatio: priority ? "16 / 7" : "4 / 3", position: "relative" }}>
        {item.image && !failed ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            onError={() => setFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #1a1a1a, #0c0c0c)"
                : "linear-gradient(135deg, #e8e8e8, #d0d0d0)",
              fontSize: "4rem",
            }}
          >
            {item.icon}
          </div>
        )}
      </div>
      <div className="p-4" style={{ backgroundColor: tk.cardBg }}>
        <p className="font-black text-base mb-1" style={{ color: tk.textPrimary }}>{item.name}</p>
        <p className="text-sm leading-relaxed" style={{ color: tk.textMuted }}>{item.desc}</p>
      </div>
    </motion.div>
  );
}

function SubBanner({ title, eyebrow, src }) {
  if (!src) return (
    <div className="flex items-center gap-1.5 mb-4">
      <p className="text-xs font-black uppercase tracking-widest" style={{ color: "#f97316" }}>{title}</p>
    </div>
  );
  return (
    <div className="relative w-full rounded-2xl overflow-hidden mb-4" style={{ height: "140px" }}>
      <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(249,115,22,0.65) 0%, rgba(0,0,0,0.72) 100%)" }} />
      <div className="absolute inset-0 flex flex-col justify-end p-4">
        {eyebrow && <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.68)" }}>{eyebrow}</p>}
        <p className="font-black text-lg text-white" style={{ letterSpacing: "-0.02em" }}>{title}</p>
      </div>
    </div>
  );
}

export default function TBDestinationGuide({ dest, darkMode, tk }) {
  const guide = dest.destinationGuide;
  const banners = {
    food:     dest.bannerImages?.food     || dest.heroImages?.[1] || dest.heroImage,
    weather:  dest.bannerImages?.weather  || dest.heroImages?.[2] || dest.heroImage,
    currency: dest.bannerImages?.currency || dest.heroImages?.[1] || dest.heroImage,
    safety:   dest.bannerImages?.safety   || dest.heroImages?.[0] || dest.heroImage,
    localTips: dest.bannerImages?.localTips || dest.heroImages?.[1] || dest.heroImage,
  };

  return (
    <div className="space-y-10">

      {/* ── Must-Visit Spots ── */}
      {guide.highlights?.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-5" style={{ color: "#f97316" }}>Best Places to Visit</p>
          <div className="mb-4">
            <ImageCard item={guide.highlights[0]} darkMode={darkMode} tk={tk} priority />
          </div>
          {guide.highlights.length > 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {guide.highlights.slice(1).map((h) => (
                <ImageCard key={h.name} item={h} darkMode={darkMode} tk={tk} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Local Food To Try ── */}
      {guide.food?.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#f97316" }}>Best Food & Dining</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.food.map((f) => (
              <div
                key={f.name}
                className="relative rounded-2xl overflow-hidden border"
                style={{ aspectRatio: "4/3", borderColor: tk.borderColor, boxShadow: tk.cardShadow }}
              >
                {f.image ? (
                  <img
                    src={f.image}
                    alt={f.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ background: darkMode ? "linear-gradient(135deg, #1c1008, #0c0c0c)" : "linear-gradient(135deg, #fff7ed, #fed7aa)" }}
                  >
                    <span style={{ fontSize: "3.5rem" }}>{f.emoji}</span>
                  </div>
                )}
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-bold text-sm text-white leading-snug">{f.name}</p>
                  {f.restaurant && (
                    <p className="text-[10px] font-black mt-0.5" style={{ color: "#f97316" }}>@ {f.restaurant}</p>
                  )}
                  {f.note && <p className="text-[10px] leading-snug mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>{f.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Best Photo Spots — full-width carousel ── */}
      {guide.photoSpots?.length > 0 && (
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: "#f97316" }}>Best Photo Spots</p>
          <PhotoSpotCarousel spots={guide.photoSpots} darkMode={darkMode} tk={tk} />
        </div>
      )}

      {/* ── Weather & Climate ── */}
      {guide.weather && (
        <div>
          <SubBanner title="Weather & Practical Info" eyebrow="Before You Go" src={banners.weather} />
          <div className="flex flex-col gap-2">
            {[
              { label: "Best Season",  text: guide.weather.bestSeason },
              { label: "Rainy Season", text: guide.weather.rainySeason },
              { label: "Temperature",  text: guide.weather.temperature },
              { label: "Pack Light",   text: guide.weather.packingTip },
            ].map(({ label, text }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35 }}
                className="px-4 py-3 rounded-2xl border"
                style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg, boxShadow: tk.cardShadow }}
              >
                <p className="text-xs font-bold mb-1" style={{ color: tk.textPrimary }}>{label}</p>
                <p className="text-xs leading-relaxed" style={{ color: tk.textMuted }}>{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Currency & Payments ── */}
      {guide.currency && (
        <div>
          <SubBanner title="Currency Guide" eyebrow="Money Matters" src={banners.currency} />
          {/* PHP identity — full-width header card */}
          <div
            className="px-4 py-3 rounded-2xl border mb-3"
            style={{ borderColor: "rgba(34,197,94,0.25)", backgroundColor: "rgba(34,197,94,0.07)" }}
          >
            <p className="text-sm font-bold leading-tight" style={{ color: tk.textPrimary }}>
              {guide.currency.symbol} Philippine Peso
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: tk.textMuted }}>Official currency · accepted everywhere in the Philippines</p>
          </div>
          {/* Tip cards — vertical list */}
          <div className="flex flex-col gap-2">
            {guide.currency.tips.map((tip, i) => (
              <div
                key={i}
                className="px-4 py-3 rounded-2xl border"
                style={{ borderColor: "rgba(34,197,94,0.15)", backgroundColor: "rgba(34,197,94,0.04)" }}
              >
                <p className="text-xs leading-relaxed" style={{ color: tk.textPrimary }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Safety Tips ── */}
      {guide.safetyTips?.length > 0 && (
        <div>
          <SubBanner title="Safety Tips" eyebrow="Stay Safe" src={banners.safety} />
          <div className="flex flex-col gap-2">
            {guide.safetyTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border"
                style={{ borderColor: "rgba(239,68,68,0.15)", backgroundColor: "rgba(239,68,68,0.04)" }}
              >
                <p className="text-xs leading-relaxed" style={{ color: tk.textPrimary }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Local Tips ── */}
      {guide.localTips?.length > 0 && (
        <div>
          <SubBanner title="Local Tips" eyebrow="Insider Knowledge" src={banners.localTips} />
          <div className="flex flex-col gap-2">
            {guide.localTips.map((tip, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border"
                style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg, boxShadow: tk.cardShadow }}
              >
                <p className="text-xs leading-relaxed" style={{ color: tk.textPrimary }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
