import { useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function AnimatedCard({ children, delay = 0, style = {} }) {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className="transition-all duration-700"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transitionDelay: `${delay}s`,
        ...style
      }}>
      
      {children}
    </div>);

}

function SectionLabel({ text, centered = false }) {
  if (centered) {
    return (
      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.4))" }} />
        <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>{text}</span>
        <div className="h-[1px] flex-1" style={{ background: "linear-gradient(90deg, rgba(255,140,0,0.4), transparent)" }} />
      </div>);

  }
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-[1px] w-8" style={{ background: "#FF8C00" }} />
      <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>{text}</span>
      <div className="h-[1px] flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>);

}

function HotelCard({ cat, index, darkMode }) {
  const [expanded, setExpanded] = useState(index === 0);
  const cardBg = darkMode ? "rgba(20,20,20,0.8)" : "rgba(255,255,255,0.9)";
  const innerBg = darkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";
  const textPrimary = darkMode ? "#fff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.5)" : "#64748B";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb";

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: cardBg,
        border: `1px solid ${expanded ? "rgba(255,140,0,0.25)" : borderColor}`,
        boxShadow: expanded ? "0 8px 32px rgba(255,140,0,0.08)" : darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.04)"
      }}>
      
      {/* Header — clickable */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between px-4 py-3.5 text-left transition-colors duration-200 gap-3"
        style={{ background: expanded ? "rgba(255,140,0,0.04)" : "transparent" }}>
        
        <div className="flex items-start gap-2.5 min-w-0">
          <div
            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
            style={{ background: expanded ? "#FF8C00" : darkMode ? "rgba(255,255,255,0.2)" : "#CBD5E1", boxShadow: expanded ? "0 0 8px rgba(255,140,0,0.6)" : "none" }} />
          
          <div className="min-w-0">
            <span className="font-bold text-sm tracking-wide uppercase leading-snug break-words" style={{ color: expanded ? "#FF8C00" : textPrimary }}>
              {cat.label}
            </span>
            {cat.note &&
            <span className="block text-xs mt-0.5 px-2 py-0.5 rounded-full w-fit" style={{ background: darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9", color: textMuted }}>
                {cat.note}
              </span>
            }
          </div>
        </div>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 mt-0.5"
          style={{ background: expanded ? "rgba(255,140,0,0.15)" : darkMode ? "rgba(255,255,255,0.06)" : "#f1f5f9", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}>
          
          <svg className="w-3 h-3" fill="none" stroke={expanded ? "#FF8C00" : textMuted} strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Body */}
      <div
        className="overflow-hidden transition-all duration-500"
        style={{ maxHeight: expanded ? "800px" : "0px", opacity: expanded ? 1 : 0 }}>
        
        <div className="px-4 pb-4">
          {cat.hotels &&
          <p className="text-xs sm:text-sm mb-4 leading-relaxed break-words" style={{ color: textMuted }}>
              {cat.hotels}
            </p>
          }
          {cat.rates?.length > 0 &&
          <div className="grid grid-cols-2 gap-2">
              {cat.rates.map((r, j) =>
            <div
              key={j}
              className="flex flex-col gap-0.5 rounded-lg p-2.5 sm:p-3"
              style={{ background: innerBg, border: `1px solid ${borderColor}` }}>
              
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold leading-tight break-words" style={{ color: textMuted }}>{r.label}</span>
                  <span className="text-xs sm:text-sm font-black leading-snug break-all" style={{ color: "#FF8C00" }}>{r.price}</span>
                </div>
            )}
            </div>
          }
        </div>
      </div>
    </div>);

}

function OptionalTourCard({ tour, darkMode }) {
  const [ref, visible] = useScrollReveal(0.1);
  const cardBg = darkMode ? "rgba(20,20,20,0.8)" : "rgba(255,255,255,0.9)";
  const textPrimary = darkMode ? "#fff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.5)" : "#64748B";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb";

  return (
    <div
      ref={ref}
      className="group rounded-xl p-4 transition-all duration-700 hover:border-[rgba(255,140,0,0.3)]"
      style={{
        background: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: darkMode ? "none" : "0 2px 12px rgba(0,0,0,0.04)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)"
      }}>
      
      <div className="flex flex-col gap-2 mb-2">
        <p className="font-bold text-sm leading-snug break-words" style={{ color: textPrimary }}>{tour.name}</p>
        <span
          className="text-xs font-black self-start px-2.5 py-1 rounded-full break-words max-w-full"
          style={{ background: "rgba(255,140,0,0.1)", color: "#FF8C00", border: "1px solid rgba(255,140,0,0.2)", wordBreak: "break-word" }}>
          
          {tour.price?.split("|")[0]?.trim()}
        </span>
        {tour.price?.includes("|") &&
        <span className="text-[10px]" style={{ color: textMuted }}>
            {tour.price.split("|").slice(1).join("|").trim()}
          </span>
        }
      </div>
      {tour.details &&
      <p className="text-xs leading-relaxed break-words" style={{ color: textMuted }}>{tour.details}</p>
      }
    </div>);

}

export default function PackageDetails({ destination, darkMode, centerPackageTitle = false }) {
  const textPrimary = darkMode ? "#fff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.5)" : "#64748B";
  const cardBg = darkMode ? "rgba(20,20,20,0.8)" : "rgba(255,255,255,0.9)";
  const cardBorder = darkMode ? "rgba(255,255,255,0.07)" : "#e5e7eb";

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10">

      {/* Package Name */}
      <AnimatedCard delay={0}>
        <div
          className="rounded-2xl p-5 sm:p-7 relative overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)"
          }}>
          
          {/* Decorative top strip */}
          <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #FF8C00, transparent)" }} />

          <SectionLabel text="Package Details" centered={centerPackageTitle} />

          <p
            className={`font-black leading-snug break-words ${centerPackageTitle ? "text-center" : ""}`}
            style={{ color: textPrimary, letterSpacing: "-0.02em", fontSize: "clamp(1rem, 3.5vw, 1.5rem)" }}>
            
            {destination.package}
          </p>

          <div className={`flex items-center gap-3 mt-4 ${centerPackageTitle ? "justify-center" : ""}`}>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" fill="none" stroke="#fff" strokeWidth={2} />
              </svg>
              

              
            </div>
            <span className="text-[10px]" style={{ color: textMuted }}>•</span>
            <span className="text-xs" style={{ color: textMuted }}>Philippines</span>
          </div>
        </div>
      </AnimatedCard>

      {/* Hotel Options */}
      {destination.hotelCategories?.length > 0 &&
      <AnimatedCard delay={0.08}>
          <div
          className="rounded-2xl p-5 sm:p-7 relative overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)"
          }}>
          
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #FF8C00, transparent)" }} />

            <div className="flex items-center justify-between mb-6">
              <div>
                <SectionLabel text="Rooms & Rates" />
              </div>
            </div>

            <p className="text-sm mb-5" style={{ color: textMuted }}>Select your preferred accommodation category.</p>

            <div className="space-y-3">
              {destination.hotelCategories.map((cat, i) =>
            <HotelCard key={i} cat={cat} index={i} darkMode={darkMode} />
            )}
            </div>

            <p className="text-[11px] mt-5 leading-relaxed" style={{ color: darkMode ? "rgba(255,255,255,0.25)" : "#94a3b8" }}>
              * All rates are per person. Subject to availability and change without prior notice.
            </p>
          </div>
        </AnimatedCard>
      }

      {/* Optional Tours */}
      {destination.optionalTours?.length > 0 &&
      <AnimatedCard delay={0.12}>
          <div
          className="rounded-2xl p-5 sm:p-7 relative overflow-hidden"
          style={{
            background: cardBg,
            border: `1px solid ${cardBorder}`,
            boxShadow: darkMode ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)"
          }}>
          
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #FF8C00, transparent)" }} />
            <SectionLabel text="Optional Add-Ons" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {destination.optionalTours.map((tour, i) =>
            <OptionalTourCard key={i} tour={tour} darkMode={darkMode} />
            )}
            </div>
          </div>
        </AnimatedCard>
      }

      {/* Important Notes */}
      {destination.notes?.length > 0 &&
      <AnimatedCard delay={0.16}>
          <div
          className="rounded-2xl p-5 sm:p-7 relative overflow-hidden"
          style={{
            background: darkMode ? "rgba(20,14,4,0.85)" : "rgba(255,251,245,0.95)",
            border: `1px solid ${darkMode ? "rgba(255,140,0,0.15)" : "rgba(255,140,0,0.2)"}`,
            boxShadow: darkMode ? "0 4px 24px rgba(255,140,0,0.05)" : "0 4px 24px rgba(255,140,0,0.06)"
          }}>
          
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.6), transparent)" }} />
            <SectionLabel text="Important" />
            <ul className="space-y-3">
              {destination.notes.map((note, i) =>
            <li key={i} className="flex items-start gap-3 text-sm" style={{ color: darkMode ? "rgba(255,255,255,0.65)" : "#374151" }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5" style={{ background: "rgba(255,140,0,0.12)" }}>
                    <svg className="w-3 h-3" fill="#FF8C00" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                    </svg>
                  </span>
                  {note}
                </li>
            )}
            </ul>
          </div>
        </AnimatedCard>
      }
    </div>);

}