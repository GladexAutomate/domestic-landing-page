import { useRef } from "react";
import DomesticHero from "@/components/domestic/DomesticHero";
import DomesticDestinations from "@/components/domestic/DomesticDestinations";
import { useTheme } from "@/lib/ThemeContext";

export default function Domestic() {
  const { darkMode } = useTheme();
  const destinationsRef = useRef(null);

  return (
    <div
      className="font-poppins min-h-screen transition-colors duration-500"
      style={{ background: darkMode ? "#0a0a0a" : "#f8f9fa" }}
    >
      <DomesticHero />
      <div ref={destinationsRef}>
        <DomesticDestinations darkMode={darkMode} />
      </div>
    </div>
  );
}