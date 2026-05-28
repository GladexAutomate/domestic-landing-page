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
  const [heroLoaded, setHeroLoaded] = useState(false);

  const destination = DESTINATIONS.find((d) => d.slug === slug) || DESTINATIONS[0];
  const heroImage = destination.hero;

  useEffect(() => {
    window.scrollTo(0, 0);
    setHeroLoaded(false);
    setTimeout(() => setHeroLoaded(true), 80);
  }, [slug]);

  return (
    <div className="font-poppins min-h-screen bg-white">
      <DestinationNavbar />

      {/* HERO — full viewport height, image fills, text centered in lower half */}
      <section className="relative overflow-hidden" style={{ height: "100vh", minHeight: "500px" }}>
        {/* Ken Burns bg */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${heroImage}')`,
            animation: "kenburns 12s ease-out forwards"
          }} />
        
        {/* Gradient — heavier at bottom where text sits */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.65) 70%, rgba(0,0,0,0.82) 100%)" }} />
        

        {/* Centered text — lower half of hero */}
        <div
          className="relative h-full flex flex-col items-center justify-end text-center px-6 pb-20 transition-all duration-1000"
          style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? "translateY(0)" : "translateY(20px)" }}>
          
          {/* Label */}
          <div className="flex items-center gap-3 mb-4">
            <div className="h-[1px] w-12" style={{ background: "#FF8C00" }} />
            <span className="text-[11px] font-bold tracking-[0.35em] uppercase" style={{ color: "#FF8C00" }}>
              Official Travel Preview
            </span>
            <div className="h-[1px] w-12" style={{ background: "#FF8C00" }} />
          </div>

          {/* Title */}
          <h1
            className="font-black text-white mb-3"
            style={{
              fontSize: "clamp(2.8rem, 8vw, 6rem)",
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              textShadow: "0 4px 40px rgba(0,0,0,0.5)",
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.8s 0.2s, transform 0.8s 0.2s"
            }}>
            
            Experience {destination.name}
          </h1>

          {/* Location */}
          <div className="flex items-center gap-1.5 mb-3">
            <svg className="w-4 h-4" fill="#FF8C00" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
            </svg>
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.85)" }}>Philippines</span>
          </div>

          {/* Tagline */}
          <p
            className="text-sm font-light max-w-sm"
            style={{
              color: "rgba(255,255,255,0.65)",
              opacity: heroLoaded ? 1 : 0,
              transition: "opacity 0.8s 0.45s"
            }}>
            
            {destination.tagline}
          </p>
        </div>
      </section>

      {/* PACKAGE INFO BAR — white strip below hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h2 className="font-black text-2xl md:text-3xl text-[#0F172A] mb-1">{destination.package}</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm font-medium text-[#FF8C00]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {destination.itinerary?.length ? `${destination.itinerary.length} Days` : "Multi-Day"} Package
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* VIDEO SECTION */}
      <VideoSection destination={destination} />

      {/* EXTRA GRAY SPACE */}
      

      {/* HOTEL OPTIONS, OPTIONAL TOURS, NOTES */}
      <section className="py-14 px-6 bg-[#f9fafb]">
        <PackageDetails destination={destination} darkMode={false} centerPackageTitle={true} />
      </section>

      {/* INCLUSIONS & EXCLUSIONS */}
      <InclusionsExclusionsSection destination={destination} darkMode={false} />

      {/* ITINERARY */}
      <ItinerarySection destination={destination} darkMode={false} />

      {/* CTA FOOTER */}
      <section className="py-16 px-6 text-center bg-[#F5F5F5]">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
          <span className="text-[11px] font-bold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            — Ready to Explore? —
          </span>
          <div className="h-[1px] w-10" style={{ background: "#FF8C00" }} />
        </div>
        <h2 className="font-black text-3xl md:text-4xl mb-3 text-[#0F172A]">
          Discover More Destinations
        </h2>
        <p className="text-sm font-light max-w-sm mx-auto mb-8 text-[#64748B]">
          Browse our full collection of Philippine travel packages.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-bold text-sm tracking-wide uppercase text-white transition-all hover:scale-105 hover:shadow-2xl"
          style={{ background: "#FF8C00", boxShadow: "0 8px 28px rgba(255,140,0,0.4)", animation: "ctaPulse 3s ease-in-out infinite" }}>
          
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
      `}</style>
    </div>);

}