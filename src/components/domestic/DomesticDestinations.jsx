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
      className="py-20 px-6 transition-colors duration-300"
      style={{ background: darkMode ? "#0a0a0a" : "#f5f5f5" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div className="h-[1px] w-12" style={{ background: "rgba(255,140,0,0.6)" }} />
          <span className="text-[10px] font-bold tracking-[0.35em] uppercase" style={{ color: "#FF8C00" }}>
            — Domestic Destinations —
          </span>
          <div className="h-[1px] w-12" style={{ background: "rgba(255,140,0,0.6)" }} />
        </div>

        <h2
          className="text-center font-black mb-3"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            letterSpacing: "-0.02em",
            color: darkMode ? "#fff" : "#0F172A",
          }}
        >
          Where Do You Want To Go?
        </h2>

        <p
          className="text-center text-sm font-light max-w-md mx-auto mb-14"
          style={{ color: darkMode ? "rgba(255,255,255,0.45)" : "#64748B" }}
        >
          Explore the most breathtaking destinations across the Philippine archipelago.
        </p>

        {/* Grid — matches international page layout */}
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