import { useRef, useState } from "react";
import DomesticHero from "@/components/domestic/DomesticHero";
import DomesticDestinations from "@/components/domestic/DomesticDestinations";
import DarkModeToggle from "@/components/ui/DarkModeToggle";

export default function Domestic() {
  const [darkMode, setDarkMode] = useState(true);
  const destinationsRef = useRef(null);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="font-poppins bg-white dark:bg-[#0a0a0a] min-h-screen transition-colors duration-300">
        <DarkModeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        <DomesticHero darkMode={darkMode} setDarkMode={setDarkMode} />
        <div ref={destinationsRef}>
          <DomesticDestinations darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}