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
  const photos = item.images?.length > 1 ? item.images : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45 }}
      className="rounded-2xl overflow-hidden border"
      style={{ borderColor: "rgba(255,153,19,0.3)", boxShadow: tk.cardShadow }}
    >
      <div className="overflow-hidden" style={{ aspectRatio: priority ? "16 / 9" : "4 / 3", position: "relative" }}>
        {photos ? (() => {
          const count = Math.min(photos.length, 3);
          const pct = 100 / count;
          const o = 28; // half the clip-path horizontal offset
          const t = 10; // seam visible thickness in px
          return (
            <div className="w-full h-full relative" style={{ overflow: "hidden" }}>
              {photos.slice(0, count).map((src, i) => {
                let left, width, clipPath;
                if (i === 0) {
                  left = "0"; width = `calc(${pct}% + ${o}px)`;
                  clipPath = `polygon(0 0, 100% 0, calc(100% - ${o * 2}px) 100%, 0 100%)`;
                } else if (i === count - 1) {
                  left = `calc(${pct * i}% - ${o}px)`; width = `calc(${pct}% + ${o}px)`;
                  clipPath = `polygon(${o * 2}px 0, 100% 0, 100% 100%, 0 100%)`;
                } else {
                  left = `calc(${pct * i}% - ${o}px)`; width = `calc(${pct}% + ${o * 2}px)`;
                  clipPath = `polygon(${o * 2}px 0, 100% 0, calc(100% - ${o * 2}px) 100%, 0 100%)`;
                }
                return (
                  <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left, width, clipPath }}>
                    <img src={src} alt={`${item.name} ${i + 1}`} className="w-full h-full object-cover" loading={i === 0 && priority ? "eager" : "lazy"} />
                  </div>
                );
              })}
              {/* Parallelogram seams — same slope as clip-path, no rotation math needed */}
              {Array.from({ length: count - 1 }, (_, i) => (
                <div key={`seam-${i}`} style={{
                  position: "absolute", top: 0, bottom: 0,
                  left: `calc(${pct * (i + 1)}% - ${o + t / 2}px)`,
                  width: `${o * 2 + t}px`,
                  background: "#fff8f3",
                  clipPath: `polygon(${o * 2}px 0, 100% 0, ${t}px 100%, 0 100%)`,
                  zIndex: 3, pointerEvents: "none",
                }} />
              ))}
            </div>
          );
        })() : item.image && !failed ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
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
      <div style={{ height: "3px", background: "linear-gradient(90deg, #ff9913 0%, #e07800 100%)" }} />
      <div className="p-4" style={{ backgroundColor: tk.cardBg }}>
        <p className="font-black text-base mb-1" style={{ color: tk.textPrimary }}>{item.name}</p>
        <p className="text-sm leading-relaxed" style={{ color: tk.textMuted }}>{item.desc}</p>
      </div>
    </motion.div>
  );
}

function RestaurantCard({ resto, darkMode, tk, index = 0 }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -3, boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
      className="rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(255,153,19,0.3)", backgroundColor: tk.cardBg, boxShadow: tk.cardShadow }}
    >
      {/* Image — 16:9, easy to swap later */}
      <div className="overflow-hidden" style={{ aspectRatio: "16/9" }}>
        {resto.image && !imgFailed ? (
          <img
            src={resto.image}
            alt={resto.name}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              background: darkMode
                ? "linear-gradient(135deg, #1a0d00, #0c0c0c)"
                : "linear-gradient(135deg, #fff7ed, #fed7aa)",
            }}
          >
            <span style={{ fontSize: "2.75rem" }}>🍽️</span>
          </div>
        )}
      </div>

      <div style={{ height: "3px", background: "linear-gradient(90deg, #ff9913 0%, #e07800 100%)" }} />
      {/* Content */}
      <div className="p-4">
        {/* Restaurant name */}
        <p className="font-black text-sm leading-snug mb-3" style={{ color: tk.textPrimary, letterSpacing: "-0.01em" }}>
          {resto.name}
        </p>

        {/* Famous For chips */}
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: tk.textMuted }}>
            Famous For
          </p>
          <div className="flex flex-wrap gap-1.5">
            {resto.dishes.map((dish) => (
              <span
                key={dish}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                style={{
                  background: "rgba(249,115,22,0.1)",
                  color: "#f97316",
                  border: "1px solid rgba(249,115,22,0.22)",
                }}
              >
                {dish}
              </span>
            ))}
          </div>
        </div>

        {/* Why travelers love it */}
        <p className="text-xs leading-relaxed" style={{ color: tk.textMuted }}>
          {resto.description}
        </p>
      </div>
    </motion.div>
  );
}

function SubBanner({ title, eyebrow, src, tk }) {
  return (
    <div className="rounded-xl px-5 py-3.5 mb-4" style={{ background: "linear-gradient(160deg, #ff9913 0%, #e07800 100%)" }}>
      {eyebrow && <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.72)" }}>{eyebrow}</p>}
      <p className="font-black text-base text-white" style={{ letterSpacing: "-0.01em" }}>{title}</p>
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
          <SubBanner title="Best Places to Visit" eyebrow="Must-See Spots" tk={tk} />
          <div className="space-y-4">
            {guide.highlights.map((h) => (
              <ImageCard key={h.name} item={h} darkMode={darkMode} tk={tk} priority />
            ))}
          </div>
        </div>
      )}

      {/* ── Best Food & Dining ── */}
      {guide.restaurants?.length > 0 && (
        <div>
          <SubBanner title="Best Food & Dining" eyebrow="Where to Eat" tk={tk} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {guide.restaurants.map((resto, i) => (
              <RestaurantCard key={resto.name} resto={resto} darkMode={darkMode} tk={tk} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* ── Best Photo Spots — full-width carousel ── */}
      {guide.photoSpots?.length > 0 && (
        <div>
          <SubBanner title="Best Photo Spots" eyebrow="Photography" tk={tk} />
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-30px" }}
            transition={{ duration: 0.4 }}
          >
            <PhotoSpotCarousel spots={guide.photoSpots} darkMode={darkMode} tk={tk} />
          </motion.div>
        </div>
      )}

      {/* ── Weather & Climate ── */}
      {guide.weather && (
        <div>
          <SubBanner title="Weather & Practical Info" eyebrow="Before You Go" src={banners.weather} tk={tk} />
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
          <SubBanner title="Currency Guide" eyebrow="Money Matters" src={banners.currency} tk={tk} />
          {/* PHP identity — full-width header card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.35 }}
            className="px-4 py-3 rounded-2xl border mb-3"
            style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg }}
          >
            <p className="text-sm font-bold leading-tight" style={{ color: tk.textPrimary }}>
              {guide.currency.symbol} Philippine Peso
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: tk.textMuted }}>Official currency · accepted everywhere in the Philippines</p>
          </motion.div>
          {/* Tip cards — vertical list */}
          <div className="flex flex-col gap-2">
            {guide.currency.tips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.32, delay: i * 0.06 }}
                className="px-4 py-3 rounded-2xl border"
                style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg }}
              >
                <p className="text-xs leading-relaxed" style={{ color: tk.textPrimary }}>{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Safety Tips ── */}
      {guide.safetyTips?.length > 0 && (
        <div>
          <SubBanner title="Safety Tips" eyebrow="Stay Safe" src={banners.safety} tk={tk} />
          <div className="flex flex-col gap-2">
            {guide.safetyTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.32, delay: i * 0.06 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border"
                style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg }}
              >
                <p className="text-xs leading-relaxed" style={{ color: tk.textPrimary }}>{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* ── Local Tips ── */}
      {guide.localTips?.length > 0 && (
        <div>
          <SubBanner title="Local Tips" eyebrow="Insider Knowledge" src={banners.localTips} tk={tk} />
          <div className="flex flex-col gap-2">
            {guide.localTips.map((tip, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-20px" }}
                transition={{ duration: 0.32, delay: i * 0.06 }}
                className="flex items-start gap-2.5 px-4 py-3 rounded-2xl border"
                style={{ borderColor: tk.borderColor, backgroundColor: tk.cardBg, boxShadow: tk.cardShadow }}
              >
                <p className="text-xs leading-relaxed" style={{ color: tk.textPrimary }}>{tip}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
