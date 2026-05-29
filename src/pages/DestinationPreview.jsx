import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { DESTINATIONS } from "@/lib/destinations";
import { useTheme } from "@/lib/ThemeContext";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import VideoSection from "@/components/destination/VideoSection";
import ItinerarySection from "@/components/destination/ItinerarySection";
import InclusionsExclusionsSection from "@/components/destination/InclusionsExclusionsSection";
import PackageDetails from "@/components/destination/PackageDetails";
import NotesSection from "@/components/destination/NotesSection";

export default function DestinationPreview() {
  const { slug } = useParams();
  const { darkMode } = useTheme();
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [packageLoaded, setPackageLoaded] = useState(false);

  const destination = DESTINATIONS.find((d) => d.slug === slug) || DESTINATIONS[0];
  const heroImage = destination.hero;

  useEffect(() => {
    window.scrollTo(0, 0);
    setHeroLoaded(false);
    setPackageLoaded(false);
    const t1 = setTimeout(() => setHeroLoaded(true), 80);
    const t2 = setTimeout(() => setPackageLoaded(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [slug]);

  // Theme tokens
  const bg = darkMode ? "#0a0a0a" : "#f8f9fa";
  const cardBg = darkMode ? "#000" : "#ffffff";
  const cardBg2 = darkMode ? "#0d0d0d" : "#ffffff";
  const sectionBg2 = darkMode ? "linear-gradient(180deg, #0d0d0d 0%, #111 100%)" : "linear-gradient(180deg, #f0f2f5 0%, #e8ecf0 100%)";
  const textPrimary = darkMode ? "#ffffff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.4)" : "#64748B";
  const borderColor = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)";
  const infoBarBg = darkMode ? "linear-gradient(180deg, #000 0%, #0d0d0d 100%)" : "linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)";
  const pillBg = darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const pillColor = darkMode ? "rgba(255,255,255,0.6)" : "#374151";
  const pillBorder = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const ctaBg = darkMode ? "linear-gradient(180deg, #0a0a0a 0%, #000 100%)" : "linear-gradient(180deg, #f0f2f5 0%, #e8ecf0 100%)";

  return (
    <div
      className="font-poppins min-h-screen transition-colors duration-500"
      style={{ background: bg }}
    >
      <DestinationNavbar />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ height: "100vh", minHeight: "560px" }}>
        {/* Ken Burns background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImage}')`,
            animation: "heroKenBurns 14s ease-out forwards",
          }}
        />
        {/* Multi-layer gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: darkMode
              ? "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)"
              : "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0.75) 100%)",
          }}
        />
        {/* Side vignettes */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(90deg, rgba(0,0,0,0.25) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.25) 100%)",
          }}
        />
        {/* Orange accent glow */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{ height: "200px", background: "linear-gradient(to top, rgba(255,140,0,0.06) 0%, transparent 100%)" }}
        />
        {/* Bottom border */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: "linear-gradient(90deg, transparent 0%, #FF8C00 30%, #FF6B00 50%, #FF8C00 70%, transparent 100%)" }}
        />

        {/* Content */}
        <div
          className="relative h-full flex flex-col items-center justify-end text-center px-6 pb-20 transition-all duration-1000"
          style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)" }}
        >
          <div className="flex items-center gap-3 mb-5" style={{ opacity: heroLoaded ? 1 : 0, transition: "opacity 1s 0.3s" }}>
            <div className="h-[1px]" style={{ width: "48px", background: "linear-gradient(90deg, transparent, #FF8C00)" }} />
            <span className="text-[10px] font-bold tracking-[0.45em] uppercase" style={{ color: "#FF8C00" }}>
              Official Travel Preview
            </span>
            <div className="h-[1px]" style={{ width: "48px", background: "linear-gradient(90deg, #FF8C00, transparent)" }} />
          </div>

          <h1
            className="font-black text-white mb-4"
            style={{
              fontSize: "clamp(3rem, 9vw, 7rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
              textShadow: "0 4px 60px rgba(0,0,0,0.6)",
              fontStyle: "italic",
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "opacity 0.9s 0.2s, transform 0.9s 0.2s",
            }}
          >
            Experience {destination.name}
          </h1>

          <div className="flex items-center gap-2 mb-4" style={{ opacity: heroLoaded ? 1 : 0, transition: "opacity 0.8s 0.45s" }}>
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <svg className="w-3.5 h-3.5" fill="#FF8C00" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
              </svg>
              <span className="text-xs font-semibold text-white/90">Philippines</span>
            </div>
          </div>

          <p
            className="text-sm font-light max-w-sm mx-auto"
            style={{
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              letterSpacing: "0.03em",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 0.8s 0.55s",
            }}
          >
            {destination.tagline}
          </p>

          <div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            style={{ opacity: heroLoaded ? 0.6 : 0, transition: "opacity 1s 1.2s" }}
          >
            <div className="w-6 h-10 rounded-full flex items-start justify-center pt-1.5" style={{ border: "1.5px solid rgba(255,255,255,0.3)" }}>
              <div style={{ width: "4px", height: "10px", borderRadius: "2px", background: "rgba(255,255,255,0.7)", animation: "heroScrollDot 1.8s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ─── PACKAGE INFO BAR ────────────────────────────────── */}
      <section
        className="relative transition-colors duration-500"
        style={{ background: infoBarBg, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.3), transparent)" }} />
        <div
          className="max-w-5xl mx-auto px-6 py-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 transition-all duration-700"
          style={{ opacity: packageLoaded ? 1 : 0, transform: packageLoaded ? "translateY(0)" : "translateY(16px)" }}
        >
          <div>
            <h2
              className="font-black mb-2 transition-colors duration-500"
              style={{ color: textPrimary, fontSize: "clamp(1.3rem, 3vw, 2rem)", letterSpacing: "-0.02em", lineHeight: 1.2 }}
            >
              {destination.package}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "rgba(255,140,0,0.1)", color: "#FF8C00", border: "1px solid rgba(255,140,0,0.2)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {destination.itinerary?.length ? `${destination.itinerary.length} Days` : "Multi-Day"} Package
              </span>
              <span
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                style={{ background: pillBg, color: pillColor, border: `1px solid ${pillBorder}` }}
              >
                🇵🇭 Philippines
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: textMuted }}>Travel Dates</p>
            <p className="text-sm font-medium" style={{ color: darkMode ? "rgba(255,255,255,0.7)" : "#374151" }}>Inquire for available dates</p>
          </div>
        </div>
      </section>

      {/* ─── VIDEO SECTION ───────────────────────────────────── */}
      <VideoSection destination={destination} darkMode={darkMode} />

      {/* ─── PACKAGE DETAILS / RATES / TOURS ─────────────────── */}
      <section className="py-20 px-6 transition-colors duration-500" style={{ background: sectionBg2 }}>
        <PackageDetails destination={destination} darkMode={darkMode} centerPackageTitle={true} />
      </section>

      {/* ─── INCLUSIONS & EXCLUSIONS ──────────────────────────── */}
      <InclusionsExclusionsSection destination={destination} darkMode={darkMode} />

      {/* ─── NOTES ───────────────────────────────────────────── */}
      <NotesSection destination={destination} darkMode={darkMode} />

      {/* ─── ITINERARY ───────────────────────────────────────── */}
      <ItinerarySection destination={destination} darkMode={darkMode} />

      {/* ─── CTA FOOTER ──────────────────────────────────────── */}
      <section
        className="relative py-24 px-6 text-center overflow-hidden transition-colors duration-500"
        style={{ background: ctaBg }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,140,0,0.06) 0%, transparent 70%)" }} />
        <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,140,0,0.3), transparent)" }} />

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-4 mb-5">
            <div className="h-[1px] w-12" style={{ background: "linear-gradient(90deg, transparent, #FF8C00)" }} />
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase" style={{ color: "#FF8C00" }}>Ready to Explore?</span>
            <div className="h-[1px] w-12" style={{ background: "linear-gradient(90deg, #FF8C00, transparent)" }} />
          </div>

          <h2
            className="font-black mb-4 transition-colors duration-500"
            style={{ color: textPrimary, fontSize: "clamp(1.8rem, 5vw, 3.2rem)", letterSpacing: "-0.03em", fontStyle: "italic", lineHeight: 1.1 }}
          >
            Discover More Destinations
          </h2>
          <p className="text-sm font-light max-w-sm mx-auto mb-10" style={{ color: textMuted, lineHeight: 1.8 }}>
            Browse our full collection of Philippine travel experiences.
          </p>

          <Link
            to="/"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase text-white transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF8C00 0%, #FF6B00 100%)",
              boxShadow: "0 8px 40px rgba(255,140,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)",
              letterSpacing: "0.15em",
              animation: "ctaGlow 3s ease-in-out infinite",
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to All Destinations
          </Link>
        </div>
      </section>

      <style>{`
        @keyframes heroKenBurns { from { transform: scale(1); } to { transform: scale(1.08); } }
        @keyframes heroScrollDot { 0%, 100% { transform: translateY(0); opacity: 0.6; } 50% { transform: translateY(8px); opacity: 1; } }
        @keyframes ctaGlow {
          0%, 100% { box-shadow: 0 8px 40px rgba(255,140,0,0.35), 0 0 0 1px rgba(255,255,255,0.1); }
          50% { box-shadow: 0 12px 60px rgba(255,140,0,0.55), 0 0 0 1px rgba(255,255,255,0.15); }
        }
      `}</style>
    </div>
  );
}