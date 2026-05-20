import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { DESTINATIONS } from "@/lib/destinations";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";
import PackageDetails from "@/components/destination/PackageDetails";

function ParallaxBg({ heroImage, opacity, blur }) {
  return (
    <div
      className="absolute inset-0 bg-cover bg-fixed"
      style={{
        backgroundImage: `url('${heroImage}')`,
        backgroundPosition: "center",
        opacity,
        filter: `blur(${blur}px)`,
        transform: "scale(1.08)",
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
      <div className="font-poppins min-h-screen transition-colors duration-300" style={{ background: darkMode ? "#0a0a0a" : "#f8f9fa" }}>
        <DomesticNavbar darkMode={darkMode} setDarkMode={setDarkMode} showBack />

        {/* HERO */}
        <section className="relative overflow-hidden" style={{ height: "55vh", minHeight: "380px" }}>
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${heroImage}')` }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.22) 50%, rgba(0,0,0,0.7) 100%)" }} />
          <div className="relative h-full flex flex-col items-center justify-center text-center px-6 pt-16">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-[1px] w-8" style={{ background: "#FF8C00" }} />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Gladex Travel & Tours</span>
              <div className="h-[1px] w-8" style={{ background: "#FF8C00" }} />
            </div>
            <h1 className="font-black text-white mb-2" style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", letterSpacing: "-0.02em" }}>
              {destination.name}
            </h1>
            <p className="text-sm font-light max-w-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
              {destination.tagline}
            </p>
          </div>
        </section>

        {/* PACKAGE DETAILS */}
        <section className="relative overflow-hidden py-14 px-6">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.12 : 0.07} blur={8} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(10,10,10,0.88)" : "rgba(248,249,250,0.93)" }} />
          <div className="relative z-10">
            <PackageDetails destination={destination} darkMode={darkMode} />
          </div>
        </section>

        {/* CTA FOOTER */}
        <section className="relative overflow-hidden py-16 px-6 text-center">
          <ParallaxBg heroImage={heroImage} opacity={darkMode ? 0.18 : 0.1} blur={12} />
          <div className="absolute inset-0" style={{ background: darkMode ? "rgba(17,17,17,0.88)" : "rgba(243,244,246,0.94)" }} />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
              <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>Explore More</span>
              <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
            </div>
            <h2 className={`font-black text-3xl md:text-4xl mb-3 ${textPrimary}`}>
              Discover All Destinations
            </h2>
            <p className={`text-sm font-light max-w-sm mx-auto mb-8 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
              Browse our full collection of Philippine travel packages.
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