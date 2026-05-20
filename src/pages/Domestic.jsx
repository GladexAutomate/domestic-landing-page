import { useEffect, useRef, useState } from "react";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";
import DomesticHero from "@/components/domestic/DomesticHero";
import DomesticDestinations from "@/components/domestic/DomesticDestinations";

export default function Domestic() {
  const destinationsRef = useRef(null);

  const scrollToDestinations = () => {
    if (destinationsRef.current) {
      const top = destinationsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className="font-poppins bg-white min-h-screen">
      <DomesticNavbar />
      <DomesticHero onBrowse={scrollToDestinations} />
      <div ref={destinationsRef}>
        <DomesticDestinations />
      </div>
    </div>
  );
}