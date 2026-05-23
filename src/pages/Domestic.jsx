import { useRef, useState } from "react";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";
import DomesticHero from "@/components/domestic/DomesticHero";
import DomesticDestinations from "@/components/domestic/DomesticDestinations";
import BoracayVideoSection from "@/components/domestic/BoracayVideoSection";

export default function Domestic() {
  const [darkMode, setDarkMode] = useState(true);
  const destinationsRef = useRef(null);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="font-poppins min-h-screen transition-colors duration-300" style={{ background: darkMode ? "#0a0a0a" : "#f5f5f5" }}>
        <DomesticNavbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <DomesticHero />
        <BoracayVideoSection darkMode={darkMode} />
        <div ref={destinationsRef}>
          <DomesticDestinations darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}