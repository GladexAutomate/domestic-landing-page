import { useRef, useState } from "react";
import DomesticNavbar from "@/components/domestic/DomesticNavbar";
import DomesticHero from "@/components/domestic/DomesticHero";
import DomesticDestinations from "@/components/domestic/DomesticDestinations";

export default function Domestic() {
  const [darkMode, setDarkMode] = useState(true);
  const destinationsRef = useRef(null);

  const scrollToDestinations = () => {
    if (destinationsRef.current) {
      const top = destinationsRef.current.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="font-poppins bg-white dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300">
        <DomesticNavbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <DomesticHero darkMode={darkMode} />
        <div ref={destinationsRef}>
          <DomesticDestinations darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}