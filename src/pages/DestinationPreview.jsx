import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import { 
  Search, ChevronRight, Download, FileText, ArrowLeft, 
  PlaneLanding, Truck, Hotel, Compass, CheckSquare, 
  Briefcase, Sparkles, ShoppingCart, Check, Image as ImageIcon
} from "lucide-react";

export default function DestinationPreview() {
  const { slug } = useParams();
  const { darkMode } = useTheme();
  
  const [searchID, setSearchID] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTours, setSelectedTours] = useState({});

  const [checklist, setChecklist] = useState({
    id: true, voucher: true, flight: false, hotel: false, cash: false, data: false
  });

  // Klook "What to Expect" Data Structure (Base sa image_41b964.jpg at image_41b99c.jpg)
  const itineraryHighlights = [
    { 
      url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80", 
      caption: "Book this Boracay package to embark on an exhilarating adventure that will take you to the island's best locations!" 
    },
    { 
      url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=1200&auto=format&fit=crop&q=80", 
      caption: "Relax by the shores of the likes of Diniwid Beach and marvel at the breathtaking sceneries surrounding you." 
    },
    { 
      url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&auto=format&fit=crop&q=80", 
      caption: "The tours come with a mouthwatering seafood and BBQ buffet that your group can delight in during lunch at the island." 
    }
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  const bg = darkMode ? "#0a0a0a" : "#f8f9fa";
  const cardBg = darkMode ? "#000000" : "#ffffff";
  const textPrimary = darkMode ? "#ffffff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.4)" : "#64748B";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  const tourTotal = Object.values(selectedTours).reduce((sum, item) => sum + item.price, 0);

  const toggleTour = (id, title, price) => {
    setSelectedTours(prev => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; } 
      else { next[id] = { title, price }; }
      return next;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchID.trim()) {
      alert("Mangyaring magpasok ng GDX Confirmation Number o Tour Voucher Number.");
      return;
    }
    setHasSearched(true);
  };

  return (
    <div className="font-poppins min-h-screen transition-colors duration-500 pb-24" style={{ background: bg, color: textPrimary }}>
      <DestinationNavbar />

      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] sm:text-xs py-2.5 px-4 text-center font-bold tracking-wider uppercase shadow-sm">
        ✨ Automated Travel Onboarding Hub — Available 24/7 After Your Confirmed Payment
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-6 sm:mt-10">
        
        <div className="flex justify-end mb-4 sm:mb-6">
          <Link to="/" className="text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 border px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 hover:scale-105 active:scale-95" style={{ borderColor: borderColor, color: textPrimary }}>
            <ArrowLeft className="w-3.5 h-3.5 text-orange-500" /> Back to Domestic
          </Link>
        </div>

        {/* 1. Lookup Form / Verification Engine */}
        <section className="border rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl text-center mb-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,140,0,0.04)_0%,transparent_70%)] animate-pulse" />
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] uppercase text-orange-500">Verification Engine</span>
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>

          <h1 className="text-xl sm:text-3xl md:text-4xl font-black mb-3 tracking-tight italic">Your Trip Is Confirmed!</h1>
          <p className="text-[11px] sm:text-xs md:text-sm max-w-md mx-auto mb-6 leading-relaxed" style={{ color: textMuted }}>
            Enter your GDX Confirmation Number or Tour Voucher Number to access your personalized travel briefing, vouchers, reminders, optional tours, and add ons.
          </p>
          
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 relative z-10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 sm:top-4 text-slate-400" />
              <input 
                type="text" 
                value={searchID}
                onChange={(e) => setSearchID(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-xs sm:text-sm bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100" 
                placeholder="Enter GDX / Voucher Number"
              />
            </div>
            <button type="submit" className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest px-6 py-3 sm:py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md">
              <span>View My Trip</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* CUSTOMER FLOW FROM PDF: Renders smoothly only after search triggers */}
        {hasSearched && (
          <div className="space-y-6 sm:space-y-8 animate-[fadeIn_0.5s_ease-out_forwards]">
            
            {/* 2 & 3. Personalized Travel Dashboard Layout */}
            <section className="border rounded-3xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4 gap-4" style={{ borderColor: borderColor }}>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold">Hi Maria! 👋</h2>
                  <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: textMuted }}>Your automated travel layout is synced directly with live records.</p>
                </div>
                <div className="flex flex-row w-full md:w-auto gap-2">
                  <button className="flex-1 md:flex-none hover:opacity-80 border text-[10px] sm:text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 bg-black/5" style={{ borderColor: borderColor }}>
                    <Download className="w-3.5 h-3.5 text-orange-500" /> Voucher
                  </button>
                  <button className="flex-1 md:flex-none hover:opacity-80 border text-[10px] sm:text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 bg-black/5" style={{ borderColor: borderColor }}>
                    <FileText className="w-3.5 h-3.5 text-orange-500" /> Itinerary
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] font-bold block uppercase mb-1" style={{ color: textMuted }}>Destination</span>
                  <span className="font-bold">Boracay, PH</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] font-bold block uppercase mb-1" style={{ color: textMuted }}>Travel Date</span>
                  <span className="font-bold">June 15-18, 2026</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] font-bold block uppercase mb-1" style={{ color: textMuted }}>Accommodations</span>
                  <span className="font-bold truncate block">Henann Lagoon</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] font-bold block uppercase mb-1" style={{ color: textMuted }}>Consultant</span>
                  <span className="font-bold text-orange-500">Agent Roy</span>
                </div>
              </div>
            </section>

            {/* 4. Travel Briefing Video Module (Ito yung nanganawala kanina!) */}
            <section className="border rounded-3xl p-5 sm:p-8 shadow-sm text-center relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm sm:text-base font-bold tracking-tight mb-1">Your Destination Video Briefing</h3>
                <p className="text-[11px] sm:text-xs mb-6" style={{ color: textMuted }}>Review this mandatory onboarding video layout to prepare for your journey.</p>
                
                {/* Smartphone simulation container - Fluidly scales on all screens */}
                <div className="w-full max-w-[260px] sm:max-w-[280px] aspect-[9/16] bg-black rounded-[2rem] sm:rounded-[2.5rem] mx-auto shadow-2xl border-[3px] sm:border-4 border-neutral-800 overflow-hidden relative transition-transform duration-300 hover:scale-105">
                  <div className="absolute inset-0 top-[-45px] bottom-[-45px] overflow-hidden">
                    <iframe 
                      src="https://drive.google.com/file/d/1THzQAagycyXm8UYNztawslG7G_2Ak_J3/preview" 
                      className="w-full h-full border-0 scale-105 object-cover"
                      allow="autoplay; encrypted-media" 
                      allowFullScreen
                      title="Boracay Onboarding Orientation Video"
                    ></iframe>
                  </div>
                  <div className="absolute inset-0 pointer-events-none rounded-[2.3rem] border border-white/5 bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent" />
                </div>
              </div>
            </section>

            {/* 5. Travel Information Center */}
            <section className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4 text-orange-500" /> Travel Information Center
              </h3>
              <div className="space-y-2">
                <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-[11px] sm:text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase">
                      <span className="flex items-center gap-2.5"><PlaneLanding className="w-4 h-4 text-orange-500" /> Arrival & Airport Instructions</span>
                    </summary>
                    <div className="p-4 pt-0 border-t text-[11px] sm:text-xs space-y-2" style={{ borderColor: borderColor, color: textMuted }}>
                      <p>• Arrive at the airport 2 to 3 hours before your scheduled flight departure.</p>
                      <p>• Ready your GDX digital vouchers or QR codes for seamless terminal gate processing.</p>
                    </div>
                  </details>
                </div>
                <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-[11px] sm:text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase">
                      <span className="flex items-center gap-2.5"><Truck className="w-4 h-4 text-orange-500" /> Transfer Instructions & Logistics</span>
                    </summary>
                    <div className="p-4 pt-0 border-t text-[11px] sm:text-xs space-y-2" style={{ borderColor: borderColor, color: textMuted }}>
                      <p>• Coordinated shuttle services will be waiting outside the arrivals area labeled with Southwest banners.</p>
                    </div>
                  </details>
                </div>
              </div>
            </section>

            {/* KLOOK-STYLE "WHAT TO EXPECT" FULL-WIDTH PHOTOMAP VIEW */}
            <section className="border rounded-3xl p-4 sm:p-8 shadow-sm space-y-6" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="border-b pb-4" style={{ borderColor: borderColor }}>
                <h3 className="text-base sm:text-lg font-bold tracking-tight flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-orange-500 rounded-full inline-block"></span>
                  What to Expect from Boracay Island Tour
                </h3>
                <p className="text-[11px] sm:text-xs mt-2 leading-relaxed" style={{ color: textMuted }}>
                  Boracay is one of the Philippines’ prime summer and beach getaway destinations. There, you’ll find numerous beaches, many of them unsoiled, along with colorful sea creatures beneath crystal clear waters. Review your custom destination walkthrough visuals below.
                </p>
              </div>

              {/* Klook-inspired vertical linear scrolling photos layout (image_41b964.jpg) */}
              <div className="space-y-8">
                {itineraryHighlights.map((item, index) => (
                  <div key={index} className="space-y-3 group animate-[fadeIn_0.4s_ease-out]">
                    
                    <div className="w-full overflow-hidden rounded-2xl sm:rounded-3xl border bg-neutral-100 dark:bg-neutral-900 shadow-sm" style={{ borderColor: borderColor }}>
                      <img 
                        src={item.url} 
                        alt={`Boracay Highlight ${index + 1}`} 
                        className="w-full h-auto max-h-[480px] object-cover transition-transform duration-500 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                    </div>

                    <div className="flex items-start gap-2 px-1 text-left">
                      <span className="text-neutral-400 text-[10px] sm:text-xs mt-0.5 shrink-0">▲</span>
                      <p className="text-[11px] sm:text-xs md:text-sm font-medium leading-relaxed" style={{ color: textMuted }}>
                        {item.caption}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            </section>

            {/* 6 & 7. Checklist & What To Bring Section */}
            <section className="border rounded-3xl p-4 sm:p-6 shadow-sm grid md:grid-cols-2 gap-6" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div>
                <h3 className="text-[11px] font-bold mb-1 uppercase tracking-wider flex items-center gap-2"><CheckSquare className="w-4 h-4 text-orange-500" /> Travel Readiness Checklist</h3>
                <div className="space-y-2 mt-3 text-xs">
                  {Object.keys(checklist).map((key) => (
                    <label key={key} className="flex items-center gap-2.5 p-2.5 border rounded-xl cursor-pointer bg-black/5" style={{ borderColor: borderColor }}>
                      <input type="checkbox" checked={checklist[key]} onChange={() => setChecklist(p => ({ ...p, [key]: !p[key] }))} className="w-4 h-4 text-orange-500 accent-orange-500 rounded" />
                      <span className="capitalize">{key === 'id' ? 'Valid ID / Passport' : `${key} Document`} Verified</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-[11px] font-bold mb-1 uppercase tracking-wider flex items-center gap-2"><Briefcase className="w-4 h-4 text-orange-500" /> What To Bring Guide</h3>
                <div className="space-y-2 mt-3 text-[11px] sm:text-xs leading-relaxed" style={{ color: textMuted }}>
                  <p><strong>Beach Pack:</strong> Beachwear, Slippers, Sunscreen, Waterproof Bag, and Swimming gear wrappers.</p>
                  <p><strong>Essentials:</strong> Pocket Cash, Extra Powerbank, and Universal adapters.</p>
                </div>
              </div>
            </section>

            {/* 10. Optional Tours Marketplace */}
            <section className="space-y-3">
              <h3 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" /> Optional Tours Marketplace</h3>
              <div className="border rounded-2xl p-4 flex justify-between items-center shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm">Boracay Island Hopping</h4>
                  <p className="text-[10px] sm:text-[11px]" style={{ color: textMuted }}>Includes boat tour, snorkeling accessories, and group buffet lunch.</p>
                </div>
                <button type="button" onClick={() => toggleTour('island-hop', 'Boracay Island Hopping', 999)} className={`text-[10px] font-bold px-3.5 py-2 rounded-xl border ${selectedTours['island-hop'] ? 'bg-rose-500/10 text-rose-500' : 'bg-orange-500/10 text-orange-500'}`}>
                  {selectedTours['island-hop'] ? 'Remove' : 'Add (₱999)'}
                </button>
              </div>
            </section>

            {/* 12. Dynamic Ledger Checkout Panel */}
            <section className="border-2 rounded-3xl p-5 shadow-2xl bg-gradient-to-br from-black/20 via-black/40 to-black/10" style={{ borderColor: 'rgba(255,140,0,0.25)' }}>
              <h3 className="text-[11px] font-bold uppercase tracking-wider mb-4 flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-orange-500" /> Checkout Ledger Total</h3>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-[9px] uppercase tracking-wider block" style={{ color: textMuted }}>Add-On Balance Due:</span>
                  <span className="text-xl font-black italic">₱{tourTotal.toLocaleString()}</span>
                </div>
              </div>
              <button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold uppercase tracking-widest text-[11px] sm:text-xs py-3.5 rounded-xl shadow-lg">
                Proceed To Add-on Checkout
              </button>
            </section>

          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}