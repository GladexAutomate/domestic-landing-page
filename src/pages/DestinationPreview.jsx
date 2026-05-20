import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DESTINATIONS } from "@/lib/destinations";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";
import VideoPreviewSection from "@/components/destination/VideoPreviewSection";
import DestinationHighlights from "@/components/destination/DestinationHighlights";
import DestinationRequirements from "@/components/destination/DestinationRequirements";

export default function DestinationPreview() {
  const { slug } = useParams();
  const [darkMode, setDarkMode] = useState(true);

  const destination = DESTINATIONS.find(
    (d) => d.slug === slug
  ) || DESTINATIONS[0];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="font-poppins bg-white dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300">
        <DomesticNavbar darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* Hero Banner */}
        <section className="relative pt-20" style={{ height: "60vh", minHeight: "420px" }}>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              background: "linear-gradient(135deg, #0f172a 0%, #1e1a14 50%, #0f172a 100%)",
            }}
          />
          <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.7) 100%)"
          }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
              <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
                Official Travel Preview
              </span>
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            </div>
            <h1 className="font-black text-white mb-3" style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.02em" }}>
              Experience {destination.name}
            </h1>
            <p className="text-base font-light max-w-lg" style={{ color: "rgba(248,250,252,0.65)" }}>
              Watch our exclusive cinematic preview and feel the destination before you arrive.
            </p>
          </div>
        </section>

        {/* Video Preview */}
        <VideoPreviewSection destination={destination} darkMode={darkMode} />

        {/* Highlights */}
        <DestinationHighlights destination={destination} darkMode={darkMode} />

        {/* Requirements & Notes */}
        <DestinationRequirements destination={destination} darkMode={darkMode} />

        {/* Explore CTA */}
        <section className={`py-24 px-6 text-center ${darkMode ? "bg-[#111]" : "bg-[#faf9f7]"}`}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
              Ready to Travel?
            </span>
            <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          </div>
          <h2 className={`font-black text-4xl md:text-5xl mb-2 ${darkMode ? "text-white" : "text-[#0F172A]"}`}>
            Explore {destination.name}
          </h2>
          <p className="text-4xl md:text-5xl font-black mb-6" style={{ color: "#FF8C00" }}>
            Philippines
          </p>
          <p className={`text-base font-light max-w-md mx-auto mb-10 ${darkMode ? "text-white/60" : "text-[#64748B]"}`}>
            A cinematic travel experience awaits in one of the Philippines' most breathtaking destinations.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-sm tracking-widest uppercase text-white transition-all hover:scale-105"
            style={{ background: "#FF8C00", boxShadow: "0 8px 32px rgba(255,140,0,0.35)" }}
          >
            ← Back to All Destinations
          </Link>
        </section>
      </div>
    </div>
  );
}