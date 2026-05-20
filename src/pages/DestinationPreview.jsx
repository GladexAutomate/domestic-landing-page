import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DESTINATIONS } from "@/lib/destinations";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";
import VideoPreviewSection from "@/components/destination/VideoPreviewSection";
import PackageHighlights from "@/components/destination/PackageHighlights";
import PackageRates from "@/components/destination/PackageRates";
import ItinerarySection from "@/components/destination/ItinerarySection";
import InclusionsExclusions from "@/components/destination/InclusionsExclusions";
import RequirementsNotes from "@/components/destination/RequirementsNotes";

// Shared parallax background layer used across all sections
function ParallaxBg({ heroImage, opacity, blur }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-fixed"
      style={{
        backgroundImage: `url('${heroImage}')`,
        backgroundPosition: "center",
        opacity,
        filter: `blur(${blur}px)`,
        transform: "scale(1.08)", // prevents white edges from blur
      }}
    />
  );
}

export default function DestinationPreview() {
  const { slug } = useParams();
  const [darkMode, setDarkMode] = useState(false);

  const destination = DESTINATIONS.find((d) => d.slug === slug) || DESTINATIONS[0];
  const heroImage = destination.hero;

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="font-poppins min-h-screen transition-colors duration-300" style={{ background: darkMode ? "#0a0a0a" : "#ffffff" }}>
        <DomesticNavbar darkMode={darkMode} setDarkMode={setDarkMode} showBack />

        {/* ── SECTION 1: CINEMATIC HERO ── */}
        <section className="relative overflow-hidden" style={{ height: "58vh", minHeight: "400px" }}>
          {/* Full vivid image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${heroImage}')` }}
          />
          {/* Minimal overlay — image is the star */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.25) 50%, rgba(0,0,0,0.65) 100%)" }} />

          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-16">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Official Travel Preview</span>
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            </div>
            <h1 className="font-black text-white mb-3" style={{ fontSize: "clamp(2.2rem, 6vw, 5rem)", letterSpacing: "-0.02em" }}>
              Experience {destination.name}
            </h1>
            <div className="flex items-center gap-1.5 mb-3">
              <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg>
              <span className="text-sm font-medium text-white/85">Philippines</span>
            </div>
            <p className="text-base font-light max-w-md" style={{ color: "rgba(255,255,255,0.68)" }}>
              {destination.tagline}
            </p>
          </div>
        </section>

        {/* ── SECTION 2+3: VIDEO PREVIEW ── */}
        <section className="relative overflow-hidden py-14 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.2 : 0.15} blur={3} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(10,10,10,0.82)" : "rgba(255,255,255,0.85)" }} />
          <div className="relative z-10">
            <VideoPreviewSection destination={destination} darkMode={darkMode} noPadding />
          </div>
        </section>

        {/* ── SECTION 4: PACKAGE HIGHLIGHTS ── */}
        <section className="relative overflow-hidden py-20 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.22 : 0.09} blur={6} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(17,17,17,0.78)" : "rgba(255,255,255,0.91)" }} />
          <div className="relative z-10">
            <PackageHighlights darkMode={darkMode} noPadding />
          </div>
        </section>

        {/* ── SECTION 5: PACKAGE RATES ── */}
        <section className="relative overflow-hidden py-20 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.25 : 0.15} blur={5} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(0,0,0,0.8)" : "rgba(10,10,10,0.88)" }} />
          <div className="relative z-10">
            <PackageRates destination={destination} noPadding />
          </div>
        </section>

        {/* ── SECTION 6: ITINERARY ── */}
        <section className="relative overflow-hidden py-20 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.18 : 0.07} blur={8} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(10,10,10,0.82)" : "rgba(255,255,255,0.93)" }} />
          <div className="relative z-10">
            <ItinerarySection destination={destination} darkMode={darkMode} noPadding />
          </div>
        </section>

        {/* ── SECTION 7: INCLUSIONS & EXCLUSIONS ── */}
        <section className="relative overflow-hidden py-20 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.15 : 0.06} blur={10} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(17,17,17,0.85)" : "rgba(248,249,250,0.94)" }} />
          <div className="relative z-10">
            <InclusionsExclusions darkMode={darkMode} noPadding />
          </div>
        </section>

        {/* ── SECTION 8: REQUIREMENTS & NOTES ── */}
        <section className="relative overflow-hidden py-20 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.12 : 0.05} blur={12} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(10,10,10,0.88)" : "rgba(255,255,255,0.95)" }} />
          <div className="relative z-10">
            <RequirementsNotes darkMode={darkMode} noPadding />
          </div>
        </section>

        {/* ── SECTION 9: EXPLORE MORE CTA ── */}
        <section className="relative overflow-hidden py-20 px-6 text-center">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.2 : 0.1} blur={15} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(17,17,17,0.82)" : "rgba(243,244,246,0.92)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Ready to Travel?</span>
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            </div>
            <h2 className={`font-black text-4xl md:text-5xl mb-3 ${textPrimary}`}>
              Explore More Destinations
            </h2>
            <p className={`text-sm font-light max-w-sm mx-auto mb-8 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
              Discover our full collection of domestic Philippine travel experiences.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide uppercase text-white transition-all hover:scale-105"
              style={{ background: "#FF8C00", boxShadow: "0 8px 28px rgba(255,140,0,0.45)" }}
            >
              ← Back to All Destinations
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}