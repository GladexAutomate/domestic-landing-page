import { useEffect, useRef, useState } from "react";
import { DESTINATIONS } from "@/lib/destinations";
import DestinationCard from "@/components/domestic/DestinationCard";

export default function DomesticDestinations({ darkMode }) {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={`py-20 px-6 transition-colors duration-300 ${darkMode ? "bg-[#0a0a0a]" : "bg-white"}`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="h-[1px] w-16" style={{ background: "rgba(255,140,0,0.5)" }} />
          <span className="text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: "#FF8C00" }}>
            Domestic Destinations
          </span>
          <div className="h-[1px] w-16" style={{ background: "rgba(255,140,0,0.5)" }} />
        </div>
        <h2
          className={`text-center font-black text-4xl md:text-5xl mb-3 ${darkMode ? "text-white" : "text-[#0F172A]"}`}
          style={{ letterSpacing: "-0.02em" }}
        >
          Where Do You Want to Go?
        </h2>
        <p className={`text-center text-sm font-light max-w-lg mx-auto mb-14 ${darkMode ? "text-white/50" : "text-[#64748B]"}`}>
          Explore the most breathtaking destinations across the Philippine archipelago.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {DESTINATIONS.map((dest, i) => (
            <DestinationCard
              key={dest.slug}
              destination={dest}
              delay={Math.min(i * 40, 600)}
              visible={visible}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </section>
  );
}