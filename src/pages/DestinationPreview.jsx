import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import VideoSection from "@/components/destination/VideoSection";
import ItinerarySection from "@/components/destination/ItinerarySection";
import InclusionsExclusionsSection from "@/components/destination/InclusionsExclusionsSection";
import PackageDetails from "@/components/destination/PackageDetails";

export default function DestinationPreview() {
  const { slug } = useParams();
  const [darkMode, setDarkMode] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);

  const destination = DESTINATIONS.find((d) => d.slug === slug) || DESTINATIONS[0];
  const heroImage = destination.hero;

  useEffect(() => { window.scrollTo(0, 0); setHeroLoaded(false); setTimeout(() => setHeroLoaded(true), 80); }, [slug]);

  return (
    <div className="font-poppins min-h-screen" style={{ background: darkMode ? "#0a0a0a" : "#f8f9fa" }}>
      <DestinationNavbar darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* HERO */}
      <section className="relative overflow-hidden" style={{ height: "60vh", minHeight: "400px" }}>
        {/* Ken Burns bg */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImage}')`,
            animation: "kenburns 10s ease-out forwards",
          }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.75) 100%)" }} />

        <div
          className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-16 transition-all duration-1000"
          style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)" }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-[1px] w-8" style={{ background: "#FF8C00" }} />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Official Travel Preview</span>
            <div className="h-[1px] w-8" style={{ background: "#FF8C00" }} />
          </div>
          <h1
            className="font-black text-white mb-2 transition-all duration-700"
            style={{
              fontSize: "clamp(2.2rem, 7vw, 5rem)",
              letterSpacing: "-0.02em",
              transitionDelay: "0.2s",
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(16px)",
            }}
          >
            Experience {destination.name}
          </h1>
          <div className="flex items-center gap-1.5 mb-2" style={{ transitionDelay: "0.35s" }}>
            <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.8)" }}>Philippines</span>
          </div>
          <p
            className="text-sm font-light max-w-sm transition-all duration-700"
            style={{ color: "rgba(255,255,255,0.6)", transitionDelay: "0.45s", opacity: heroLoaded ? 1 : 0 }}
          >
            {destination.tagline}
          </p>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <VideoSection destination={destination} />

      {/* INCLUSIONS & EXCLUSIONS */}
      <InclusionsExclusionsSection destination={destination} darkMode={darkMode} />

      {/* ITINERARY */}
      <ItinerarySection destination={destination} darkMode={darkMode} />

      {/* HOTEL OPTIONS, OPTIONAL TOURS, NOTES */}
      <section className="py-14 px-6" style={{ background: darkMode ? "#0d0d0d" : "#fff" }}>
        <PackageDetails destination={destination} darkMode={darkMode} />
      </section>

      {/* CTA FOOTER */}
      <section className="py-16 px-6 text-center" style={{ background: darkMode ? "#111" : "#F5F5F5" }}>
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Explore More</span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className="font-black text-3xl md:text-4xl mb-3" style={{ color: darkMode ? "#fff" : "#0F172A" }}>
          Discover All Destinations
        </h2>
        <p className="text-sm font-light max-w-sm mx-auto mb-8" style={{ color: darkMode ? "rgba(255,255,255,0.5)" : "#64748B" }}>
          Browse our full collection of Philippine travel packages.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide uppercase text-white transition-all hover:scale-105 hover:shadow-2xl"
          style={{ background: "#FF8C00", boxShadow: "0 8px 28px rgba(255,140,0,0.4)", animation: "ctaPulse 3s ease-in-out infinite" }}
        >
          ← Back to All Destinations
        </Link>
      </section>

      <style>{`
        @keyframes kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.06); }
        }
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 8px 28px rgba(255,140,0,0.4); }
          50% { box-shadow: 0 8px 40px rgba(255,140,0,0.7); }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation: none !important; transition: none !important; }
        }
      `}</style>
    </div>
  );
}