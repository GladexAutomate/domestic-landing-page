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

export default function DestinationPreview() {
  const { slug } = useParams();
  const [darkMode, setDarkMode] = useState(false);

  const destination = DESTINATIONS.find((d) => d.slug === slug) || DESTINATIONS[0];

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const bg = darkMode ? "bg-[#0a0a0a]" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-[#0F172A]";

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className={`font-poppins min-h-screen transition-colors duration-300 ${bg}`}>
        <DomesticNavbar darkMode={darkMode} setDarkMode={setDarkMode} showBack />

        {/* SECTION 1 — Cinematic Hero */}
        <section className="relative overflow-hidden" style={{ height: "55vh", minHeight: "380px" }}>
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url('${destination.hero}')` }}
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(5,5,5,0.5) 0%, rgba(5,5,5,0.72) 100%)" }} />
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
              <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
              <span className="text-sm font-medium text-white/80">Philippines</span>
            </div>
            <p className="text-base font-light max-w-md" style={{ color: "rgba(255,255,255,0.65)" }}>
              {destination.tagline}
            </p>
          </div>
        </section>

        {/* SECTION 2+3 — Video Preview */}
        <VideoPreviewSection destination={destination} darkMode={darkMode} />

        {/* SECTION 4 — Package Highlights */}
        <PackageHighlights darkMode={darkMode} />

        {/* SECTION 5 — Package Rates */}
        <PackageRates destination={destination} />

        {/* SECTION 6 — Itinerary */}
        <ItinerarySection destination={destination} darkMode={darkMode} />

        {/* SECTION 7 — Inclusions & Exclusions */}
        <InclusionsExclusions darkMode={darkMode} />

        {/* SECTION 8 — Requirements & Notes */}
        <RequirementsNotes darkMode={darkMode} />

        {/* SECTION 9 — Explore More CTA */}
        <section className={`py-20 px-6 text-center ${darkMode ? "bg-[#111]" : "bg-[#f3f4f6]"}`}>
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
            style={{ background: "#FF8C00", boxShadow: "0 8px 28px rgba(255,140,0,0.4)" }}
          >
            ← Back to All Destinations
          </Link>
        </section>
      </div>
    </div>
  );
}