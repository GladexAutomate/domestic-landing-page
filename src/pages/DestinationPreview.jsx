import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTheme } from "@/lib/ThemeContext";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import { 
  Search, ChevronRight, Download, FileText, ArrowLeft, 
  PlaneLanding, Truck, Hotel, Compass, X,
  CheckSquare, Briefcase, Sparkles, ShieldCheck, ShoppingCart, HelpCircle,
  MessageSquare, Star, Check, Image
} from "lucide-react";

export default function DestinationPreview() {
  const { slug } = useParams();
  const { darkMode } = useTheme();
  
  // Input fields state
  const [searchID, setSearchID] = useState("");
  
  // Naka-set sa false sa simula para nakatago ang lahat ng detalye ayon sa PDF customer flow
  const [hasSearched, setHasSearched] = useState(false);

  // Upsell state management
  const [selectedTours, setSelectedTours] = useState({});
  const [selectedInsurance, setSelectedInsurance] = useState(null);

  // Klook-style Lightbox/Modal State para sa pagpapalaki ng litrato
  const [activePhoto, setActivePhoto] = useState(null);

  // Checklist state management
  const [checklist, setChecklist] = useState({
    id: true, voucher: true, flight: false, hotel: false, cash: false, data: false
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Theme configuration tokens
  const bg = darkMode ? "#0a0a0a" : "#f8f9fa";
  const cardBg = darkMode ? "#000000" : "#ffffff";
  const textPrimary = darkMode ? "#ffffff" : "#0F172A";
  const textMuted = darkMode ? "rgba(255,255,255,0.4)" : "#64748B";
  const borderColor = darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";

  // Dynamic calculations
  const tourTotal = Object.values(selectedTours).reduce((sum, item) => sum + item.price, 0);
  const insuranceTotal = selectedInsurance ? selectedInsurance.price : 0;
  const overallTotal = tourTotal + insuranceTotal;

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

  // Klook-style placeholder experiences photos 
  const experiencePhotos = [
    { url: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&auto=format&fit=crop&q=80", caption: "Crystal Kayak Experience" },
    { url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80", caption: "White Beach Station 2" },
    { url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800&auto=format&fit=crop&q=80", caption: "Sunset Paraw Sailing" },
    { url: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&auto=format&fit=crop&q=80", caption: "Island Hopping Buffet Lunch" },
  ];

  return (
    <div className="font-poppins min-h-screen transition-colors duration-500 pb-24" style={{ background: bg, color: textPrimary }}>
      <DestinationNavbar />

      {/* Top Banner Context Notification - Auto-fluid typography */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] sm:text-xs py-2.5 px-4 text-center font-bold tracking-wider uppercase shadow-sm">
        ✨ Automated Travel Onboarding Hub — Available 24/7 After Your Confirmed Payment
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-6 sm:mt-10">
        
        {/* Back Link Row */}
        <div className="flex justify-end mb-4 sm:mb-6">
          <Link to="/" className="text-[10px] sm:text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center gap-2 border px-4 py-2 rounded-full bg-black/5 hover:bg-black/10 hover:scale-105 active:scale-95" style={{ borderColor: borderColor, color: textPrimary }}>
            <ArrowLeft className="w-3.5 h-3.5 text-orange-500" /> Back to Domestic
          </Link>
        </div>

        {/* 1. Welcome Section & Booking Lookup */}
        <section className="border rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl text-center mb-8 relative overflow-hidden transition-all duration-300 hover:shadow-2xl" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,140,0,0.04)_0%,transparent_70%)] animate-pulse" />
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.45em] uppercase text-orange-500">Verification Engine</span>
            <div className="h-[1px] w-8 sm:w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>

          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[9px] sm:text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block animate-bounce">
            Booking Status: Fully Paid & Confirmed
          </span>
          
          <h1 className="text-xl sm:text-3xl md:text-4xl font-black mb-3 tracking-tight italic" style={{ color: textPrimary }}>Your Trip Is Confirmed!</h1>
          <p className="text-[11px] sm:text-xs md:text-sm max-w-md mx-auto mb-6 leading-relaxed" style={{ color: textMuted }}>
            Enter your GDX Confirmation Number or Tour Voucher Number to access your personalized travel briefing, vouchers, reminders, optional tours, and add ons.
          </p>
          
          {/* SEARCH FORM MODULE BLOCK - Desktop flow / Mobile stacked */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 relative z-10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 sm:top-4 text-slate-400" />
              <input 
                type="text" 
                value={searchID}
                onChange={(e) => setSearchID(e.target.value)}
                className="w-full pl-11 pr-4 py-3 sm:py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-xs sm:text-sm transition-all bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100" 
                placeholder="Enter GDX / Voucher Number"
              />
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 active:scale-95 text-white text-[11px] sm:text-xs font-bold uppercase tracking-widest px-6 py-3 sm:py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md"
            >
              <span>View My Trip</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* MGA DETALYE: Lalabas lamang kapag ang hasSearched ay TRUE */}
        {hasSearched && (
          <div className="space-y-6 sm:space-y-8 animate-[fadeIn_0.5s_ease-out_forwards]">
            
            {/* 2 & 3. Personalized Travel Dashboard */}
            <section className="border rounded-3xl p-4 sm:p-6 shadow-sm transition-transform duration-300 hover:scale-[1.01]" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-4 mb-4 sm:mb-6 gap-4" style={{ borderColor: borderColor }}>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>Hi Maria! 👋</h2>
                  <p className="text-[11px] sm:text-xs mt-0.5" style={{ color: textMuted }}>Your automated travel layout is synced directly with live records.</p>
                </div>
                <div className="flex flex-row w-full md:w-auto gap-2">
                  <button className="flex-1 md:flex-none hover:opacity-80 active:scale-95 border text-[10px] sm:text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all bg-black/5" style={{ borderColor: borderColor, color: textPrimary }}>
                    <Download className="w-3.5 h-3.5 text-orange-500" /> Voucher
                  </button>
                  <button className="flex-1 md:flex-none hover:opacity-80 active:scale-95 border text-[10px] sm:text-[11px] font-bold px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all bg-black/5" style={{ borderColor: borderColor, color: textPrimary }}>
                    <FileText className="w-3.5 h-3.5 text-orange-500" /> Itinerary
                  </button>
                </div>
              </div>

              {/* Grid adjusts flawlessly from 2 columns on small screens to 4 on tablets */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
                <div className="p-3 rounded-xl border bg-black/5 transition-colors hover:bg-black/10" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] sm:text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Destination</span>
                  <span className="font-bold text-xs sm:text-sm">Boracay, PH</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5 transition-colors hover:bg-black/10" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] sm:text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Travel Date</span>
                  <span className="font-bold text-xs sm:text-sm">June 15-18, 2026</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5 transition-colors hover:bg-black/10" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] sm:text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Accommodations</span>
                  <span className="font-bold text-xs sm:text-sm truncate block">Henann Lagoon</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5 transition-colors hover:bg-black/10" style={{ borderColor: borderColor }}>
                  <span className="text-[9px] sm:text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Consultant</span>
                  <span className="font-bold text-orange-500 text-xs sm:text-sm">Agent Roy</span>
                </div>
              </div>
            </section>

            {/* 4. Travel Briefing Video Section */}
            <section className="border rounded-3xl p-5 sm:p-8 shadow-sm text-center relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm sm:text-base font-bold tracking-tight mb-1" style={{ color: textPrimary }}>Your Destination Video Briefing</h3>
                <p className="text-[11px] sm:text-xs mb-6" style={{ color: textMuted }}>Review this mandatory onboarding video layout to prepare for your journey.</p>
                
                {/* Smartphone simulation container - Auto scaling dimensions */}
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
              <h3 className="text-sm sm:text-base font-bold mb-2 flex items-center gap-2" style={{ color: textPrimary }}>
                <Compass className="w-4 h-4 text-orange-500" /> Travel Information Center
              </h3>

              <div className="space-y-3">
                {/* Accordion blocks use generic focus targets for transitions */}
                <div className="border rounded-2xl overflow-hidden shadow-sm transition-all" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-[11px] sm:text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase" style={{ color: textPrimary }}>
                      <span className="flex items-center gap-2.5"><PlaneLanding className="w-4 h-4 text-orange-500" /> Arrival & Airport Instructions</span>
                    </summary>
                    <div className="p-4 sm:p-5 pt-0 border-t text-[11px] sm:text-xs space-y-4 transition-all" style={{ borderColor: borderColor, color: textMuted }}>
                      <div>
                        <h5 className="font-bold mb-1.5 text-orange-500">Before Departure:</h5>
                        <p>• Arrive at the airport 2 to 3 hours before departure</p>
                        <p>• Prepare travel documents and vouchers</p>
                      </div>
                    </div>
                  </details>
                </div>

                <div className="border rounded-2xl overflow-hidden shadow-sm transition-all" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-[11px] sm:text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase" style={{ color: textPrimary }}>
                      <span className="flex items-center gap-2.5"><Truck className="w-4 h-4 text-orange-500" /> Transfer Instructions & Logistics</span>
                    </summary>
                    <div className="p-4 sm:p-5 pt-0 border-t text-[11px] sm:text-xs text-slate-400" style={{ borderColor: borderColor }}>
                      <div className="p-3 border rounded-xl grid grid-cols-2 gap-3 mb-4 bg-black/5" style={{ borderColor: borderColor }}>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Transfer Type</span><span className="font-bold text-xs" style={{ color: textPrimary }}>Sea & Land</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Provider</span><span className="font-bold text-xs" style={{ color: textPrimary }}>Southwest</span></div>
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            </section>

            {/* 6 & 7. Checklist & What To Bring Section */}
            <section className="border rounded-3xl p-4 sm:p-6 shadow-sm grid md:grid-cols-2 gap-6 sm:gap-8" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <CheckSquare className="w-4 h-4 text-orange-500" /> Travel Readiness Checklist
                </h3>
                <p className="text-[10px] sm:text-[11px] mb-4" style={{ color: textMuted }}>Interactive setup to complete milestones before departure.</p>
                <div className="space-y-2 text-xs">
                  {Object.keys(checklist).map((key) => (
                    <label key={key} className="flex items-center gap-2.5 p-2.5 border rounded-xl cursor-pointer hover:bg-black/10 transition-all bg-black/5" style={{ borderColor: borderColor }}>
                      <input 
                        type="checkbox" 
                        checked={checklist[key]} 
                        onChange={() => setChecklist(p => ({ ...p, [key]: !p[key] }))}
                        className="w-4 h-4 text-orange-500 accent-orange-500 rounded focus:ring-0 transition" 
                      />
                      <span className="text-xs" style={{ color: textPrimary }}>
                        {key === 'id' && 'Valid ID / Passport'}
                        {key === 'voucher' && 'Travel Voucher'}
                        {key === 'flight' && 'Flight Ticket'}
                        {key === 'hotel' && 'Hotel Voucher'}
                        {key === 'cash' && 'Pocket Cash'}
                        {key === 'data' && 'Mobile Data Connection'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[11px] sm:text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <Briefcase className="w-4 h-4 text-orange-500" /> What To Bring Guide
                </h3>
                <p className="text-[10px] sm:text-[11px] mb-4" style={{ color: textMuted }}>Suggested packing categories mapped directly to your itinerary layout.</p>
                <div className="space-y-3 text-[11px] sm:text-xs leading-relaxed" style={{ color: textMuted }}>
                  <p><strong style={{ color: textPrimary }}>Documents:</strong> Passport, IDs, Travel Voucher, Flight Ticket</p>
                  <p><strong style={{ color: textPrimary }}>Essentials:</strong> Cash, Powerbank, Charger, Basic Medicines</p>
                  <p><strong style={{ color: textPrimary }}>Beach Pack:</strong> Beachwear, Slippers, Sunscreen, Waterproof Bag</p>
                </div>
              </div>
            </section>

            {/* KLOOK-STYLE SNAPSHOTS SECTION WITH LIGHTBOX ENLARGE & EFFECTS */}
            <section className="border rounded-3xl p-4 sm:p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-500" />
                <div>
                  <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>Real Guest Moments & Snapshots</h3>
                  <p className="text-[10px] sm:text-[11px]" style={{ color: textMuted }}>Click any image block to enlarge view, tracking actual traveler insights on-site.</p>
                </div>
              </div>
              
              {/* Responsive Mosaic Gallery Grid - Flawless layout adaptivity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {experiencePhotos.map((photo, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActivePhoto(photo)}
                    className="group relative overflow-hidden rounded-2xl aspect-square bg-neutral-200 dark:bg-neutral-800 border cursor-zoom-in transition-all duration-300 hover:scale-[1.03] hover:shadow-lg" 
                    style={{ borderColor: borderColor }}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover transition duration-500 ease-in-out group-hover:brightness-90"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-2.5 sm:p-3 pt-6 transition-transform duration-300">
                      <span className="text-[9px] sm:text-[10px] text-white font-medium tracking-tight block truncate">{photo.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. Optional Tours marketplace */}
            <section className="space-y-3">
              <div>
                <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <Sparkles className="w-4 h-4 text-orange-500" /> Optional Tours Marketplace
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Tour Cards with soft trigger scale animations */}
                <div className="border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm" style={{ color: textPrimary }}>Boracay Island Hopping</h4>
                    <p className="text-[10px] sm:text-[11px] mt-1 leading-relaxed" style={{ color: textMuted }}>Includes boat tour, snorkeling accessories, and local group buffet lunch blocks.</p>
                  </div>
                  <div className="flex justify-between items-center mt-5 pt-3 border-t" style={{ borderColor: borderColor }}>
                    <div>
                      <span className="font-black text-orange-500 text-xs sm:text-sm">₱999</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleTour('island-hop', 'Boracay Island Hopping', 999)}
                      className={`text-[10px] sm:text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 border ${selectedTours['island-hop'] ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}
                    >
                      {selectedTours['island-hop'] ? 'Remove' : 'Add To Trip'}
                    </button>
                  </div>
                </div>

                <div className="border rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-sm transition-transform duration-300 hover:scale-[1.02]" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm" style={{ color: textPrimary }}>Sunset Paraw Sailing</h4>
                    <p className="text-[10px] sm:text-[11px] mt-1 leading-relaxed" style={{ color: textMuted }}>Traditional sailboat glide across local signature sunset horizons.</p>
                  </div>
                  <div className="flex justify-between items-center mt-5 pt-3 border-t" style={{ borderColor: borderColor }}>
                    <div>
                      <span className="font-black text-orange-500 text-xs sm:text-sm">₱1,500</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleTour('paraw', 'Sunset Paraw Sailing', 1500)}
                      className={`text-[10px] sm:text-xs font-bold px-3.5 py-2 rounded-xl transition-all duration-200 active:scale-95 border ${selectedTours['paraw'] ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}
                    >
                      {selectedTours['paraw'] ? 'Remove' : 'Add To Trip'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 12. Dynamic Ledger Checkout Panel */}
            <section className="border-2 rounded-3xl p-5 sm:p-6 shadow-2xl bg-gradient-to-br from-black/20 via-black/40 to-black/10 transition-transform duration-300 hover:scale-[1.01]" style={{ borderColor: 'rgba(255,140,0,0.25)' }}>
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <ShoppingCart className="w-4 h-4 text-orange-500" /> Checkout Ledger Total
              </h3>
              
              <div className="border-b pb-4 mb-4 text-xs space-y-2.5" style={{ borderColor: borderColor }}>
                <div className="flex justify-between items-center text-slate-400 gap-2">
                  <span className="flex items-center gap-1.5 truncate text-[11px] sm:text-xs"><Check className="w-3.5 h-3.5 text-emerald-500" /> Flight & Base Package</span>
                  <span className="text-emerald-500 font-bold tracking-wider text-[8px] sm:text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0">PAID</span>
                </div>
                
                {Object.values(selectedTours).map((tour, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 font-medium animate-[fadeIn_0.3s_ease-out]">
                    <span className="text-[11px] sm:text-xs" style={{ color: textPrimary }}>✦ {tour.title}</span>
                    <span className="font-bold text-orange-500 text-[11px] sm:text-xs">₱{tour.price.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <span className="text-[9px] sm:text-[10px] uppercase tracking-wider block font-bold" style={{ color: textMuted }}>Add-On Balance Due:</span>
                  <span className="text-xl sm:text-2xl font-black tracking-tight italic" style={{ color: textPrimary }}>₱{overallTotal.toLocaleString()}</span>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 active:scale-[0.99] text-white font-bold uppercase tracking-widest text-[11px] sm:text-xs py-3.5 sm:py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2">
                <span>Proceed To Add-on Checkout</span>
                <FileText className="w-4 h-4" />
              </button>
            </section>

          </div>
        )}
      </main>

      {/* KLOOK-STYLE LIGHTBOX MODAL OVERLAY WITH SCALE ENLARGE ANIMATION */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-3 transition-opacity duration-300 cursor-zoom-out animate-[fadeIn_0.2s_ease-out]"
          onClick={() => setActivePhoto(null)}
        >
          {/* Fluid Close Trigger Placement */}
          <button 
            onClick={() => setActivePhoto(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-transform active:scale-90"
          >
            <X className="w-5 sm:w-6 h-5 sm:h-6" />
          </button>

          {/* Large Image Block container with instant smooth bounce pop-up effect */}
          <div 
            className="max-w-3xl w-full flex flex-col items-center gap-3 sm:gap-4 p-2 relative animate-[scaleUp_0.25s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={activePhoto.url} 
              alt={activePhoto.caption} 
              className="max-h-[75vh] sm:max-h-[80vh] w-auto max-w-full rounded-xl sm:rounded-2xl object-contain border border-white/10 shadow-2xl"
            />
            <span className="text-[11px] sm:text-xs md:text-sm text-neutral-300 font-semibold tracking-wide bg-neutral-900/80 px-4 py-2 rounded-full border border-white/5 shadow-md">
              {activePhoto.caption}
            </span>
          </div>
        </div>
      )}

      {/* Injecting dynamic CSS transitions directly for robust performance across global Tailwind configs */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleUp {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}