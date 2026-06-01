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

      {/* Top Banner Context Notification */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] sm:text-xs py-2 px-4 text-center font-bold tracking-wider uppercase shadow-sm">
        ✨ Automated Travel Onboarding Hub — Available 24/7 After Your Confirmed Payment
      </div>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        
        {/* Back Link Row */}
        <div className="flex justify-end mb-6">
          <Link to="/" className="text-xs font-bold tracking-widest uppercase transition flex items-center gap-2 border px-4 py-2 rounded-full bg-black/5" style={{ borderColor: borderColor, color: textPrimary }}>
            <ArrowLeft className="w-3.5 h-3.5 text-orange-500" /> Back to Domestic
          </Link>
        </div>

        {/* 1. Welcome Section & Booking Lookup */}
        <section className="border rounded-3xl p-6 md:p-10 shadow-xl text-center mb-8 relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,140,0,0.04)_0%,transparent_70%)]" />
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-orange-500"></div>
            <span className="text-[10px] font-bold tracking-[0.45em] uppercase text-orange-500">Verification Engine</span>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-orange-500"></div>
          </div>

          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
            Booking Status: Fully Paid & Confirmed
          </span>
          
          <h1 className="text-2xl md:text-4xl font-black mb-3 tracking-tight italic" style={{ color: textPrimary }}>Your Trip Is Confirmed!</h1>
          <p className="text-xs md:text-sm max-w-md mx-auto mb-6 leading-relaxed" style={{ color: textMuted }}>
            Enter your GDX Confirmation Number or Tour Voucher Number to access your personalized travel briefing, vouchers, reminders, optional tours, and add ons.
          </p>
          
          {/* SEARCH FORM MODULE BLOCK */}
          <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-2 relative z-10">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
              <input 
                type="text" 
                value={searchID}
                onChange={(e) => setSearchID(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-sm transition bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100" 
                placeholder="Enter GDX Confirmation Number / Tour Voucher Number"
              />
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              <span>View My Trip</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        </section>

        {/* MGA DETALYE: Lalabas lamang kapag ang hasSearched ay TRUE */}
        {hasSearched && (
          <div className="space-y-8 animate-fade-in">
            
            {/* 2 & 3. Personalized Travel Dashboard */}
            <section className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b pb-5 mb-6 gap-4" style={{ borderColor: borderColor }}>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: textPrimary }}>Hi Maria! 👋</h2>
                  <p className="text-xs mt-0.5" style={{ color: textMuted }}>Your automated travel layout is synced directly with live records.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="hover:opacity-80 border text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition bg-black/5" style={{ borderColor: borderColor, color: textPrimary }}>
                    <Download className="w-3.5 h-3.5 text-orange-500" /> Download Voucher
                  </button>
                  <button className="hover:opacity-80 border text-[11px] font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition bg-black/5" style={{ borderColor: borderColor, color: textPrimary }}>
                    <FileText className="w-3.5 h-3.5 text-orange-500" /> Download Itinerary
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Destination</span>
                  <span className="font-bold text-sm">Boracay, Philippines</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Travel Date</span>
                  <span className="font-bold text-sm">June 15 to 18, 2026</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Accommodations</span>
                  <span className="font-bold text-sm">Henann Lagoon (4 Adults)</span>
                </div>
                <div className="p-3 rounded-xl border bg-black/5" style={{ borderColor: borderColor }}>
                  <span className="text-[10px] font-bold block uppercase tracking-wider mb-1" style={{ color: textMuted }}>Consultant</span>
                  <span className="font-bold text-orange-500 text-sm">Agent Roy</span>
                </div>
              </div>
            </section>

            {/* 4. Travel Briefing Video Section */}
            <section className="border rounded-3xl p-6 md:p-8 shadow-sm text-center relative overflow-hidden" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="max-w-md mx-auto">
                <h3 className="text-base font-bold tracking-tight mb-1" style={{ color: textPrimary }}>Your Destination Video Briefing</h3>
                <p className="text-xs mb-6" style={{ color: textMuted }}>Review this mandatory onboarding video layout to prepare for your journey.</p>
                
                {/* FIXED & ALIGNED SMARTPHONE CONTAINER WITH HIDDEN GOOGLE DRIVE POP-OUT CONTROL */}
                <div className="w-full max-w-[300px] aspect-[9/16] bg-black rounded-[2.5rem] mx-auto shadow-2xl border-4 border-neutral-800 overflow-hidden relative">
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
            <section>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <Compass className="w-4 h-4 text-orange-500" /> Travel Information Center
              </h3>

              <div className="space-y-3">
                {/* Arrival Block */}
                <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase" style={{ color: textPrimary }}>
                      <span className="flex items-center gap-2.5"><PlaneLanding className="w-4 h-4 text-orange-500" /> Arrival & Airport Instructions</span>
                    </summary>
                    <div className="p-5 pt-0 border-t text-xs space-y-4" style={{ borderColor: borderColor, color: textMuted }}>
                      <div>
                        <h5 className="font-bold mb-1.5 text-orange-500">Before Departure:</h5>
                        <p>• Arrive at the airport 2 to 3 hours before departure</p>
                        <p>• Prepare travel documents</p>
                        <p>• Save digital copies of vouchers and itinerary</p>
                      </div>
                      <div>
                        <h5 className="font-bold mb-1.5 text-orange-500">Upon Arrival:</h5>
                        <p>• Follow airport arrival signs</p>
                        <p>• Collect baggage</p>
                        <p>• Proceed according to transfer instructions</p>
                        <p>• Keep your mobile phone available for updates</p>
                      </div>
                    </div>
                  </details>
                </div>

                {/* Transfer Operations */}
                <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase" style={{ color: textPrimary }}>
                      <span className="flex items-center gap-2.5"><Truck className="w-4 h-4 text-orange-500" /> Transfer Instructions & Logistics</span>
                    </summary>
                    <div className="p-5 pt-0 border-t text-xs text-slate-400" style={{ borderColor: borderColor }}>
                      <div className="p-3 border rounded-xl grid grid-cols-2 gap-3 mb-4 bg-black/5" style={{ borderColor: borderColor }}>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Transfer Type</span><span className="font-bold text-xs" style={{ color: textPrimary }}>Sea & Land Transit</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Provider</span><span className="font-bold text-xs" style={{ color: textPrimary }}>Southwest Express</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Pick Up Point</span><span className="font-bold text-xs" style={{ color: textPrimary }}>Caticlan Exit Gate</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Est. Time</span><span className="font-bold text-xs" style={{ color: textPrimary }}>1 hr 30 mins</span></div>
                      </div>
                      <h5 className="font-bold mb-1 text-orange-500">Reminders:</h5>
                      <p>• Follow transfer coordinator instructions</p>
                      <p>• Be ready at designated pick up area</p>
                      <p>• Notify support immediately if delayed</p>
                    </div>
                  </details>
                </div>

                {/* Hotel Check In Matrix */}
                <div className="border rounded-2xl overflow-hidden shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <details className="group" open>
                    <summary className="flex justify-between items-center font-bold text-xs p-4 cursor-pointer select-none hover:bg-black/5 tracking-wider uppercase" style={{ color: textPrimary }}>
                      <span className="flex items-center gap-2.5"><Hotel className="w-4 h-4 text-orange-500" /> Hotel Check-In Matrix</span>
                    </summary>
                    <div className="p-5 pt-0 border-t text-xs text-slate-400" style={{ borderColor: borderColor }}>
                      <div className="p-3 border rounded-xl grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 bg-black/5" style={{ borderColor: borderColor }}>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Hotel</span><span className="font-bold" style={{ color: textPrimary }}>Henann Lagoon</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Address</span><span className="font-bold" style={{ color: textPrimary }}>Station 2, Boracay</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Check In</span><span className="font-bold" style={{ color: textPrimary }}>02:00 PM</span></div>
                        <div><span className="text-[9px] font-bold block uppercase" style={{ color: textMuted }}>Check Out</span><span className="font-bold" style={{ color: textPrimary }}>12:00 PM</span></div>
                      </div>
                      <p className="font-bold text-xs mb-1" style={{ color: textPrimary }}>Requirements:</p>
                      <p>✔ Valid ID / Passport & Hotel Voucher</p>
                      <p className="mt-2 text-[11px] p-2.5 bg-amber-500/5 rounded-lg border border-amber-500/10 text-amber-500">
                        📌 <strong>Notes:</strong> Early check in is subject to room availability. Incidental security deposits are standardly collected at front desk arrival.
                      </p>
                    </div>
                  </details>
                </div>
              </div>
            </section>

            {/* 6 & 7. Checklist & What To Bring Section */}
            <section className="border rounded-3xl p-6 shadow-sm grid md:grid-cols-2 gap-8" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div>
                <h3 className="text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <CheckSquare className="w-4 h-4 text-orange-500" /> Travel Readiness Checklist
                </h3>
                <p className="text-[11px] mb-4" style={{ color: textMuted }}>Interactive setup to complete milestones before departure.</p>
                <div className="space-y-2 text-xs">
                  {Object.keys(checklist).map((key) => (
                    <label key={key} className="flex items-center gap-2.5 p-2.5 border rounded-xl cursor-pointer hover:opacity-80 transition bg-black/5" style={{ borderColor: borderColor }}>
                      <input 
                        type="checkbox" 
                        checked={checklist[key]} 
                        onChange={() => setChecklist(p => ({ ...p, [key]: !p[key] }))}
                        className="w-4 h-4 text-orange-500 accent-orange-500 rounded focus:ring-0" 
                      />
                      <span style={{ color: textPrimary }}>
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
                <h3 className="text-xs font-bold mb-1 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <Briefcase className="w-4 h-4 text-orange-500" /> What To Bring Guide
                </h3>
                <p className="text-[11px] mb-4" style={{ color: textMuted }}>Suggested packing categories mapped directly to your itinerary layout.</p>
                <div className="space-y-3 text-xs" style={{ color: textMuted }}>
                  <p><strong style={{ color: textPrimary }}>Documents:</strong> Passport, IDs, Travel Voucher, Insurance Certificate, Flight Ticket</p>
                  <p><strong style={{ color: textPrimary }}>Essentials:</strong> Cash, Cards, Powerbank, Charger, Basic Medicines</p>
                  <p><strong style={{ color: textPrimary }}>Destination Beach Pack:</strong> Beachwear, Slippers, Sunscreen, Waterproof Dry Bag</p>
                </div>
              </div>
            </section>

            {/* KLOOK-STYLE SNAPSHOTS SECTION WITH LIGHTBOX ENLARGE */}
            <section className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-orange-500" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: textPrimary }}>Real Guest Moments & Snapshots</h3>
                  <p className="text-[11px]" style={{ color: textMuted }}>Click any image block to enlarge view, tracking actual traveler insights on-site.</p>
                </div>
              </div>
              
              {/* Image Grid Container */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {experiencePhotos.map((photo, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActivePhoto(photo)}
                    className="group relative overflow-hidden rounded-2xl aspect-square bg-neutral-200 dark:bg-neutral-800 border cursor-zoom-in" 
                    style={{ borderColor: borderColor }}
                  >
                    <img 
                      src={photo.url} 
                      alt={photo.caption} 
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 ease-in-out"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 pt-6">
                      <span className="text-[10px] text-white font-medium tracking-tight block">{photo.caption}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 10. Optional Tours */}
            <section>
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <Sparkles className="w-4 h-4 text-orange-500" /> Optional Tours Marketplace
                </h3>
                <p className="text-[11px]" style={{ color: textMuted }}>Promote supplementary excursions to grow total contract yield metrics.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Tour 1 */}
                <div className="border rounded-2xl p-5 flex flex-col justify-between shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: textPrimary }}>Boracay Island Hopping</h4>
                    <p className="text-[11px] mt-1" style={{ color: textMuted }}>Includes boat tour, snorkeling accessories, and local group buffet lunch blocks.</p>
                    <span className="text-[10px] block mt-2" style={{ color: textMuted }}>⏱ Duration: 5 Hours</span>
                  </div>
                  <div className="flex justify-between items-center mt-5 pt-3 border-t" style={{ borderColor: borderColor }}>
                    <div>
                      <span className="text-[9px] uppercase font-bold block" style={{ color: textMuted }}>Add-on Price</span>
                      <span className="font-black text-orange-500 text-sm">₱999 <span className="text-[10px] font-normal text-slate-500">/ Person</span></span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleTour('island-hop', 'Boracay Island Hopping', 999)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition border ${selectedTours['island-hop'] ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}
                    >
                      {selectedTours['island-hop'] ? 'Remove' : 'Add To Trip'}
                    </button>
                  </div>
                </div>

                {/* Tour 2 */}
                <div className="border rounded-2xl p-5 flex flex-col justify-between shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
                  <div>
                    <h4 className="font-bold text-sm" style={{ color: textPrimary }}>Sunset Paraw Sailing</h4>
                    <p className="text-[11px] mt-1" style={{ color: textMuted }}>Traditional sailboat glide across local signature sunset horizons.</p>
                    <span className="text-[10px] block mt-2" style={{ color: textMuted }}>⏱ Duration: 1 Hour</span>
                  </div>
                  <div className="flex justify-between items-center mt-5 pt-3 border-t" style={{ borderColor: borderColor }}>
                    <div>
                      <span className="text-[9px] uppercase font-bold block" style={{ color: textMuted }}>Add-on Price</span>
                      <span className="font-black text-orange-500 text-sm">₱1,500 <span className="text-[10px] font-normal text-slate-500">/ Sailboat</span></span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => toggleTour('paraw', 'Sunset Paraw Sailing', 1500)}
                      className={`text-xs font-bold px-4 py-2 rounded-xl transition border ${selectedTours['paraw'] ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}
                    >
                      {selectedTours['paraw'] ? 'Remove' : 'Add To Trip'}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 11. Travel Insurance Protection */}
            <section className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <div className="mb-4">
                <span className="bg-orange-500/10 text-orange-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">Optional Plan</span>
                <h3 className="text-xs font-bold mt-2 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                  <ShieldCheck className="w-4 h-4 text-orange-500" /> Travel Insurance Protection Suite
                </h3>
                <p className="text-[11px]" style={{ color: textMuted }}>Optional insurance highly recommended for flight interrupts, accidents, or luggage risks.</p>
              </div>

              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                {[
                  { id: 'basic', title: 'Basic Insurance', price: 399 },
                  { id: 'std', title: 'Standard Insurance', price: 699, recommended: true },
                  { id: 'prem', title: 'Premium Insurance', price: 999 }
                ].map((tier) => (
                  <div key={tier.id} className={`border p-4 rounded-xl flex flex-col justify-between relative bg-black/5 ${tier.recommended ? 'border-orange-500 bg-orange-500/[0.02]' : ''}`} style={{ borderColor: tier.recommended ? '#FF8C00' : borderColor }}>
                    {tier.recommended && <span className="bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded absolute -top-2.5 left-4 uppercase tracking-wider">Recommended</span>}
                    <div>
                      <span className="font-bold block" style={{ color: textPrimary }}>{tier.title}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t flex items-center justify-between" style={{ borderColor: borderColor }}>
                      <span className="font-black text-sm" style={{ color: textPrimary }}>₱{tier.price}</span>
                      <button 
                        type="button"
                        onClick={() => setSelectedInsurance(selectedInsurance?.id === tier.id ? null : tier)}
                        className={`font-bold px-3 py-1.5 rounded-lg text-[11px] transition ${selectedInsurance?.id === tier.id ? 'bg-emerald-500 text-black' : 'bg-white/5 border text-orange-500'}`}
                        style={{ borderColor: borderColor }}
                      >
                        {selectedInsurance?.id === tier.id ? 'Active ✓' : 'Add'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 12. Dynamic Ledger Checkout Panel */}
            <section className="border-2 rounded-3xl p-6 shadow-2xl bg-gradient-to-br from-black/20 via-black/40 to-black/10" style={{ borderColor: 'rgba(255,140,0,0.25)' }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: textPrimary }}>
                <ShoppingCart className="w-4 h-4 text-orange-500" /> Checkout Ledger Total
              </h3>
              
              <div className="border-b pb-4 mb-4 text-xs space-y-2.5" style={{ borderColor: borderColor }}>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Flight & Base Package Assets</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-widest text-[9px] bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">PAID / SYSTEM MATCHED</span>
                </div>
                
                {Object.values(selectedTours).map((tour, i) => (
                  <div key={i} className="flex justify-between items-center py-0.5 font-medium animate-fade-in">
                    <span style={{ color: textPrimary }}>✦ {tour.title} (Add-on Pack)</span>
                    <span className="font-bold text-orange-500">₱{tour.price.toLocaleString()}</span>
                  </div>
                ))}

                {selectedInsurance && (
                  <div className="flex justify-between items-center py-0.5 font-medium animate-fade-in">
                    <span style={{ color: textPrimary }}>✦ SafeTravel: {selectedInsurance.title} choice</span>
                    <span className="font-bold text-orange-500">₱{selectedInsurance.price.toLocaleString()}</span>
                  </div>
                )}

                {Object.keys(selectedTours).length === 0 && !selectedInsurance && (
                  <p className="text-slate-500 italic py-0.5 text-[11px]">No active voluntary add-ons selected currently.</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase tracking-wider block font-bold" style={{ color: textMuted }}>Add-On Balance Due:</span>
                  <span className="text-2xl font-black tracking-tight italic" style={{ color: textPrimary }}>₱{overallTotal.toLocaleString()}</span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[9px] uppercase font-black block tracking-widest mb-1.5" style={{ color: textMuted }}>Secure Gateways</span>
                  <div className="flex gap-1 text-[8px] font-bold text-white font-mono">
                    <span className="bg-white/5 border px-1.5 py-0.5 rounded" style={{ borderColor: borderColor }}>GCASH</span>
                    <span className="bg-white/5 border px-1.5 py-0.5 rounded" style={{ borderColor: borderColor }}>MAYA</span>
                    <span className="bg-white/5 border px-1.5 py-0.5 rounded" style={{ borderColor: borderColor }}>CREDIT CARD</span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:opacity-95 text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2">
                <span>Proceed To Add-on Checkout</span>
                <FileText className="w-4 h-4" />
              </button>
            </section>

            {/* 13. FAQ Matrix */}
            <section className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <h3 className="text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                <HelpCircle className="w-4 h-4 text-orange-500" /> Frequently Asked Questions
              </h3>
              <div className="space-y-4 text-xs" style={{ color: textMuted }}>
                <div className="border-b pb-3" style={{ borderColor: borderColor }}>
                  <p className="font-bold mb-1" style={{ color: textPrimary }}>❓ What if my flight experiences terminal delays?</p>
                  <p>Open the Emergency Support hotline accordion matrix directly above and trigger immediate assistance line counters to recalibrate transfer vectors.</p>
                </div>
                <div className="border-b pb-3" style={{ borderColor: borderColor }}>
                  <p className="font-bold mb-1" style={{ color: textPrimary }}>❓ What rules govern early property check-in requests?</p>
                  <p>Standard room allocation initializations trigger at 02:00 PM. Early arrival changes remain contingent on clear check-out vacancy spaces.</p>
                </div>
              </div>
            </section>

            {/* 14. Customer Testimonials */}
            <section className="border rounded-3xl p-6 shadow-sm" style={{ backgroundColor: cardBg, borderColor: borderColor }}>
              <h3 className="text-xs font-bold mb-4 uppercase tracking-wider flex items-center gap-2" style={{ color: textPrimary }}>
                <MessageSquare className="w-4 h-4 text-orange-500" /> Real Gladex Travel Experiences
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-2xl bg-black/5" style={{ borderColor: borderColor }}>
                  <div className="flex items-center gap-1 mb-2 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /></div>
                  <p className="text-xs italic" style={{ color: textMuted }}>"The automated check-in briefing process was effortless. Saved us from a ton of administrative work before arriving in Boracay."</p>
                  <span className="text-[10px] font-bold block mt-2" style={{ color: textPrimary }}>— Client Review, Boracay Trip</span>
                </div>
                <div className="p-4 border rounded-2xl bg-black/5" style={{ borderColor: borderColor }}>
                  <div className="flex items-center gap-1 mb-2 text-amber-500"><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /><Star className="w-3.5 h-3.5 fill-amber-500" /></div>
                  <p className="text-xs italic" style={{ color: textMuted }}>"Adding extra paraw sailboat activities took seconds. Highly transparent checkout total tracking."</p>
                  <span className="text-[10px] font-bold block mt-2" style={{ color: textPrimary }}>— Client Review, 2026</span>
                </div>
              </div>
            </section>

          </div>
        )}
      </main>

      {/* KLOOK-STYLE LIGHTBOX MODAL CONTAINER */}
      {activePhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in cursor-zoom-out"
          onClick={() => setActivePhoto(null)}
        >
          {/* Close Trigger Icon */}
          <button 
            onClick={() => setActivePhoto(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition focus:outline-none"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Large Image Frame Block */}
          <div 
            className="max-w-3xl w-full flex flex-col items-center gap-4 relative animate-scale-up"
            onClick={(e) => e.stopPropagation()} // Iwas pagsara kapag mismong picture ang cliniclick
          >
            <img 
              src={activePhoto.url} 
              alt={activePhoto.caption} 
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain border border-white/10 shadow-2xl"
            />
            <span className="text-xs sm:text-sm text-neutral-300 font-semibold tracking-wide bg-black/40 px-4 py-2 rounded-full border border-white/5">
              {activePhoto.caption}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}