// @ts-nocheck
import { useTheme } from "@/lib/ThemeContext";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import TBWelcomeSection from "@/components/travelbriefing/TBWelcomeSection";

export default function TravelBriefingHome() {
  const { darkMode } = useTheme();

  const bg = darkMode ? "#0c0c0c" : "#f4f3f1";

  return (
    <div className="min-h-screen" style={{ backgroundColor: bg }}>
      <DestinationNavbar />
      <TBWelcomeSection darkMode={darkMode} compact={false} />
    </div>
  );
}
