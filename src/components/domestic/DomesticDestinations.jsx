import { useEffect, useRef, useState } from "react";
import DestinationCard from "@/components/domestic/DestinationCard";

const PLACEHOLDER_CARDS = [
  { id: 1, delay: 0 },
  { id: 2, delay: 50 },
  { id: 3, delay: 100 },
  { id: 4, delay: 150 },
  { id: 5, delay: 200 },
  { id: 6, delay: 250 },
  { id: 7, delay: 300 },
  { id: 8, delay: 350 },
];

export default function DomesticDestinations() {
  const sectionRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-white py-24 lg:py-32 px-6"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Label */}
        <div className="flex items-center justify-center gap-4 mb-5">
          <div
            className="h-[1px] w-16 hidden sm:block"
            style={{ background: "rgba(255,107,0,0.4)" }}
          />
          <span
            className="text-xs font-semibold tracking-[0.3em] uppercase"
            style={{ color: "#FF6B00" }}
          >
            Our Destinations
          </span>
          <div
            className="h-[1px] w-16 hidden sm:block"
            style={{ background: "rgba(255,107,0,0.4)" }}
          />
        </div>

        {/* Section Title */}
        <h2
          className="text-center font-black text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight"
          style={{ color: "#0F172A", letterSpacing: "-0.02em" }}
        >
          Where Do You Want to Go?
        </h2>

        {/* Subtitle */}
        <p
          className="text-center text-base font-light max-w-xl mx-auto mb-16 leading-relaxed"
          style={{ color: "#64748B" }}
        >
          Discover the most breathtaking destinations across the Philippine archipelago.
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLACEHOLDER_CARDS.map((card) => (
            <DestinationCard
              key={card.id}
              delay={card.delay}
              visible={visible}
            />
          ))}
        </div>
      </div>
    </section>
  );
}