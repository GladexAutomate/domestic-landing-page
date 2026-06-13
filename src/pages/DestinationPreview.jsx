// @ts-nocheck
import { hero as boracayHero } from "@/images/boracay";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { useTheme } from "@/lib/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import DestinationNavbar from "@/components/destination/DestinationNavbar";
import {
  Check, X, MapPin, ChevronDown, AlertTriangle, ArrowUp,
  Plane, Hotel, Sparkles, Utensils, Camera,
  Ticket, CreditCard,
  Calendar, User, Globe, Shield, Clock, Luggage,
  BadgeCheck, Zap, Heart,
  Navigation, DollarSign,
} from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const cardVariant = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } };


// ─── Hardcoded Boracay Briefing Data ─────────────────────────────────────────

const HERO_IMAGE = boracayHero;
/*
  VIDEO SOURCE — read before changing
  ─────────────────────────────────────────────────────────────────────────────
  CURRENT: Google Drive /preview embed
    · ?rm=minimal removes the top Drive header/toolbar
    · sandbox attribute (see iframe below) blocks all popup / top-navigation
      attempts at the browser level — clicking "Open in Drive" does nothing
    · Overlay divs intercept pointer events in the known button regions
    · Limitation: the Drive player-UI icons are still visible (just inert)

  RECOMMENDED ALTERNATIVE: YouTube (Unlisted) — cleanest watch-only embed
    Upload the video to YouTube as Unlisted, then replace VIDEO_URL with:

      const VIDEO_URL =
        "https://www.youtube.com/embed/YOUR_VIDEO_ID" +
        "?rel=0&modestbranding=1&playsinline=1&controls=1&iv_load_policy=3";

    YouTube's embed API exposes no "open externally" or pop-out buttons.
    The embed params above disable related-video suggestions (rel=0) and
    the YouTube logo branding (modestbranding=1).  This is the cleanest
    watch-only embed available from any major free platform.

  SECOND ALTERNATIVE: Vimeo (Private/Unlisted)
    Upload as private, then replace with:

      const VIDEO_URL =
        "https://player.vimeo.com/video/YOUR_VIDEO_ID" +
        "?title=0&byline=0&portrait=0&badge=0&dnt=1";

  THIRD ALTERNATIVE: Direct MP4 (<video> tag)
    Host the file on any cloud storage that provides a direct URL (e.g.
    Supabase Storage, Cloudflare R2, AWS S3 presigned URL).  Replace the
    <iframe> with a <video controls src={VIDEO_URL} /> — 100% control,
    zero external buttons.
  ─────────────────────────────────────────────────────────────────────────────
*/
const VIDEO_URL =
  "https://drive.google.com/file/d/1THzQAagycyXm8UYNztawslG7G_2Ak_J3/preview";

const PACKAGE_META = {
  name: "Boracay 3D2N All-In", duration: "3 Days, 2 Nights", code: "GDX-BOR-3D2N",
  welcomeTitle: "Your Boracay Trip Is Confirmed",
  welcomeBody: [
    "Welcome to your official Gladex Travel Briefing Portal. This is your complete pre-departure guide for your upcoming Boracay trip. Please read every section carefully before your departure date.",
    "This portal covers your arrival process, hotel information, daily itinerary, what to bring, tour schedules, and everything you need to travel confidently. Your consultant is always available if you have questions.",
  ],
};

// ─── Pre-Departure Briefing ───────────────────────────────────────────────────

const PRE_DEPARTURE = {
  title: "Before You Leave Home",
  intro: "Your Boracay trip package has been confirmed and fully arranged by Gladex Travel. Please review this briefing at least 48 hours before your travel date to ensure you arrive prepared and stress-free.",
  voucherReminder: "Your travel voucher will be sent to your registered email 48–72 hours before departure. This voucher is required at the Southwest Tours booth in Caticlan Airport. Print a copy or save it on your phone.",
  assistanceReminder: "Questions? Contact your Gladex travel consultant anytime via call, Viber, or WhatsApp. Our 24/7 operations hotline is +63 917 875 2200. We are here to help before, during, and after your trip.",
  ctaLinks: [
    { label: "View Itinerary",   id: "itinerary" },
    { label: "Arrival Steps",    id: "requirements" },
    { label: "Tour Activities",  id: "activities" },
  ],
  packageHighlights: [
    "Roundtrip airfare included",
    "Hotel accommodation at Henann Lagoon Resort",
    "Daily breakfast each morning",
    "All land and sea transfers arranged",
    "Island Hopping Tour on Day 2",
    "Kawa Hot Bath experience",
    "Mermaid Tail Photoshoot",
  ],
  travelReminders: [
    "Arrive at the airport 2–3 hours before your scheduled departure.",
    "Make sure all your travel documents are ready and accessible.",
    "Charge your phone, power bank, and camera fully before leaving.",
    "Save your consultant's number and hotel contact in your phone.",
    "Download offline maps of Boracay before you travel.",
  ],
};

// ─── Notes ────────────────────────────────────────────────────────────────────

const NOTES = [
  { icon: "📋", title: "Rates & Schedules", text: "Rates and tour schedules are subject to change without prior notice due to operational adjustments. Your consultant will notify you of any changes." },
  { icon: "⛅", title: "Weather Advisory", text: "Boracay weather can be unpredictable. Tours may be rescheduled due to strong winds, rough seas, or heavy rain. Safety is always our priority." },
  { icon: "🛡️", title: "Safety First", text: "Always follow the safety instructions of your tour guides and hotel staff. Wear life jackets during boat activities. Swim only in designated areas." },
  { icon: "🚫", title: "Tour Cancellation Policy", text: "Tour cancellations due to weather or force majeure will be rescheduled at no extra cost. No-show or client-requested cancellations may be subject to fees." },
  { icon: "✈️", title: "Arrival Reminder", text: "Please inform your consultant immediately if your flight is delayed or cancelled so transfer arrangements can be adjusted accordingly." },
  { icon: "🔧", title: "Operational Adjustments", text: "Gladex Travel reserves the right to make operational adjustments to tours, transfers, and accommodations to ensure the best possible experience." },
];

// ─── Reminders ───────────────────────────────────────────────────────────────

const REMINDERS = {
  beforeTrip: [
    { icon: "✈️", title: "Airport Arrival Time",  text: "Arrive at the airport 2–3 hours before departure for domestic flights." },
    { icon: "📱", title: "Save Emergency Contacts", text: "Save your consultant's number, hotel contact, and Gladex 24/7 hotline before you leave." },
    { icon: "🔋", title: "Charge All Devices",      text: "Fully charge your phone, power bank, and camera before leaving home." },
    { icon: "📢", title: "Notify Flight Changes",   text: "Immediately inform your consultant of any flight changes, delays, or cancellations." },
  ],
  duringStay: [
    { icon: "🔐", title: "Secure Your Valuables",  text: "Use your hotel room safe for passports, extra cash, and valuables when not needed." },
    { icon: "💧", title: "Stay Hydrated",           text: "Drink plenty of water, especially during outdoor tours under the Boracay sun." },
    { icon: "📜", title: "Follow Local Regulations",text: "Respect the island's eco-rules: no plastics, reef-safe sunscreen only, no corals." },
    { icon: "⏰", title: "Follow Tour Schedules",   text: "Be at the tour meeting point on time. Tours depart as scheduled regardless of latecomers." },
  ],
  beforeDeparture: [
    { icon: "🎫", title: "Confirm Return Flight",   text: "Reconfirm your return flight details at least 24 hours before departure." },
    { icon: "💳", title: "Settle Hotel Incidentals",text: "Settle any unpaid hotel charges, minibar bills, or security deposits before checkout." },
    { icon: "🚐", title: "Be Ready for Transfers",  text: "Your departure transfer will arrive at your hotel as scheduled. Be packed and in the lobby on time." },
  ],
};

// ─── Inclusions / Exclusions ─────────────────────────────────────────────────

const INCLUSIONS = [
  { label: "Roundtrip Airfare" },
  { label: "Hotel Accommodation" },
  { label: "Daily Breakfast" },
  { label: "Roundtrip Land Transfers" },
  { label: "Roundtrip Sea Transfers (Bangka)" },
  { label: "Hotel Facilities" },
  { label: "Hotel Taxes and Surcharges" },
  { label: "Standard Island Hopping Tour" },
  { label: "Kawa Hot Bath Experience" },
  { label: "Mermaid Tail Photoshoot" },
];

const EXCLUSIONS = [
  { label: "Terminal Fee" },
  { label: "Environmental Fee" },
  { label: "Snorkeling Fee" },
  { label: "Mandatory Tour Lunch" },
  { label: "Security Deposit" },
  { label: "Personal Expenses" },
  { label: "Other expenses not mentioned" },
];

// ─── Itinerary ────────────────────────────────────────────────────────────────

const ITINERARY = [
  {
    day: "Day 1", title: "Arrival in Boracay", color: "#f97316",
    activities: [
      "Arrive at Caticlan Airport — proceed to Southwest Tours Booth",
      "Present your GDX voucher at Window 5 to the orange polo staff",
      "Receive your travel sticker — required for bangka boarding",
      "Board the bangka boat transfer to Boracay Island (10–15 mins)",
      "Tricycle or van transfer from White Beach port to your hotel",
      "Hotel check-in at Henann Lagoon Resort (2:00 PM–3:00 PM)",
      "Free afternoon — explore White Beach at your own pace",
      "Overnight at hotel",
    ],
  },
  {
    day: "Day 2", title: "Island Hopping Adventure", color: "#0ea5e9",
    activities: [
      "Breakfast at the hotel restaurant",
      "Island Hopping Tour assembly: 8:00 AM–9:00 AM at meeting point",
      "Depart by bangka boat to surrounding islands and sandbars",
      "Visit Puka Shell Beach — secluded shore with white sand",
      "Snorkeling stops with clear turquoise water",
      "Lunch at the island (not included — bring cash)",
      "Tour ends approximately 3:00 PM — return to hotel",
      "Optional evening: Sunset Paraw Sailing (additional cost)",
      "Overnight at hotel",
    ],
  },
  {
    day: "Day 3", title: "Departure Day", color: "#8b5cf6",
    activities: [
      "Final breakfast at the hotel",
      "Free morning — last-minute shopping or beach time",
      "Optional activities available until 10:00 AM",
      "Hotel check-out by 12:00 Noon (arrange early if needed)",
      "Luggage may be stored at the front desk after checkout",
      "Board bangka boat back to Caticlan Port",
      "Land transfer from Caticlan Port to the airport",
      "Depart from Caticlan or Kalibo Airport",
    ],
  },
];

// ─── Arrival Instructions (Actual Briefing Content) ──────────────────────────

const ARRIVAL_STEPS = {
  caticlan: [
    { step: 1, label: "Southwest Tours Booth",     note: "Go directly to the Southwest Tours booth inside Caticlan Airport after baggage claim." },
    { step: 2, label: "Proceed to Window 5",        note: "Look for our staff in orange polo shirts at Window 5 — they are expecting you." },
    { step: 3, label: "Present Lead Name & Reference", note: "Give your lead passenger name and GDX reference number to the representative." },
    { step: 4, label: "Receive Travel Sticker",     note: "You will receive a sticker that is required to board the bangka boat to the island." },
    { step: 5, label: "Port & Bangka Transfer",     note: "Walk or ride a tricycle to the port. Board the bangka boat (10–15 min ride to Boracay)." },
    { step: 6, label: "Hotel Transfer",             note: "At White Beach port, a tricycle or e-vehicle will take you to Henann Lagoon Resort." },
  ],
  kalibo: [
    { step: 1, label: "Meet Gladex Representative", note: "Look for Gladex signage at the arrivals area. Our staff will be waiting for joiner transfers." },
    { step: 2, label: "Joiner Shuttle Transfer",    note: "You will be grouped with other passengers for an air-conditioned van to Caticlan Port." },
    { step: 3, label: "Travel Time: 2–3 Hours",     note: "Travel time from Kalibo to Caticlan is 2–3 hours depending on traffic and road conditions." },
    { step: 4, label: "Coordination Notice",        note: "Shuttle may wait for additional passengers. Please be patient — this is a joiner transfer arrangement." },
    { step: 5, label: "Bangka Boat to Boracay",     note: "From Caticlan Port, board the bangka boat. 10-minute scenic crossing to the island." },
    { step: 6, label: "Hotel Transfer",             note: "Transfer from White Beach port to Henann Lagoon Resort is arranged and included." },
  ],
};

// ─── Transfer Instructions (Expanded Arrival & Departure Flow) ───────────────

const TRANSFER_FLOW = {
  arrival: [
    { step: 1, label: "Meet & Greet",     icon: "🤝", note: "Gladex representative will meet you at the airport arrivals area with a name placard." },
    { step: 2, label: "Land Transfer",    icon: "🚐", note: "Air-conditioned van or shuttle from airport to Caticlan Port. Pay terminal & environmental fee at cashier." },
    { step: 3, label: "Boat Transfer",    icon: "⛵", note: "Board the bangka boat at Caticlan Port. Scenic 10–15 minute crossing to Boracay Island." },
    { step: 4, label: "Hotel Transfer",   icon: "🏨", note: "Tricycle or e-vehicle from White Beach port to your hotel. Check in from 2:00 PM." },
  ],
  departure: [
    { step: 1, label: "Hotel Pickup",     icon: "🏨", note: "Transfer vehicle will arrive at your hotel as scheduled. Be packed and in the lobby 15 minutes early." },
    { step: 2, label: "Jetty Transfer",   icon: "🛥️", note: "Ride to the jetty port. Secure your luggage and keep travel documents accessible." },
    { step: 3, label: "Boat Transfer",    icon: "⛵", note: "Board the bangka boat back to Caticlan. Approx. 10–15 minute crossing." },
    { step: 4, label: "Airport Transfer", icon: "✈️", note: "Van transfer from Caticlan Port to the airport. Arrive 2 hours before your flight." },
  ],
  reminders: [
    "Settle all hotel charges and security deposit before checkout.",
    "Keep your travel sticker — you may need it at the port.",
    "Tag your luggage clearly with your name and contact number.",
    "Stay with your group during transfers for smooth coordination.",
  ],
};

// ─── Hotel Info ───────────────────────────────────────────────────────────────

const HOTEL_INFO = {
  checkIn: "2:00 PM – 3:00 PM",
  checkOut: "12:00 Noon",
  hotels: [{ category: "Included Accommodation", name: "Henann Lagoon Resort — Station 1, White Beach" }],
  policies: [
    "Present a valid government-issued ID and hotel voucher at check-in.",
    "Early check-in (before 2:00 PM) is subject to room availability — request at the front desk.",
    "A refundable security deposit is required upon check-in. Amount varies by room type.",
    "Check-out must be completed by 12:00 Noon. Late check-out may be charged accordingly.",
    "Luggage may be stored at the front desk after check-out — ask the concierge.",
  ],
};

// ─── Travel Reminders & Notes ─────────────────────────────────────────────────

const TOUR_REMINDERS = [
  { icon: "🧴", text: "Use reef-safe sunscreen only. Chemical sunscreens are permanently banned in Boracay." },
  { icon: "🚫", text: "No single-use plastics on the island. Bring a reusable bag and water bottle." },
  { icon: "⏰", text: "Tour assembly is at 7:30–8:00 AM. Be punctual at the meeting point — tours depart on time." },
  { icon: "👜", text: "Bring a waterproof dry bag for valuables during island hopping." },
  { icon: "☀️", text: "Apply sunscreen 30 minutes before sun exposure; reapply every 2 hours." },
  { icon: "🍽️", text: "Mandatory island hopping lunch is paid separately — bring ₱300–₱500 in cash." },
];

// ─── Outfit Guide ─────────────────────────────────────────────────────────────

const OUTFIT_GUIDE = [
  {
    occasion: "Day Tours & Land Tour",
    icon: "🌴",
    items: ["Lightweight breathable shirt", "Shorts or light pants", "Comfortable walking shoes or sandals", "Wide-brim hat or cap", "Light jacket for rain"],
    tip: "Comfort is key. Avoid heavy denim in tropical heat.",
  },
  {
    occasion: "Island Hopping",
    icon: "🌊",
    items: ["Swimwear or swim shorts", "Rash guard (reef-safe + sun protection)", "Water shoes or flip-flops", "Waterproof dry bag", "Quick-dry towel"],
    tip: "Bring a change of clothes for the boat ride home.",
  },
  {
    occasion: "Evening & Dining Out",
    icon: "🌅",
    items: ["Smart casual dress or polo", "Light jacket or cardigan", "Comfortable sandals or loafers", "Small crossbody bag", "Pashmina or scarf (for air-conditioning)"],
    tip: "White Beach restaurants range from casual to upscale.",
  },
  {
    occasion: "Water Activities",
    icon: "🤿",
    items: ["Two-piece swimwear or wetsuit", "UV-protective rash guard", "Water shoes (mandatory for helmet diving)", "Reef-safe sunscreen only", "Waterproof phone pouch"],
    tip: "Avoid wearing reef-damaging chemical sunscreens.",
  },
];

// ─── Travel Insurance ─────────────────────────────────────────────────────────

const INSURANCE_BENEFITS = [
  { icon: Clock,        title: "Trip Delays",          text: "Coverage for expenses incurred due to flight delays, cancellations, or diversions beyond your control." },
  { icon: X,            title: "Trip Cancellations",   text: "Reimbursement for prepaid, non-refundable costs if your trip is cancelled for covered reasons." },
  { icon: Heart,        title: "Medical Emergencies",  text: "Medical treatment costs, hospitalization, and emergency evacuation during your trip." },
  { icon: Luggage,      title: "Lost Baggage",         text: "Compensation for lost, stolen, or damaged luggage and personal belongings during travel." },
  { icon: Shield,       title: "Personal Accidents",   text: "Accidental injury or death benefits while traveling to and from Boracay." },
];

// ─── Travel Readiness Checklist ───────────────────────────────────────────────

const CHECKLIST_ITEMS = [
  { id: "id",        label: "Valid ID / Passport",   icon: BadgeCheck },
  { id: "flight",    label: "Flight Ticket",          icon: Plane },
  { id: "hotel",     label: "Hotel Voucher",          icon: Hotel },
  { id: "tour",      label: "Tour Confirmation",      icon: Ticket },
  { id: "cash",      label: "Cash & Cards",           icon: DollarSign },
  { id: "phone",     label: "Mobile Phone",           icon: Navigation },
  { id: "charger",   label: "Charger",                icon: Zap },
  { id: "powerbank", label: "Power Bank",             icon: Sparkles },
  { id: "medicine",  label: "Personal Medications",   icon: Heart },
  { id: "insurance", label: "Travel Insurance",       icon: Shield },
];

// ─── Packing Guide ────────────────────────────────────────────────────────────

const WHAT_TO_BRING = {
  documents: [
    "Valid Passport or Government-Issued ID",
    "GDX Travel Voucher (printed or digital)",
    "Flight E-Ticket (printed or screenshot)",
    "Hotel Voucher",
    "Travel Insurance Certificate",
    "Emergency Contact List",
  ],
  essentials: [
    "Powerbank (at least 20,000mAh)",
    "Universal travel adapter",
    "Pocket cash in Philippine Peso",
    "Reusable water bottle",
    "Hand sanitizer and wet wipes",
    "Portable first-aid kit",
  ],
  destinationSpecific: [
    "Swimwear and rash guards",
    "Waterproof sandals or flip-flops",
    "Reef-safe sunscreen (mandatory)",
    "Waterproof dry bag",
    "Underwater camera or GoPro",
    "Mosquito repellent",
  ],
};

// ─── Shopping Advisory ───────────────────────────────────────────────────────

const SHOPPING_ADVISORY = {
  title: "Important Shopping & Financial Advisory",
  warningLabel: "Please Read Before Shopping",
  body: "Boracay is a high-traffic tourist area where some vendors may charge premium prices for tours and services not pre-arranged through Gladex. Protect yourself from overcharging by following these guidelines.",
  rules: [
    "Only book optional tours through your Gladex consultant or authorized partners.",
    "Do not accept tour packages from beach vendors or unsolicited sellers.",
    "Always request an official receipt for any purchases or services.",
    "Confirm all tour inclusions in writing before making any payment.",
    "When in doubt about a service, contact your Gladex consultant first.",
    "Report price gouging to the Boracay Tourist Police at 117.",
  ],
  penaltyNote: "Gladex Travel is not responsible for expenses incurred from unauthorized bookings or purchases made outside the agreed package.",
};

// ─── Requirements ─────────────────────────────────────────────────────────────

const REQUIREMENTS = {
  filipino: [
    "Any valid government-issued photo ID",
    "Printed or digital GDX travel voucher",
  ],
  foreign: [
    "Valid passport — at least 6 months validity",
    "Return airline ticket confirmation",
    "Applicable visa if required by Philippine law",
    "Travel insurance is strongly recommended",
  ],
  visaInfo: "Most passport holders can enter the Philippines visa-free for up to 30 days. Please verify requirements with the Philippine Embassy in your country.",
};

// ─── Important Notices ────────────────────────────────────────────────────────

const IMPORTANT_NOTICES = [
  "Use reef-safe sunscreen only. Chemical sunscreens are permanently banned in Boracay.",
  "No single-use plastic bags, bottles, or Styrofoam containers are allowed on the island.",
  "Rates are valid only for the confirmed travel dates stated in your voucher.",
  "Optional tours are NOT included in your confirmed base package.",
  "Travel insurance is not included — enrollment is strongly recommended.",
];

// ─── Do's and Don'ts ─────────────────────────────────────────────────────────

const DOS = [
  "Practice responsible tourism — leave no trace on the beach.",
  "Dispose of waste properly in designated bins. Segregate your trash.",
  "Respect local culture, customs, and the indigenous Ati community.",
  "Follow safety instructions from tour guides and hotel staff at all times.",
  "Wear life jackets during all boat and water activities — no exceptions.",
  "Use reef-safe and biodegradable sunscreen and personal care products.",
  "Keep valuables secured in the hotel safe when not in use.",
];

const DONTS = [
  "Do not litter — no plastics, wrappers, or cigarette butts on the beach.",
  "Do not collect or damage corals, shells, or marine life.",
  "Do not feed fish, sea creatures, monkeys, or other island wildlife.",
  "Do not leave valuables unattended on the beach or at tour sites.",
  "No smoking on beaches or outside designated smoking areas.",
  "Do not book unlicensed tour operators — use only GDX-verified providers.",
  "Do not use chemical sunscreens — reef-safe sunscreen only.",
];

// ─── Connectivity ─────────────────────────────────────────────────────────────

const CONNECTIVITY = {
  intro: "Boracay has strong mobile coverage. Most hotels and restaurants offer complimentary WiFi.",
  options: [
    {
      icon: "📶", title: "Local SIM Card", recommended: true,
      description: "Purchase a prepaid SIM at the airport. Globe and Smart offer the best coverage on Boracay.",
      providers: [
        { name: "Globe",  note: "Strongest signal on White Beach. Recommended." },
        { name: "Smart",  note: "Reliable island-wide coverage." },
        { name: "DITO",   note: "Affordable unlimited data promos." },
      ],
    },
    {
      icon: "📡", title: "Hotel WiFi", recommended: false,
      description: "Included hotels provide complimentary WiFi in rooms and common areas.",
      steps: [
        "Connect to the hotel network on your check-in card.",
        "Enter the password from the front desk.",
        "For best speeds, stay near the lobby.",
      ],
    },
  ],
  tips: [
    "Download Google Maps offline for Boracay before traveling.",
    "WhatsApp and Viber work well on both SIM data and hotel WiFi.",
    "Charge devices every night — power banks are essential for beach days.",
  ],
};

// ─── Currency ─────────────────────────────────────────────────────────────────

const CURRENCY = {
  symbol: "₱", currency: "Philippine Peso (PHP)",
  exchangeRate: "Approx. ₱56–₱58 per USD (rates vary daily).",
  usdNote: "USD accepted at exchange counters. Credit cards accepted at most mid-range establishments.",
  recommendedCash: "Budget ₱2,000–₱5,000 per person per day.",
  whereToExchange: [
    { place: "NAIA Airport",          note: "Exchange at terminal forex counters before your flight." },
    { place: "D'Mall Money Changers", note: "Multiple authorized stalls with competitive rates." },
    { place: "BDO and BPI ATMs",      note: "Located at D'Mall. Accept international cards." },
  ],
  roughPrices: [
    { item: "Tricycle fare (per trip)",  price: "₱10–₱20" },
    { item: "Convenience store water",   price: "₱20–₱30" },
    { item: "Local restaurant meal",     price: "₱150–₱400" },
    { item: "Beachfront dining (meal)",  price: "₱400–₱900" },
    { item: "Souvenir items",            price: "₱50–₱500" },
  ],
  tips: [
    "Carry small bills — tricycle drivers rarely have change.",
    "Avoid exchanging at hotels — rates are unfavorable.",
    "ATMs may run out during peak season — exchange enough on arrival.",
    "Most D'Mall restaurants accept GCash and credit cards.",
  ],
};

// ─── Destination Highlights ───────────────────────────────────────────────────

const HIGHLIGHTS = [
  { name: "White Beach",        desc: "World-famous 4km stretch of powdery white sand. Best at sunset from Station 3.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80&fit=crop" },
  { name: "Puka Shell Beach",   desc: "Secluded northern shore with raw natural beauty and fewer crowds.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80&fit=crop" },
  { name: "Bulabog Beach",      desc: "The island's water sports and kite surfing hub on the eastern shore.", image: "https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?w=800&q=80&fit=crop" },
  { name: "D'Mall",             desc: "Main shopping, dining, and souvenir hub at Station 2.", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&fit=crop" },
  { name: "Willy's Rock",       desc: "Iconic seaside shrine at the edge of White Beach — perfect for photos.", image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80&fit=crop" },
  { name: "Sunset Viewing",     desc: "Legendary Boracay sunsets from Station 3. Arrive 30 minutes early for the best spot.", image: "https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?w=800&q=80&fit=crop" },
];

// ─── Emergency Contacts ───────────────────────────────────────────────────────

const EMERGENCY_CONTACTS = [
  {
    icon: "📞", category: "Gladex Travel Support",
    contacts: [
      { label: "Customer Care (24/7)",     value: "+63 917 875 2200" },
      { label: "Ms. Che — Consultant",     value: "+63 985 045 3635" },
      { label: "Mr. Mark — Operations",   value: "+63 995 416 7143" },
    ],
  },
  {
    icon: "🆘", category: "Emergency Services",
    contacts: [
      { label: "Boracay Tourist Police",       value: "117" },
      { label: "Philippine Emergency Hotline", value: "911" },
      { label: "PhilHealth Emergency",         value: "1555" },
    ],
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  { q: "When do we receive our travel vouchers?",         a: "Your digital vouchers are sent to your registered email 48–72 hours before your travel date. Check your inbox and spam folder. Contact your consultant immediately if not received." },
  { q: "What is the best time to visit Boracay?",         a: "The best time to visit Boracay is during the dry season from November to May. Peak season is December to April when weather is most predictable. June to October is typhoon season — tours may be affected." },
  { q: "Is Boracay family-friendly?",                     a: "Yes, Boracay is very family-friendly. White Beach has calm, shallow waters ideal for children. The island also has family restaurants, activities, and calm lagoon areas. Just ensure everyone follows reef-safe practices." },
  { q: "Are there ATMs available in Boracay?",            a: "Yes, there are BDO and BPI ATMs located at D'Mall (Station 2). It is recommended to bring enough cash as ATMs may run out during peak season. International cards are accepted." },
  { q: "What is the WiFi situation in Boracay?",          a: "Most hotels and restaurants offer complimentary WiFi. For reliable data throughout your stay, purchase a local prepaid SIM (Globe or Smart) at the airport before your flight." },
  { q: "Do establishments accept credit cards?",          a: "Most mid-range to upscale restaurants, dive shops, and souvenir stores at D'Mall accept Visa and Mastercard. Street stalls and tricycle rides are cash-only. Bring a mix of cards and cash." },
  { q: "Is Boracay safe for tourists?",                   a: "Yes, Boracay is generally very safe. The island has an active tourist police presence. Use common sense: secure valuables, avoid isolated beaches at night, and only book tours through authorized providers." },
  { q: "Are land and sea transfers included?",            a: "Yes, roundtrip land transfers (airport to port) and sea transfers (bangka boat to island) are fully included in your package. Transfers are coordinated by Gladex Travel and covered by your voucher." },
  { q: "What should I do in case of an emergency?",       a: "Contact your Gladex consultant immediately at +63 917 875 2200 (24/7). For medical emergencies, call 1555 (PhilHealth). For security emergencies, call 117 (Boracay Tourist Police) or 911." },
  { q: "What if my flight is delayed or rescheduled?",    a: "Inform your Gladex handling agent immediately — before you board and as soon as you know. Our operations team will adjust your transfers and hotel arrangements. Call +63 917 875 2200 right away." },
  { q: "What if it rains or weather is bad?",             a: "Tour timings may be adjusted depending on weather and sea conditions. In the event that local authorities or the Coast Guard suspend water activities, guests may be eligible for a reschedule subject to availability within the travel period." },
  { q: "Is the island hopping tour refundable?",          a: "All tours are pre-booked and reserved in advance to secure your slot. Cancellation of tours before or on the day of the scheduled activity is generally not permitted and is considered non-refundable. To change the schedule, inform us at least one day before." },
  { q: "Can I add optional tours after booking?",         a: "Yes, optional tours can be arranged through your Gladex consultant. Contact us at least 2 days before your activity date to confirm availability and secure your slot. Additional payment will apply." },
  { q: "Is travel insurance required?",                   a: "Travel insurance is not mandatory but is strongly recommended. It covers trip delays, cancellations, medical emergencies, lost baggage, and personal accidents. Coordinate with your consultant to add it to your booking at least 3 days before departure." },
  { q: "What time is hotel check-in and check-out?",      a: "Standard check-in time is 2:00 PM to 3:00 PM. Check-out is at 12:00 Noon. Early check-in may be requested subject to room availability. Luggage can be stored at the front desk if your room is not yet ready." },
];

// ─── Activities ───────────────────────────────────────────────────────────────

const ACTIVITIES = [
  {
    id: "land-tour", name: "Land Tour", tag: "Sightseeing",
    desc: "Explore Boracay's hidden inland spots, local communities, and scenic viewpoints away from the beach.",
    details: "The Boracay Land Tour takes you through the island's interior, visiting local sites, viewpoints, and cultural spots you won't find on the beach. Ideal for those who want to see the full character of the island.",
    idealFor: "Families, couples, and first-time Boracay visitors.",
    transport: "Tricycle or e-vehicle tour. Duration approx. 2–3 hours.",
    notes: "Confirm exact pickup time with your consultant. Bring cash for entrance fees.",
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80&fit=crop",
  },
  {
    id: "parasailing", name: "Parasailing", tag: "Adventure",
    desc: "Soar 200 feet above White Beach for breathtaking panoramic views of the island and coastline.",
    details: "Tandem or solo parasailing over the famous White Beach. A speedboat tows you while you float in the air with stunning aerial views of Boracay's coastline and crystal-clear waters below.",
    idealFor: "Adventure seekers and those who want the ultimate aerial view.",
    transport: "Speedboat launch from White Beach. Duration approx. 15–20 minutes in the air.",
    notes: "Minimum weight requirements apply. Not recommended for those with heart conditions.",
    image: "https://images.unsplash.com/photo-1475666675596-cca2035b3d79?w=800&q=80&fit=crop",
  },
  {
    id: "helmet-diving", name: "Helmet Diving", tag: "Underwater",
    desc: "Walk on the ocean floor and encounter Boracay's vibrant marine life — no swimming skills required.",
    details: "A unique underwater experience where you wear a diving helmet and walk along the seabed in shallow water. You'll see colorful fish, corals, and starfish up close without needing to know how to swim.",
    idealFor: "Non-swimmers, seniors, and families with children.",
    transport: "Short boat ride to the dive site. Total duration approx. 1.5–2 hours.",
    notes: "Not recommended for those with respiratory or ear conditions. No experience needed.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800&q=80&fit=crop",
  },
  {
    id: "paraw-sunset", name: "Sunset Paraw Sailing", tag: "Scenic",
    desc: "Sail on a traditional Filipino paraw and witness one of Boracay's legendary sunsets from the water.",
    details: "A 1-hour sunset sail aboard a traditional double-outrigger Filipino sailing vessel. Watch Boracay's famous golden sunset from the sea — one of the most iconic experiences on the island.",
    idealFor: "Couples, honeymooners, and photography enthusiasts.",
    transport: "Departs from White Beach around 5:00 PM–5:30 PM. Duration approx. 1 hour.",
    notes: "Subject to weather and sea conditions. Book in advance as slots fill up quickly.",
    image: "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800&q=80&fit=crop",
  },
  {
    id: "atv", name: "ATV Adventure", tag: "Off-Road",
    desc: "Off-road quad bike ride through Boracay's scenic inland trails with jungle paths and viewpoints.",
    details: "Ride all-terrain vehicles through Boracay's inland jungle paths and mountain trails. Stop at elevated viewpoints for panoramic island and ocean views. An exciting way to explore Boracay beyond the beach.",
    idealFor: "Thrill-seekers, couples, and adventurous travelers.",
    transport: "Meets at the ATV station in Boracay. Helmets and safety gear provided. Duration 45–60 mins.",
    notes: "Valid driver's license may be required. Minimum age applies. Wear closed-toe shoes.",
    image: "https://images.unsplash.com/photo-1533551741965-afbb6b01f978?w=800&q=80&fit=crop",
  },
  {
    id: "private-island", name: "Private Island Tour", tag: "Exclusive",
    desc: "Exclusive island-hopping with a private boat, personal guide, and access to secluded sandbars.",
    details: "Your own private bangka boat, personal island guide, and a custom route through Boracay's surrounding islands and hidden sandbars. Includes snorkeling stops, swimming time, and a peaceful beach break.",
    idealFor: "Families, groups, honeymooners, or anyone wanting a personalized experience.",
    transport: "Private boat departure from White Beach. Customizable itinerary. 4–6 hours.",
    notes: "Includes snorkeling equipment. Lunch not included. Reef-safe sunscreen required.",
    image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&q=80&fit=crop",
  },
];

// ─── Destination Guide Extended ──────────────────────────────────────────────

const DESTINATION_EXTRAS = {
  food: [
    { emoji: "🦐", name: "Grilled Seafood",    note: "Fresh prawns, squid, and fish at beachside restaurants along White Beach." },
    { emoji: "🥥", name: "Buko (Coconut)",      note: "Cold young coconut drinks from street vendors — cheap, refreshing, and authentic." },
    { emoji: "🌭", name: "Chori Burger",         note: "A Boracay street favorite — grilled chorizo burger from local stalls along the promenade." },
    { emoji: "🍦", name: "Halo-Halo",            note: "Classic Filipino shaved ice dessert. Best enjoyed at beachfront cafes after a tour." },
    { emoji: "🍳", name: "Hotel Breakfast Buffet",note: "Your daily breakfast is included — Henann Lagoon Resort offers a full Filipino and international buffet." },
  ],
  photoSpots: [
    { emoji: "🪨", name: "Willy's Rock",         note: "Iconic rock formation at Station 1. Best shot at golden hour — low tide exposes more shoreline." },
    { emoji: "🏖️", name: "Puka Shell Beach",     note: "Rustic white sand beach in the north. Wide-angle shots with a turquoise sea backdrop." },
    { emoji: "🌅", name: "White Beach Sunset Strip", note: "Walk along Station 3 during golden hour. Best Boracay sunset photos happen here." },
    { emoji: "🏝️", name: "Crystal Cove Island",  note: "Visited during island hopping — caves, rock formations, and clear water for underwater shots." },
    { emoji: "🛥️", name: "Bangka Boat at Sea",   note: "Ask your island hopping guide for a shot at the bow with bright blue water behind you." },
  ],
  localTips: [
    { emoji: "🛺", text: "Use E-Trikes for affordable island transport — negotiate ₱10–₱20 per ride within stations." },
    { emoji: "🛍️", text: "Souvenir stalls near D'Mall are negotiable — be polite and firm when bargaining." },
    { emoji: "🌅", text: "Book activities for early morning (7–9 AM) — calmer seas, fewer crowds, better lighting." },
    { emoji: "🧴", text: "Reef-safe sunscreen is legally enforced in Boracay — bring your own or buy locally." },
    { emoji: "💵", text: "Smaller stalls and tricycles are cash-only. Withdraw from D'Mall ATMs on arrival." },
    { emoji: "🌊", text: "Best swimming beach for families with young children is Station 2 — shallower waters." },
  ],
  quickInfo: [
    { emoji: "⛅", label: "Best Season",    value: "November to May (Dry season). Peak: December to April." },
    { emoji: "🌡️", label: "Weather",       value: "Hot and humid year-round. Typhoon season: June–October." },
    { emoji: "🗣️", label: "Language",      value: "Filipino and English widely spoken across the island." },
    { emoji: "💱", label: "Currency",       value: "Philippine Peso (₱). ATMs at D'Mall. Credit cards at most hotels." },
    { emoji: "🚌", label: "Transport",      value: "E-trikes, multicabs, and habal-habal are the main island vehicles." },
    { emoji: "🛡️", label: "Safety",        value: "Generally safe. Tourist police patrol White Beach. Avoid isolated beaches at night." },
  ],
};

// ─── Checkout Add-Ons (Phase 1 — Display Only) ───────────────────────────────

const CHECKOUT_ADDONS = [
  { category: "Optional Tours",    icon: "🌊", items: ["Island Hopping Tour", "Boracay Land Tour", "Parasailing", "Helmet Diving", "Sunset Paraw Sailing", "ATV Adventure", "Private Island Tour"] },
  { category: "Travel Protection", icon: "🛡️", items: ["Basic Travel Insurance", "Standard Travel Insurance (Recommended)", "Premium Travel Insurance"] },
  { category: "Transfer Upgrades", icon: "🚐", items: ["Private Airport Transfer", "Additional Boat Transfer", "VIP Meet & Greet Service"] },
];

const PAYMENT_METHODS = [
  { emoji: "💚", label: "GCash" },
  { emoji: "🔵", label: "Maya (PayMaya)" },
  { emoji: "💳", label: "Visa / Mastercard" },
  { emoji: "🏦", label: "Bank Transfer" },
  { emoji: "🔗", label: "Secure Payment Link" },
];

// ─── Assistance Contacts ──────────────────────────────────────────────────────

const ASSISTANCE_CONTACTS = [
  { label: "Booking Changes / Voucher Re-issuance", value: "Message your consultant on Viber or WhatsApp." },
  { label: "On-Trip Emergency Support",             value: "+63 917 875 2200 (24/7 Operations Line)" },
  { label: "Hotel Concerns",                        value: "Henann Lagoon Resort front desk on arrival." },
  { label: "General Inquiries",                     value: "Facebook: Gladex Travel and Tours Corp." },
];

// ─── Shared UI Components ─────────────────────────────────────────────────────

/** @param {{ children: any, delay?: number }} props */
function FadeIn({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

/** @param {{ eyebrow: string, title: string, eyebrowColor?: string }} props */
function SectionHeader({ eyebrow, title, eyebrowColor = "#f97316" }) {
  return (
    <div className="mb-6">
      <p className="text-[10px] sm:text-xs font-black tracking-[0.28em] uppercase mb-2" style={{ color: eyebrowColor }}>
        {eyebrow}
      </p>
      <h2 className="font-black text-xl sm:text-2xl md:text-3xl leading-tight">{title}</h2>
    </div>
  );
}

/** @param {{ borderColor: string }} props */
function SectionDivider({ borderColor }) {
  return <div className="h-px w-full" style={{ backgroundColor: borderColor }} />;
}

/** @param {{ q: string, a: string, card: object, borderColor: string, textPrimary: string, textMuted: string }} props */
function FAQItem({ q, a, card, borderColor, textPrimary, textMuted }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={false}
      className="border rounded-2xl overflow-hidden transition-colors duration-200"
      style={{ ...card, borderColor: open ? "rgba(249,115,22,0.35)" : borderColor }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="font-semibold text-sm leading-snug" style={{ color: textPrimary }}>{q}</span>
        <ChevronDown
          className="w-4 h-4 shrink-0 transition-transform duration-300"
          style={{ color: open ? "#f97316" : textMuted, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-4 border-t" style={{ borderColor }}>
              <p className="text-sm leading-relaxed" style={{ color: textMuted }}>{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/** @param {{ id: string, activity: any, card: object, borderColor: string, textPrimary: string, textMuted: string, surfaceBg: string }} props */
function ActivityCard({ activity, card, borderColor, textPrimary, textMuted, surfaceBg }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <motion.div
      layout
      className="border rounded-2xl overflow-hidden flex flex-col"
      style={{ ...card }}
    >
      <div className="overflow-hidden relative" style={{ aspectRatio: "4/3" }}>
        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/20 text-white bg-black/40 tracking-wider uppercase">
            {activity.tag}
          </span>
        </div>
      </div>
      <div className="p-4 sm:p-5 flex flex-col flex-1">
        <p className="font-bold text-sm sm:text-base mb-1.5" style={{ color: textPrimary }}>{activity.name}</p>
        <p className="text-xs sm:text-sm leading-relaxed mb-3" style={{ color: textMuted }}>{activity.desc}</p>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: "hidden" }}
            >
              <div className="space-y-2.5 mb-4 pt-1">
                <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: surfaceBg }}>
                  <p className="font-bold mb-0.5" style={{ color: "#f97316" }}>Description</p>
                  <p style={{ color: textMuted }}>{activity.details}</p>
                </div>
                <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: surfaceBg }}>
                  <p className="font-bold mb-0.5" style={{ color: "#f97316" }}>Ideal For</p>
                  <p style={{ color: textMuted }}>{activity.idealFor}</p>
                </div>
                <div className="rounded-xl p-3 text-xs" style={{ backgroundColor: surfaceBg }}>
                  <p className="font-bold mb-0.5" style={{ color: "#f97316" }}>Transport & Duration</p>
                  <p style={{ color: textMuted }}>{activity.transport}</p>
                </div>
                <div className="rounded-xl p-3 text-xs border-l-2" style={{ backgroundColor: surfaceBg, borderLeftColor: "#f97316" }}>
                  <p className="font-bold mb-0.5" style={{ color: "#f97316" }}>Important Notes</p>
                  <p style={{ color: textMuted }}>{activity.notes}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-auto flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest border transition-all"
            style={{
              borderColor: expanded ? "#f97316" : borderColor,
              color: expanded ? "#f97316" : textMuted,
              backgroundColor: expanded ? "rgba(249,115,22,0.06)" : "transparent",
            }}
          >
            {expanded ? "Show Less" : "View Details"}
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #f97316, #b45309)" }}
          >
            Reserve Slot
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Back To Top Button ───────────────────────────────────────────────────────

/** @param {{ visible: boolean }} props */
function BackToTopButton({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          key="btt"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.25 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-5 z-50 w-11 h-11 rounded-full flex items-center justify-center shadow-lg border transition-all hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #f97316, #b45309)",
            borderColor: "rgba(249,115,22,0.4)",
            boxShadow: "0 4px 18px rgba(249,115,22,0.35)",
          }}
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4 text-white" strokeWidth={2.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DestinationPreview() {
  const { slug }     = useParams();
  const navigate     = useNavigate();
  const { darkMode } = useTheme();

  // ── Design tokens
  const bg          = darkMode ? "#0c0c0c"                : "#f4f3f1";
  const cardBg      = darkMode ? "#141414"                : "#ffffff";
  const surfaceBg   = darkMode ? "rgba(255,255,255,0.035)": "rgba(0,0,0,0.028)";
  const textPrimary = darkMode ? "#f0f0f0"                : "#1a1a1a";
  const textMuted   = darkMode ? "rgba(255,255,255,0.45)" : "#6b7280";
  const borderColor = darkMode ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const cardShadow  = darkMode
    ? "0 1px 3px rgba(0,0,0,0.5), 0 4px 20px rgba(0,0,0,0.35)"
    : "0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.05)";

  const card  = { backgroundColor: cardBg, borderColor, boxShadow: cardShadow };
  const muted = { color: textMuted };

  // ── Checklist state with localStorage
  const [checklist, setChecklist] = useState(() => {
    try {
      const saved = localStorage.getItem(`gdx-checklist-${slug}`);
      return saved ? JSON.parse(saved) : Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.id, false]));
    } catch { return Object.fromEntries(CHECKLIST_ITEMS.map(i => [i.id, false])); }
  });

  useEffect(() => {
    try { localStorage.setItem(`gdx-checklist-${slug}`, JSON.stringify(checklist)); } catch {}
  }, [checklist, slug]);

  const [arrivalTab,    setArrivalTab]    = useState("caticlan");
  const [travelTab,     setTravelTab]     = useState("before");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [videoLoaded,   setVideoLoaded]   = useState(false);
  const [videoFailed,   setVideoFailed]   = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mark video as failed if it hasn't signalled onLoad within 8 s
  useEffect(() => {
    const t = setTimeout(() => {
      setVideoFailed((current) => (current ? current : !videoLoaded));
    }, 8000);
    return () => clearTimeout(t);
  }, [videoLoaded]);

  // ── Phase 2: booking lookup state ───────────────────────────────────────────
  const [bookingCode,    setBookingCode]    = useState("");
  const [bookingData,    setBookingData]    = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError,   setBookingError]   = useState(null);

  // Returns the first non-null value found under any of the provided key names.
  // Handles variation in column naming across different table designs.
  const getField = (row, ...keys) => {
    for (const k of keys) {
      const v = row?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return null;
  };

  // Queries Supabase for a booking matching the entered code.
  // Tries booking_details first, then the bookings table as a fallback.
  const lookupBooking = async () => {
    const code = bookingCode.trim();
    if (!code) return;

    setBookingLoading(true);
    setBookingError(null);
    setBookingData(null);

    const TABLES = ["booking_details", "bookings"];

    let found = null;
    for (const table of TABLES) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select("*")
          .or(
            `booking_code.ilike.${code},` +
            `voucher_number.ilike.${code},` +
            `confirmation_number.ilike.${code},` +
            `reference_number.ilike.${code}`
          )
          .limit(1);

        if (!error && data && data.length > 0) {
          found = data[0];
          break;
        }
      } catch (_) {
        // table doesn't exist or column missing — try next
      }
    }

    if (found) {
      setBookingData(found);
    } else {
      setBookingError(
        "No booking found for that reference number. " +
        "Please double-check your GDX Confirmation Number or Voucher Number."
      );
    }

    setBookingLoading(false);
  };

  const scrollTo = (/** @type {string} */ id) =>
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const checkedCount = Object.values(checklist).filter(Boolean).length;
  const readinessPct = Math.round((checkedCount / CHECKLIST_ITEMS.length) * 100);
  const sectionGap   = "py-10 lg:py-12";

  return (
    <div className="font-sans min-h-screen transition-colors duration-500" style={{ background: bg, color: textPrimary }}>
      <DestinationNavbar />

      {/* ═══════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════ */}
      <section className="relative flex flex-col items-center justify-center text-center overflow-hidden" style={{ minHeight: "100vh" }}>
        <motion.div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${HERO_IMAGE}')`, backgroundPosition: "center 40%" }}
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/80" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 pt-28 pb-20">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-orange-400/35 bg-orange-500/10 backdrop-blur-sm mb-7"
          >
            <MapPin className="w-3 h-3 text-orange-400" />
            <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-orange-300">Philippines · Boracay Island</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.7 }}
            className="font-black text-white uppercase leading-none mb-3"
            style={{ fontSize: "clamp(3.5rem, 10vw, 7rem)", letterSpacing: "-0.02em", textShadow: "0 0 60px rgba(249,115,22,0.2)" }}
          >
            BORACAY
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
            className="font-black uppercase tracking-[0.22em] mb-4"
            style={{ color: "#fdba74", fontSize: "clamp(0.75rem, 2.5vw, 1.1rem)" }}
          >
            3D2N All-In Package
          </motion.p>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55, duration: 0.6 }}
            className="text-white/55 text-xs sm:text-sm max-w-sm mx-auto mb-10 leading-relaxed"
          >
            Your complete island getaway — every detail planned so you can simply enjoy the moment.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            {[
              { label: "View Itinerary",      id: "itinerary",    solid: true  },
              { label: "Travel Requirements", id: "requirements", solid: false },
              { label: "Optional Activities", id: "activities",   solid: false },
            ].map(({ label, id, solid }) => (
              <motion.button
                key={id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => scrollTo(id)}
                className="flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-widest px-7 py-3.5 rounded-xl transition-colors w-full sm:w-auto"
                style={solid
                  ? { background: "linear-gradient(135deg, #f97316, #b45309)", color: "#fff", boxShadow: "0 8px 24px rgba(249,115,22,0.35)" }
                  : { backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.22)", background: "rgba(255,255,255,0.1)", color: "#fff" }
                }
              >
                {label}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5"
        >
          <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white/35">Scroll</span>
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-7 bg-gradient-to-b from-white/30 to-transparent"
          />
        </motion.div>

        <div className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{ background: "linear-gradient(90deg, #b45309, #f97316, #fdba74, #f97316, #b45309)" }}
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          VIDEO BRIEFING
      ═══════════════════════════════════════════════════════ */}
      <div className="bg-black py-14 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,140,0,0.22) 0%, transparent 70%)" }}
        />
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-10">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-[10px] font-black tracking-[0.3em] uppercase mb-2" style={{ color: "#f97316" }}
            >Official Pre-Departure Video</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="font-black text-white text-2xl sm:text-3xl lg:text-4xl mb-2"
            >Watch Before You Travel</motion.h2>
            <p className="text-white/50 text-sm max-w-xs mx-auto leading-relaxed">
              Your Boracay orientation video. Watch this before your departure date.
            </p>
          </div>

          {/* ── Portrait video — 9:16, centred, play button at true 50/50 ─ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center w-full"
          >
            {/*
              Width is clamped so the portrait frame never stretches.
              On mobile it fills up to 80 vw, on desktop caps at 320 px —
              this keeps the phone-screen aesthetic on every breakpoint.
            */}
            <div style={{ width: "clamp(220px, 70vw, 320px)" }}>
              {/*
                aspectRatio: "9 / 16" gives a true portrait container.
                The iframe is placed absolute inset-0 so it fills the frame
                exactly — Google Drive's player renders its play button at
                50% / 50% of the iframe, which is now identical to the
                visual centre of this container.
                Badge is at the BOTTOM so nothing overlaps the centre region.
              */}
              <div
                className="relative w-full rounded-[1.75rem] overflow-hidden border border-white/12"
                style={{
                  aspectRatio: "9 / 16",
                  background: "#000",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 3px rgba(255,255,255,0.06)",
                }}
              >
                {/* ── Live iframe ──
                    ?rm=minimal  strips the Drive header bar and logo link
                    that would otherwise appear at the top of the player.     */}
                {!videoFailed && (
                  <iframe
                    src={`${VIDEO_URL}?rm=minimal`}
                    className="absolute inset-0 w-full h-full border-0"
                    /*
                      sandbox — browser-level enforcement (not a CSS trick)
                      ─────────────────────────────────────────────────────
                      Tokens INCLUDED (minimum needed for the player):
                        allow-scripts        — video player JavaScript
                        allow-same-origin    — Google Drive session/storage
                        allow-forms          — internal player form elements
                        allow-presentation   — Fullscreen API

                      Tokens OMITTED (intentionally):
                        allow-popups         — clicking "Open in Drive" or
                                               any external-launch button now
                                               does NOTHING; the browser
                                               silently discards the attempt
                        allow-top-navigation — the iframe cannot redirect or
                                               navigate the parent page
                        allow-popups-to-escape-sandbox — belt + braces

                      Switching to YouTube/Vimeo makes all of this unnecessary.
                    */
                    sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                    allow="autoplay; fullscreen; encrypted-media"
                    allowFullScreen
                    title="Boracay Destination Briefing"
                    style={{ background: "#000" }}
                    onLoad={() => setVideoLoaded(true)}
                  />
                )}

                {/* ── Fallback (no external links) ── */}
                {videoFailed && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
                    style={{ background: "linear-gradient(170deg,#0d0d0d 0%,#1a0800 100%)" }}
                  >
                    <span className="text-5xl mb-5">🎬</span>
                    <p className="text-white font-bold text-base mb-2">Briefing Video Unavailable</p>
                    <p className="text-white/50 text-sm leading-relaxed">
                      Please check your connection or contact your Gladex consultant for assistance.
                    </p>
                  </div>
                )}

                {/*
                  ── Pointer-blocking overlays ───────────────────────────────
                  Google Drive injects its own UI (external-launch button,
                  logo link, pop-out icon) inside the cross-origin iframe —
                  these cannot be removed with CSS from outside.

                  Each overlay div below is transparent but sits above the
                  iframe in z-order.  A DOM element with default
                  `pointer-events: auto` absorbs ALL pointer events in its
                  area, silently preventing those clicks from ever reaching
                  the iframe beneath it.

                  Areas covered:
                  ① Top bar  — Drive header / "Open in Drive" toolbar
                  ② Top-right corner — persistent logo / external icon
                  ③ Bottom-right corner — pop-out / external-launch button

                  The vertical centre (play button) and the bottom-left
                  quarter (standard play/pause/volume/progress bar) are
                  intentionally left uncovered.
                */}
                {!videoFailed && (
                  <>
                    {/* ① Top header bar */}
                    <div
                      className="absolute top-0 left-0 right-0 z-20"
                      style={{ height: "56px", cursor: "default" }}
                    />
                    {/* ② Top-right corner — logo / icon */}
                    <div
                      className="absolute top-0 right-0 z-20"
                      style={{ width: "72px", height: "88px", cursor: "default" }}
                    />
                    {/* ③ Bottom-right corner — pop-out / external-launch */}
                    <div
                      className="absolute bottom-0 right-0 z-20"
                      style={{ width: "72px", height: "56px", cursor: "default" }}
                    />
                  </>
                )}

                {/* ── Badge pinned to BOTTOM-CENTRE — above all overlays ── */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-30">
                  <div
                    className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border"
                    style={{
                      background: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      borderColor: "rgba(255,255,255,0.18)",
                      color: "#fff",
                    }}
                  >
                    {videoFailed ? "⚠️ Unavailable" : "🎬 Official Briefing Video"}
                  </div>
                </div>
              </div>
            </div>

            {/* Topics covered — centred grid below the portrait frame */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm">
              {[
                { icon: "✈️", text: "Arrival & airport walkthrough" },
                { icon: "🏨", text: "Hotel check-in procedures" },
                { icon: "🌊", text: "Tour schedules & reminders" },
                { icon: "🛡️", text: "Safety tips & eco guidelines" },
                { icon: "📞", text: "Emergency contacts" },
                { icon: "📋", text: "Important do's & don'ts" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-xs text-white/55">
                  <span className="shrink-0">{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN BRIEFING CONTENT
      ═══════════════════════════════════════════════════════ */}
      <main className="max-w-5xl mx-auto px-4 pb-28" style={{ background: bg }}>

        {/* ── PHASE 2: BOOKING LOOKUP ──────────────────────── */}
        <FadeIn>
          <div className="py-8">
            <SectionHeader eyebrow="Your Booking" title="Access Your Travel Details" />

            {/* Search row */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <input
                type="text"
                value={bookingCode}
                onChange={e => setBookingCode(e.target.value)}
                onKeyDown={e => e.key === "Enter" && lookupBooking()}
                placeholder="Enter GDX Confirmation Number or Voucher Number"
                className="flex-1 px-4 py-3.5 border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                style={{ backgroundColor: surfaceBg, borderColor, color: textPrimary }}
              />
              <button
                onClick={lookupBooking}
                disabled={bookingLoading || !bookingCode.trim()}
                className="px-7 py-3.5 rounded-xl font-black text-sm text-white uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
                style={{ background: "linear-gradient(135deg,#f97316,#b45309)" }}
              >
                {bookingLoading ? "Searching…" : "View My Booking"}
              </button>
            </div>

            {/* Error */}
            {bookingError && (
              <div className="px-4 py-3 rounded-xl border text-sm mb-4"
                style={{ borderColor:"rgba(239,68,68,0.3)", backgroundColor: darkMode ? "#1c0808" : "#fff5f5", color:"#ef4444" }}
              >
                {bookingError}
              </div>
            )}

            {/* Booking card */}
            {bookingData && (
              <div className="border rounded-2xl overflow-hidden" style={card}>

                {/* Header row */}
                <div className="flex items-center gap-3 px-5 py-4 border-b"
                  style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(249,115,22,0.12)" }}
                  >
                    <User className="w-5 h-5" style={{ color:"#f97316" }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-base truncate">
                      {getField(bookingData,"client_name","lead_name","passenger_name","name") ?? "—"}
                    </p>
                    <p className="text-xs truncate" style={muted}>
                      Ref: {getField(bookingData,"booking_code","confirmation_number","reference_number","voucher_number") ?? "—"}
                    </p>
                  </div>
                  <div className="ml-auto shrink-0">
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
                      style={{ backgroundColor:"rgba(34,197,94,0.12)", color:"#22c55e" }}
                    >
                      {getField(bookingData,"booking_status","status") ?? "Confirmed"}
                    </span>
                  </div>
                </div>

                {/* Detail grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5">
                  {[
                    { label:"Destination",  icon:MapPin,     keys:["destination","destination_name","location"] },
                    { label:"Travel Date",  icon:Calendar,   keys:["travel_date","travel_date_start","departure_date","check_in_date"] },
                    { label:"Hotel",        icon:Hotel,      keys:["hotel","hotel_name","accommodation"] },
                    { label:"Guests",       icon:User,       keys:["number_of_guests","guests","pax","passengers"] },
                    { label:"Consultant",   icon:Globe,      keys:["assigned_consultant","consultant","agent_name","consultant_name"] },
                    { label:"Payment",      icon:CreditCard, keys:["payment_status","payment"] },
                  ].map(({ label, icon:Icon, keys }) => (
                    <div key={label} className="border rounded-xl p-3"
                      style={{ borderColor, backgroundColor: surfaceBg }}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className="w-3 h-3" style={{ color:"#f97316" }} />
                        <span className="text-[10px] font-bold uppercase tracking-wider" style={muted}>{label}</span>
                      </div>
                      <p className="font-bold text-sm truncate">
                        {getField(bookingData, ...keys) ?? "—"}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Package inclusions */}
                {(() => {
                  const raw = getField(bookingData,"package_inclusion","inclusions","package_inclusions");
                  if (!raw) return null;
                  const items = Array.isArray(raw)
                    ? raw
                    : String(raw).split(",").map(s => s.trim()).filter(Boolean);
                  return (
                    <div className="px-5 pb-5">
                      <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color:"#f97316" }}>
                        Package Inclusions
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item, i) => (
                          <span key={i} className="px-2.5 py-1 rounded-full text-xs border"
                            style={{ borderColor, color: textMuted }}
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Download links (voucher / itinerary) */}
                {(() => {
                  const voucherUrl  = getField(bookingData,"voucher_pdf_url","voucher_url","voucher_pdf");
                  const itinUrl     = getField(bookingData,"itinerary_pdf_url","itinerary_url","itinerary_pdf");
                  if (!voucherUrl && !itinUrl) return null;
                  return (
                    <div className="px-5 pb-5 pt-4 flex flex-wrap gap-3 border-t" style={{ borderColor }}>
                      {voucherUrl && (
                        <a href={voucherUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                          style={{ borderColor:"#f97316", color:"#f97316" }}
                        >
                          <Ticket className="w-3.5 h-3.5" /> Download Voucher
                        </a>
                      )}
                      {itinUrl && (
                        <a href={itinUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all hover:opacity-80"
                          style={{ borderColor:"#f97316", color:"#f97316" }}
                        >
                          <Calendar className="w-3.5 h-3.5" /> Download Itinerary
                        </a>
                      )}
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── WELCOME ─────────────────────────────────────── */}
        <FadeIn>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Official Briefing" title={PACKAGE_META.welcomeTitle} />
            <div className="border rounded-2xl p-6 space-y-4" style={card}>
              <div className="flex flex-wrap items-center gap-3 pb-4 border-b" style={{ borderColor }}>
                {[
                  { label: PACKAGE_META.name,       bg: "#f97316", color: "#fff",    bc: "transparent" },
                  { label: PACKAGE_META.duration,    bg: surfaceBg, color: textMuted, bc: borderColor },
                  { label: `Code: ${PACKAGE_META.code}`, bg: surfaceBg, color: textMuted, bc: borderColor },
                ].map(({ label, bg: bgC, color, bc }) => (
                  <span key={label} className="font-bold text-xs px-3 py-1.5 rounded-full border tracking-wider"
                    style={{ backgroundColor: bgC, color, borderColor: bc }}
                  >{label}</span>
                ))}
              </div>
              {PACKAGE_META.welcomeBody.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed" style={{ color: i === 0 ? textPrimary : textMuted }}>{para}</p>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── PRE-DEPARTURE BRIEFING ───────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Pre-Departure" title="Before You Leave Home" />
            <p className="text-sm -mt-2 mb-5 leading-relaxed" style={muted}>{PRE_DEPARTURE.intro}</p>

            {/* Voucher reminder */}
            <div className="border-l-4 rounded-r-2xl px-5 py-4 mb-5"
              style={{ borderLeftColor: "#f97316", backgroundColor: darkMode ? "#1A0E00" : "#FFFAF0", borderTop: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#f97316" }}>📄 Voucher Reminder</p>
              <p className="text-sm leading-relaxed" style={muted}>{PRE_DEPARTURE.voucherReminder}</p>
            </div>

            {/* Package highlights + travel reminders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div className="border rounded-2xl p-5" style={card}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#f97316" }}>Package Highlights</p>
                <ul className="space-y-2">
                  {PRE_DEPARTURE.packageHighlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={muted}>
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" /> {h}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-2xl p-5" style={card}>
                <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#f97316" }}>Travel Reminders</p>
                <ul className="space-y-2">
                  {PRE_DEPARTURE.travelReminders.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={muted}>
                      <span className="shrink-0 mt-0.5 text-[10px]" style={{ color: "#f97316" }}>›</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Assistance reminder */}
            <div className="border rounded-2xl p-4 mb-5 flex items-start gap-3"
              style={{ borderColor, backgroundColor: surfaceBg }}
            >
              <span className="text-xl shrink-0">🤝</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#f97316" }}>Need Assistance?</p>
                <p className="text-sm leading-relaxed" style={muted}>{PRE_DEPARTURE.assistanceReminder}</p>
              </div>
            </div>

            {/* Quick-nav CTA */}
            <div className="flex flex-wrap gap-2">
              {PRE_DEPARTURE.ctaLinks.map(({ label, id }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all hover:border-orange-500/50 hover:text-orange-500"
                  style={{ borderColor, color: textMuted }}
                >
                  {label} <ChevronDown className="w-3 h-3 -rotate-90" />
                </button>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── INCLUSIONS + EXCLUSIONS ──────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SectionHeader eyebrow="What's Covered" title="Package Inclusions" eyebrowColor="#22c55e" />
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: darkMode ? "#14532D" : "#BBF7D0", backgroundColor: darkMode ? "#0D1F10" : "#F0FFF4" }}>
                  <ul className="px-5 py-4 space-y-2.5">
                    {INCLUSIONS.map(({ label }) => (
                      <li key={label} className="flex items-center gap-3">
                        <Check className="w-4 h-4 shrink-0" style={{ color: "#22C55E" }} strokeWidth={2.5} />
                        <span className="text-sm" style={{ color: darkMode ? "#86EFAC" : "#166534" }}>{label}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div>
                <SectionHeader eyebrow="Not Covered" title="Package Exclusions" eyebrowColor="#ef4444" />
                <div className="rounded-2xl border overflow-hidden" style={{ borderColor: darkMode ? "#7F1D1D" : "#FECACA", backgroundColor: darkMode ? "#1C0808" : "#FFF5F5" }}>
                  <ul className="px-5 py-4 space-y-2.5">
                    {EXCLUSIONS.map(({ label }) => (
                      <li key={label} className="flex items-center gap-3">
                        <X className="w-4 h-4 shrink-0" style={{ color: "#EF4444" }} strokeWidth={2.5} />
                        <span className="text-sm" style={{ color: darkMode ? "#FCA5A5" : "#991B1B" }}>{label}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="px-5 pb-4 pt-1 border-t" style={{ borderColor: darkMode ? "#7F1D1D" : "#FECACA" }}>
                    <p className="text-xs leading-relaxed" style={{ color: darkMode ? "#FCA5A5" : "#B91C1C" }}>
                      🛡 Travel insurance not included — enrollment is strongly recommended.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── ITINERARY ─────────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div id="itinerary" className={`${sectionGap} scroll-mt-20`}>
            <SectionHeader eyebrow="Day by Day" title="Your Itinerary" />
            <motion.div
              className="space-y-4"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
            >
              {ITINERARY.map(({ day, title, color, activities }) => (
                <motion.div key={day} variants={cardVariant} transition={{ duration: 0.45 }}
                  className="border rounded-2xl overflow-hidden" style={card}
                >
                  <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}22` }}>
                      <Calendar className="w-4 h-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] mb-0.5" style={{ color }}>{day}</p>
                      <p className="font-bold text-sm sm:text-base">{title}</p>
                    </div>
                  </div>
                  <ul className="px-5 py-4 space-y-2.5">
                    {activities.map((activity, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm" style={muted}>
                        <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: color }} />
                        {activity}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── TRAVEL INFORMATION CENTER ─────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Travel Information" title="Before & After Your Flight" />
            <div className="flex border-b mb-5" style={{ borderColor }}>
              {[{ key: "before", label: "Before Departure" }, { key: "arrival", label: "Upon Arrival" }].map((tab) => (
                <button key={tab.key} onClick={() => setTravelTab(tab.key)}
                  className="px-5 py-3 border-b-2 transition-colors font-semibold text-sm whitespace-nowrap"
                  style={{ borderColor: travelTab === tab.key ? "#f97316" : "transparent", color: travelTab === tab.key ? "#f97316" : textMuted }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.ul key={travelTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                {(travelTab === "before" ? [
                  "Arrive at the airport at least 2–3 hours before your scheduled departure.",
                  "Ensure your GDX Travel Voucher is ready — printed copy or saved on your phone.",
                  "Verify your baggage allowance with your airline (standard: 7kg carry-on, 20kg check-in).",
                  "Charge all devices — phone, power bank, and camera — before leaving home.",
                  "Save your consultant's number and hotel contact in your phone.",
                  "Download offline maps of Boracay Island in case of limited connectivity.",
                  "Confirm your hotel booking reference before heading to the airport.",
                ] : [
                  "Follow airport signage toward the arrivals hall exit.",
                  "Look for Gladex Travel signage or a representative with a name placard.",
                  "Proceed to the designated cashier to pay the terminal fee before boarding.",
                  "Board the bangka boat — a scenic 10–15 minute crossing to the island.",
                  "At the Boracay port, your land transfer to the hotel will be ready.",
                  "Present your valid ID and hotel voucher at the front desk for check-in.",
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                    <span className="font-black text-sm shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#f97316" }}>{i + 1}</span>
                    <span className="text-sm leading-relaxed" style={muted}>{item}</span>
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── ARRIVAL INSTRUCTIONS ──────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Step by Step" title="Arrival Instructions" />
            <div className="inline-flex gap-1 p-1 rounded-2xl border mb-6" style={{ borderColor, backgroundColor: surfaceBg }}>
              {(["caticlan", "kalibo"]).map((tab) => (
                <button key={tab} onClick={() => setArrivalTab(tab)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-wider transition-all duration-200"
                  style={{ backgroundColor: arrivalTab === tab ? "#f97316" : "transparent", color: arrivalTab === tab ? "#fff" : textMuted, boxShadow: arrivalTab === tab ? "0 2px 10px rgba(249,115,22,0.3)" : "none" }}
                >
                  {tab === "caticlan" ? "Caticlan Airport" : "Kalibo Airport"}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={arrivalTab} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }} className="space-y-3">
                {ARRIVAL_STEPS[/** @type {"caticlan"|"kalibo"} */ (arrivalTab)].map(({ step, label, note }) => (
                  <div key={step} className="border rounded-2xl overflow-hidden" style={card}>
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                      <span className="font-black text-sm shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: "#f97316" }}>{step}</span>
                      <p className="font-bold text-sm">{label}</p>
                    </div>
                    <p className="px-5 py-3 text-sm" style={muted}>{note}</p>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── TRANSFER INSTRUCTIONS ─────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Transfer Flow" title="Transfer Instructions" />
            <div className="grid sm:grid-cols-2 gap-6 mb-5">
              {[
                { title: "Arrival Transfer", steps: TRANSFER_FLOW.arrival, color: "#0ea5e9" },
                { title: "Departure Transfer", steps: TRANSFER_FLOW.departure, color: "#8b5cf6" },
              ].map(({ title, steps, color }) => (
                <div key={title} className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="px-5 py-3.5 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <p className="font-bold text-sm" style={{ color }}>{title}</p>
                  </div>
                  <div className="px-5 py-4 space-y-4">
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-black text-xs text-white" style={{ backgroundColor: color }}>
                          {s.step}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-base">{s.icon}</span>
                            <p className="font-bold text-xs">{s.label}</p>
                          </div>
                          <p className="text-xs leading-snug" style={muted}>{s.note}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Transfer Reminders */}
            <div className="border rounded-2xl p-4" style={{ borderColor, backgroundColor: surfaceBg }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "#f97316" }}>Transfer Reminders</p>
              <ul className="space-y-1.5">
                {TRANSFER_FLOW.reminders.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={muted}>
                    <span className="shrink-0" style={{ color: "#f97316" }}>›</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── HOTEL CHECK-IN ─────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Accommodation" title="Hotel Check-In Information" />
            <p className="text-sm -mt-2 mb-5" style={muted}>Henann Lagoon Resort · Station 1, White Beach, Boracay Island, Aklan</p>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border px-5 py-4" style={{ borderColor, backgroundColor: darkMode ? "#0D1A0D" : "#F0FFF4" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#22C55E" }}>Check-In</p>
                  <p className="font-heading font-black text-xl" style={{ color: textPrimary }}>{HOTEL_INFO.checkIn}</p>
                </div>
                <div className="rounded-2xl border px-5 py-4" style={{ borderColor, backgroundColor: darkMode ? "#1C0808" : "#FFF5F5" }}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#EF4444" }}>Check-Out</p>
                  <p className="font-heading font-black text-xl" style={{ color: textPrimary }}>{HOTEL_INFO.checkOut}</p>
                </div>
              </div>
              {HOTEL_INFO.hotels?.length > 0 && (
                <div className="grid sm:grid-cols-2 gap-3">
                  {HOTEL_INFO.hotels.map((h, i) => (
                    <div key={i} className="rounded-xl border px-4 py-3" style={{ borderColor, backgroundColor: cardBg }}>
                      <p className="text-xs font-bold uppercase tracking-wide mb-0.5" style={{ color: "#f97316" }}>{h.category}</p>
                      <p className="text-sm" style={{ color: textPrimary }}>{h.name}</p>
                    </div>
                  ))}
                </div>
              )}
              <div className="border rounded-2xl overflow-hidden" style={card}>
                <div className="px-5 py-3 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                  <p className="font-bold text-sm">Hotel Policies</p>
                </div>
                <ul className="px-5 py-4 space-y-2.5">
                  {HOTEL_INFO.policies.map((p, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-sm shrink-0 mt-0.5" style={{ color: "#f97316" }}>•</span>
                      <span className="text-sm leading-relaxed" style={muted}>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── TOUR REMINDERS ─────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Before Each Tour Day" title="Tour Reminders" />
            <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-3" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {TOUR_REMINDERS.map((item, i) => (
                <motion.div key={i} variants={cardVariant} transition={{ duration: 0.4 }}
                  className="flex items-start gap-3 px-4 py-3.5 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}
                >
                  <span className="text-xl shrink-0">{item.icon}</span>
                  <span className="text-sm leading-relaxed" style={muted}>{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── REMINDERS ─────────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Travel Tips" title="Important Reminders" />
            <div className="space-y-5">
              {[
                { label: "Before Your Trip",    items: REMINDERS.beforeTrip,    color: "#0ea5e9" },
                { label: "During Your Stay",    items: REMINDERS.duringStay,    color: "#22c55e" },
                { label: "Before Departure",    items: REMINDERS.beforeDeparture, color: "#8b5cf6" },
              ].map(({ label, items, color }) => (
                <div key={label} className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="px-5 py-3.5 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <p className="font-bold text-sm" style={{ color }}>{label}</p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-0.5 px-4 py-4">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: surfaceBg }}>
                        <span className="text-lg shrink-0">{item.icon}</span>
                        <div>
                          <p className="font-bold text-xs mb-0.5" style={{ color }}>{item.title}</p>
                          <p className="text-xs leading-snug" style={muted}>{item.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── NOTES ──────────────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Please Read" title="Notes & Advisories" />
            <motion.div className="grid sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {NOTES.map((note, i) => (
                <motion.div key={i} variants={cardVariant} transition={{ duration: 0.4 }}
                  className="border rounded-2xl p-4 flex items-start gap-3" style={card}
                >
                  <span className="text-2xl shrink-0">{note.icon}</span>
                  <div>
                    <p className="font-bold text-sm mb-1">{note.title}</p>
                    <p className="text-xs leading-relaxed" style={muted}>{note.text}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── SHOPPING ADVISORY ──────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Please Read Carefully" title={SHOPPING_ADVISORY.title} eyebrowColor="#ef4444" />
            <div className="rounded-2xl border-2 overflow-hidden" style={{ borderColor: "#EF4444", backgroundColor: darkMode ? "#1C0808" : "#FFF5F5" }}>
              <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: darkMode ? "#7F1D1D" : "#FECACA", backgroundColor: darkMode ? "#2D0A0A" : "#FEE2E2" }}>
                <AlertTriangle className="w-5 h-5 shrink-0" style={{ color: "#EF4444" }} />
                <p className="font-black text-base uppercase tracking-widest" style={{ color: "#EF4444" }}>{SHOPPING_ADVISORY.warningLabel}</p>
              </div>
              <div className="px-5 py-5 space-y-4">
                <p className="text-sm leading-relaxed" style={{ color: darkMode ? "#FCA5A5" : "#991B1B" }}>{SHOPPING_ADVISORY.body}</p>
                <ul className="space-y-2.5">
                  {SHOPPING_ADVISORY.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="text-sm shrink-0 mt-0.5" style={{ color: "#EF4444" }}>•</span>
                      <span className="text-sm leading-relaxed" style={{ color: darkMode ? "#FCA5A5" : "#991B1B" }}>{rule}</span>
                    </li>
                  ))}
                </ul>
                {SHOPPING_ADVISORY.penaltyNote && (
                  <div className="px-4 py-3 rounded-xl border-l-4 text-xs leading-relaxed"
                    style={{ borderLeftColor: "#EF4444", backgroundColor: darkMode ? "#2D0A0A" : "#FEE2E2", color: darkMode ? "#FCA5A5" : "#B91C1C" }}
                  >{SHOPPING_ADVISORY.penaltyNote}</div>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── REQUIREMENTS ──────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div id="requirements" className={`${sectionGap} scroll-mt-20`}>
            <SectionHeader eyebrow="Documents Needed" title="Travel Requirements" />
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {[
                { icon: User,  label: "Filipino Guests", items: REQUIREMENTS.filipino, iconColor: "text-sky-500" },
                { icon: Globe, label: "Foreign Guests",  items: REQUIREMENTS.foreign,  iconColor: "text-orange-500" },
              ].map(({ icon: Icon, label, items, iconColor }) => (
                <div key={label} className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                    <p className="font-bold text-sm">{label}</p>
                  </div>
                  <ul className="px-5 py-4 space-y-3">
                    {items.map((req, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-black text-xs text-white mt-0.5" style={{ backgroundColor: "#f97316" }}>{i + 1}</div>
                        <span className="text-sm leading-relaxed">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {REQUIREMENTS.visaInfo && (
              <div className="px-5 py-4 rounded-2xl border" style={{ borderColor, backgroundColor: darkMode ? "#111" : "#fafafa" }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>Visa Information</p>
                <p className="text-sm leading-relaxed" style={muted}>{REQUIREMENTS.visaInfo}</p>
              </div>
            )}
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── IMPORTANT NOTICES ──────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Read Before Travel" title="Important Notices" />
            <div className="rounded-2xl border-l-4 px-5 py-4 space-y-2.5"
              style={{ borderLeftColor: "#f97316", borderTop: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, backgroundColor: darkMode ? "#1A0E00" : "#FFFAF0" }}
            >
              {IMPORTANT_NOTICES.map((notice, i) => (
                <p key={i} className="text-sm leading-relaxed flex items-start gap-2" style={muted}>
                  <span style={{ color: "#f97316" }}>›</span> {notice}
                </p>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── DO'S AND DON'TS ─────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Responsible Tourism" title="Important Do's & Don'ts" />
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="border rounded-2xl overflow-hidden" style={{ borderColor: darkMode ? "#14532D" : "#BBF7D0", backgroundColor: darkMode ? "#0D1F10" : "#F0FFF4" }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: darkMode ? "#14532D" : "#BBF7D0" }}>
                  <p className="font-black text-sm" style={{ color: "#22C55E" }}>✓ Do's</p>
                </div>
                <ul className="px-5 py-4 space-y-2.5">
                  {DOS.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#22C55E" }} strokeWidth={2.5} />
                      <span className="text-sm leading-relaxed" style={{ color: darkMode ? "#86EFAC" : "#166534" }}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border rounded-2xl overflow-hidden" style={{ borderColor: darkMode ? "#7F1D1D" : "#FECACA", backgroundColor: darkMode ? "#1C0808" : "#FFF5F5" }}>
                <div className="px-5 py-3 border-b" style={{ borderColor: darkMode ? "#7F1D1D" : "#FECACA" }}>
                  <p className="font-black text-sm" style={{ color: "#EF4444" }}>✗ Don'ts</p>
                </div>
                <ul className="px-5 py-4 space-y-2.5">
                  {DONTS.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#EF4444" }} strokeWidth={2.5} />
                      <span className="text-sm leading-relaxed" style={{ color: darkMode ? "#FCA5A5" : "#991B1B" }}>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── TRAVEL READINESS CHECKLIST ─────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Pre-Departure Check" title="Travel Readiness Checklist" />
            <div className="mb-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider" style={muted}>{checkedCount} of {CHECKLIST_ITEMS.length} items ready</span>
                <span className="text-xs font-black tabular-nums" style={{ color: readinessPct === 100 ? "#22c55e" : "#f97316" }}>{readinessPct}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: surfaceBg, border: `1px solid ${borderColor}` }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: readinessPct === 100 ? "#22c55e" : "linear-gradient(90deg, #f97316, #f59e0b)" }}
                  animate={{ width: `${readinessPct}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {CHECKLIST_ITEMS.map(({ id, label, icon: Icon }) => (
                <label
                  key={id}
                  className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all duration-200"
                  style={{
                    borderColor:     checklist[id] ? "rgba(249,115,22,0.35)" : borderColor,
                    backgroundColor: checklist[id] ? (darkMode ? "rgba(249,115,22,0.07)" : "rgba(249,115,22,0.04)") : surfaceBg,
                  }}
                >
                  <div className="w-5 h-5 rounded-md flex items-center justify-center border-2 shrink-0 transition-all"
                    style={{ backgroundColor: checklist[id] ? "#f97316" : "transparent", borderColor: checklist[id] ? "#f97316" : borderColor }}
                  >
                    {checklist[id] && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </div>
                  <input type="checkbox" checked={!!checklist[id]} onChange={() => setChecklist(p => ({ ...p, [id]: !p[id] }))} className="sr-only" />
                  <Icon className="w-3.5 h-3.5 shrink-0 transition-colors" style={{ color: checklist[id] ? "#f97316" : textMuted }} />
                  <span className="text-xs sm:text-sm font-medium select-none transition-all"
                    style={{ color: checklist[id] ? textMuted : textPrimary, textDecoration: checklist[id] ? "line-through" : "none", opacity: checklist[id] ? 0.5 : 1 }}
                  >{label}</span>
                </label>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── OUTFIT GUIDE ────────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="What to Wear" title="Outfit Guide" />
            <motion.div className="grid sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {OUTFIT_GUIDE.map((guide, i) => (
                <motion.div key={i} variants={cardVariant} transition={{ duration: 0.4 }}
                  className="border rounded-2xl p-5" style={card}
                >
                  <div className="flex items-center gap-2.5 mb-3">
                    <span className="text-2xl">{guide.icon}</span>
                    <p className="font-bold text-sm">{guide.occasion}</p>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {guide.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs" style={muted}>
                        <span className="mt-0.5 w-1 h-1 rounded-full shrink-0 opacity-50" style={{ backgroundColor: "#f97316", marginTop: 6 }} /> {item}
                      </li>
                    ))}
                  </ul>
                  <div className="border-l-2 pl-3 text-xs italic" style={{ borderLeftColor: "#f97316", color: textMuted }}>
                    💡 {guide.tip}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── WHAT TO BRING ───────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Packing Guide" title="What To Bring" />
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Documents",           items: WHAT_TO_BRING.documents,           accent: "text-sky-500"    },
                { title: "Essentials",           items: WHAT_TO_BRING.essentials,          accent: "text-orange-500" },
                { title: "Destination Specific",items: WHAT_TO_BRING.destinationSpecific, accent: "text-teal-500"   },
              ].map(({ title, items, accent }) => (
                <div key={title} className="border rounded-2xl p-4" style={{ borderColor, backgroundColor: surfaceBg }}>
                  <p className={`text-[10px] font-black uppercase tracking-wider mb-3 ${accent}`}>{title}</p>
                  <ul className="space-y-2">
                    {items.map(item => (
                      <li key={item} className="flex items-start gap-2 text-[11px] sm:text-xs leading-snug" style={muted}>
                        <span className="mt-1 w-1 h-1 rounded-full bg-current shrink-0 opacity-40" />{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── TRAVEL INSURANCE ───────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Protect Your Trip" title="Travel Insurance" />
            <p className="text-sm -mt-2 mb-5 leading-relaxed" style={muted}>
              Travel insurance is not included in this package but is strongly recommended. Coverage protects you from unexpected events before and during your Boracay trip.
            </p>
            <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              {INSURANCE_BENEFITS.map(({ icon: Icon, title, text }, i) => (
                <motion.div key={i} variants={cardVariant} transition={{ duration: 0.4 }}
                  className="border rounded-2xl p-5 flex flex-col gap-3" style={card}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(249,115,22,0.1)" }}>
                    <Icon className="w-5 h-5" style={{ color: "#f97316" }} />
                  </div>
                  <p className="font-bold text-sm">{title}</p>
                  <p className="text-xs leading-relaxed" style={muted}>{text}</p>
                </motion.div>
              ))}
            </motion.div>
            <div className="mt-4 border rounded-2xl px-5 py-4" style={{ borderColor, backgroundColor: surfaceBg }}>
              <p className="text-xs" style={muted}>
                To enroll in travel insurance, contact your Gladex consultant at least <strong style={{ color: textPrimary }}>3 days before departure</strong>. Ask about available plans that cover your travel dates.
              </p>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── CHECKOUT ADD-ONS (Phase 1 Display) ─────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Book Add-Ons" title="Optional Add-Ons & Checkout" />
            <div className="border-l-4 rounded-r-2xl px-5 py-3 mb-6 flex items-start gap-3"
              style={{ borderLeftColor: "#f97316", backgroundColor: darkMode ? "#1A0E00" : "#FFFAF0", borderTop: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}` }}
            >
              <span className="text-xl shrink-0">🛒</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "#f97316" }}>Full checkout coming soon</p>
                <p className="text-sm leading-relaxed" style={muted}>
                  Online booking for optional add-ons will be available in a future update. For now, contact your Gladex consultant directly to reserve any of the items below.
                </p>
              </div>
            </div>

            {/* Add-on categories */}
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {CHECKOUT_ADDONS.map(({ category, icon, items }) => (
                <div key={category} className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="flex items-center gap-2.5 px-5 py-3.5 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <span className="text-xl">{icon}</span>
                    <p className="font-bold text-sm">{category}</p>
                  </div>
                  <ul className="px-5 py-4 space-y-2">
                    {items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs" style={muted}>
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: "#f97316" }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Payment methods */}
            <div className="border rounded-2xl p-5" style={{ borderColor, backgroundColor: surfaceBg }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "#f97316" }}>Accepted Payment Methods</p>
              <div className="flex flex-wrap gap-3 mb-4">
                {PAYMENT_METHODS.map(({ emoji, label }) => (
                  <div key={label} className="flex items-center gap-2 px-3 py-2 border rounded-xl text-xs font-semibold" style={{ borderColor, color: textMuted }}>
                    <span>{emoji}</span> {label}
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t" style={{ borderColor }}>
                <p className="text-sm font-bold mb-1">To reserve your add-ons:</p>
                <p className="text-sm" style={muted}>
                  Contact your Gladex consultant at <span className="font-semibold" style={{ color: "#f97316" }}>+63 917 875 2200</span> or message us on Viber / WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── CONNECTIVITY ───────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Stay Connected" title="Connectivity Guide" />
            {CONNECTIVITY.intro && <p className="text-sm -mt-2 mb-5 leading-relaxed" style={muted}>{CONNECTIVITY.intro}</p>}
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              {CONNECTIVITY.options.map((opt, i) => (
                <div key={i} className="border rounded-2xl overflow-hidden" style={{ borderColor: opt.recommended ? "#f97316" : borderColor, backgroundColor: cardBg, boxShadow: cardShadow }}>
                  {opt.recommended && (
                    <div className="px-4 py-1.5 text-center font-bold text-xs tracking-widest uppercase text-white" style={{ backgroundColor: "#f97316" }}>Recommended</div>
                  )}
                  <div className="px-4 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{opt.icon}</span>
                      <h4 className="font-bold text-sm">{opt.title}</h4>
                    </div>
                    <p className="text-xs leading-relaxed mb-3" style={muted}>{opt.description}</p>
                    {opt.providers && (
                      <ul className="space-y-1.5 mb-2">
                        {opt.providers.map((p, j) => (
                          <li key={j} className="text-xs flex items-start gap-1.5" style={muted}>
                            <span style={{ color: "#f97316" }}>›</span>
                            <span><strong style={{ color: textPrimary }}>{p.name}</strong> — {p.note}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {opt.steps && (
                      <ul className="space-y-1">
                        {opt.steps.map((s, j) => (
                          <li key={j} className="text-xs" style={muted}>{j + 1}. {s}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {CONNECTIVITY.tips?.length > 0 && (
              <div className="rounded-xl px-4 py-3 border space-y-1" style={{ borderColor, backgroundColor: surfaceBg }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#f97316" }}>Quick Tips</p>
                {CONNECTIVITY.tips.map((tip, i) => (
                  <p key={i} className="text-xs leading-relaxed flex items-start gap-1.5" style={muted}>
                    <span style={{ color: "#f97316" }}>›</span> {tip}
                  </p>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── CURRENCY ───────────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Money Matters" title="Currency Guide" />
            <div className="space-y-4">
              <div className="rounded-2xl border px-5 py-4 space-y-2" style={{ borderColor: "#f97316", backgroundColor: darkMode ? "#1A0A00" : "#FFF8F0" }}>
                <span className="font-heading font-black text-2xl" style={{ color: "#f97316" }}>{CURRENCY.symbol} {CURRENCY.currency}</span>
                <p className="text-sm" style={muted}>{CURRENCY.exchangeRate}</p>
                {CURRENCY.usdNote && <p className="text-xs leading-relaxed" style={muted}>{CURRENCY.usdNote}</p>}
                {CURRENCY.recommendedCash && <p className="text-xs font-semibold" style={{ color: "#f97316" }}>💡 {CURRENCY.recommendedCash}</p>}
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="px-5 py-3 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <p className="font-bold text-sm">Where to Exchange</p>
                  </div>
                  <ul className="px-5 py-4 space-y-3">
                    {CURRENCY.whereToExchange.map((place, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CreditCard className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f97316" }} />
                        <div>
                          <span className="text-sm font-semibold block">{place.place}</span>
                          <span className="text-xs" style={muted}>{place.note}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="px-5 py-3 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <p className="font-bold text-sm">Rough Price Guide</p>
                  </div>
                  <div className="px-5 py-4 space-y-2">
                    {CURRENCY.roughPrices.map((price, i) => (
                      <div key={i} className="flex items-center justify-between gap-4">
                        <span className="text-sm" style={muted}>{price.item}</span>
                        <span className="text-xs font-semibold shrink-0" style={{ color: "#f97316" }}>{price.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl px-4 py-3 border space-y-1" style={{ borderColor, backgroundColor: surfaceBg }}>
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "#f97316" }}>Money Tips</p>
                {CURRENCY.tips.map((tip, i) => (
                  <p key={i} className="text-xs leading-relaxed flex items-start gap-1.5" style={muted}>
                    <span style={{ color: "#f97316" }}>›</span> {tip}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── DESTINATION HIGHLIGHTS ─────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Know Your Destination" title="Destination Highlights" />
            <div
              className="-mx-4 px-4 pb-2 overflow-x-auto"
              style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              <motion.div
                className="flex gap-4"
                style={{ width: "max-content" }}
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {HIGHLIGHTS.map(({ name, desc, image }) => (
                  <motion.div
                    key={name}
                    variants={cardVariant}
                    transition={{ duration: 0.4 }}
                    className="border rounded-2xl overflow-hidden shrink-0"
                    style={{
                      width: "clamp(180px, 44vw, 230px)",
                      scrollSnapAlign: "start",
                      borderColor,
                      boxShadow: cardShadow,
                    }}
                  >
                    <div style={{ aspectRatio: "3/4", overflow: "hidden" }}>
                      <img
                        src={image}
                        alt={name}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                        loading="lazy"
                      />
                    </div>
                    <div className="p-3" style={{ backgroundColor: cardBg }}>
                      <p className="font-bold text-xs sm:text-sm mb-1">{name}</p>
                      <p className="text-[10px] leading-snug" style={muted}>{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-widest mt-2 opacity-40 sm:hidden" style={{ color: textMuted }}>
              ← swipe to explore →
            </p>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── DESTINATION GUIDE: FOOD / SPOTS / TIPS ──────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Travel Guide" title="Boracay Destination Guide" />

            {/* Best Food */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Utensils className="w-4 h-4" style={{ color: "#f97316" }} />
                <p className="font-bold text-sm uppercase tracking-wider">Best Food To Try</p>
              </div>
              <div
                className="-mx-4 px-4 pb-2 overflow-x-auto sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0"
                style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex gap-3 sm:grid sm:grid-cols-3 w-max sm:w-auto">
                  {DESTINATION_EXTRAS.food.map(({ emoji, name, note }) => (
                    <div
                      key={name}
                      className="border rounded-2xl p-4 flex items-start gap-3 shrink-0 sm:shrink"
                      style={{ width: "clamp(200px, 55vw, 260px)", scrollSnapAlign: "start", borderColor, backgroundColor: surfaceBg }}
                    >
                      <span className="text-2xl shrink-0">{emoji}</span>
                      <div>
                        <p className="font-bold text-xs mb-0.5">{name}</p>
                        <p className="text-xs leading-snug" style={muted}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Best Photo Spots */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Camera className="w-4 h-4" style={{ color: "#f97316" }} />
                <p className="font-bold text-sm uppercase tracking-wider">Best Photo Spots</p>
              </div>
              <div
                className="-mx-4 px-4 pb-2 overflow-x-auto sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0"
                style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                <div className="flex gap-3 sm:grid sm:grid-cols-3 w-max sm:w-auto">
                  {DESTINATION_EXTRAS.photoSpots.map(({ emoji, name, note }) => (
                    <div
                      key={name}
                      className="border rounded-2xl p-4 flex items-start gap-3 shrink-0 sm:shrink"
                      style={{ width: "clamp(200px, 55vw, 260px)", scrollSnapAlign: "start", borderColor, backgroundColor: surfaceBg }}
                    >
                      <span className="text-2xl shrink-0">{emoji}</span>
                      <div>
                        <p className="font-bold text-xs mb-0.5">{name}</p>
                        <p className="text-xs leading-snug" style={muted}>{note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Local Tips */}
            <div className="mb-6">
              <p className="font-bold text-sm uppercase tracking-wider mb-3">💡 Local Tips</p>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {DESTINATION_EXTRAS.localTips.map(({ emoji, text }) => (
                  <div key={text} className="flex items-start gap-3 px-4 py-3 rounded-xl border" style={{ backgroundColor: cardBg, borderColor }}>
                    <span className="text-lg shrink-0">{emoji}</span>
                    <span className="text-sm leading-relaxed" style={muted}>{text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Info Grid */}
            <div>
              <p className="font-bold text-sm uppercase tracking-wider mb-3">📋 Quick Info</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DESTINATION_EXTRAS.quickInfo.map(({ emoji, label, value }) => (
                  <div key={label} className="border rounded-2xl p-4" style={{ borderColor, backgroundColor: surfaceBg }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-lg">{emoji}</span>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#f97316" }}>{label}</p>
                    </div>
                    <p className="text-xs leading-snug" style={muted}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── EMERGENCY CONTACTS ─────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Save These Now" title="Emergency Contacts" />
            <p className="text-sm -mt-2 mb-5" style={muted}>Our team is available 24/7 throughout your trip. Save these before you depart.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {EMERGENCY_CONTACTS.map((group, i) => (
                <div key={i} className="border rounded-2xl overflow-hidden" style={card}>
                  <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor, backgroundColor: darkMode ? "#1a1a1a" : "#fafafa" }}>
                    <span className="text-lg">{group.icon}</span>
                    <p className="font-bold text-sm">{group.category}</p>
                  </div>
                  <ul className="px-4 py-3 space-y-2.5">
                    {group.contacts.map((c, j) => (
                      <li key={j} className="flex items-center justify-between gap-2">
                        <span className="text-xs" style={muted}>{c.label}</span>
                        <a href={`tel:${c.value.replace(/\D/g, "")}`}
                          className="text-xs font-semibold hover:opacity-80 transition-opacity shrink-0"
                          style={{ color: "#f97316" }}
                        >{c.value}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Common Questions" title="Frequently Asked Questions" />
            <div className="space-y-2.5">
              {FAQS.map(({ q, a }) => (
                <FAQItem key={q} q={q} a={a} card={card} borderColor={borderColor} textPrimary={textPrimary} textMuted={textMuted} />
              ))}
            </div>
          </div>
        </FadeIn>
        <SectionDivider borderColor={borderColor} />

        {/* ── NEED ASSISTANCE ─────────────────────────────────── */}
        <FadeIn delay={0.04}>
          <div className={sectionGap}>
            <SectionHeader eyebrow="Contact Us" title="Need Assistance?" />
            <div className="rounded-2xl border-l-4 px-5 py-4 space-y-2.5"
              style={{ borderLeftColor: "#f97316", borderTop: `1px solid ${borderColor}`, borderRight: `1px solid ${borderColor}`, borderBottom: `1px solid ${borderColor}`, backgroundColor: darkMode ? "#1A0E00" : "#FFFAF0" }}
            >
              {ASSISTANCE_CONTACTS.map(({ label, value }, i) => (
                <p key={i} className="text-sm leading-relaxed flex items-start gap-2" style={muted}>
                  <span style={{ color: "#f97316" }}>›</span>
                  <span><strong style={{ color: textPrimary }}>{label}:</strong> {value}</span>
                </p>
              ))}
            </div>
          </div>
        </FadeIn>

      </main>

      {/* ═══════════════════════════════════════════════════════
          OPTIONAL ACTIVITIES
      ═══════════════════════════════════════════════════════ */}
      <div id="activities" className="border-t py-12 px-4 lg:px-10 scroll-mt-20 transition-colors duration-300"
        style={{ backgroundColor: darkMode ? "#111111" : "#ffffff", borderColor }}
      >
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeader eyebrow="Add-On Experiences" title="Optional Activities" />
            <p className="text-sm -mt-2 mb-8" style={{ color: textMuted }}>
              Available during your Boracay stay. Click "View Details" for more information. Contact your consultant to reserve a slot.
            </p>
          </FadeIn>
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
          >
            {ACTIVITIES.map((activity) => (
              <motion.div key={activity.id} variants={cardVariant} transition={{ duration: 0.45 }}>
                <ActivityCard
                  activity={activity}
                  card={card}
                  borderColor={borderColor}
                  textPrimary={textPrimary}
                  textMuted={textMuted}
                  surfaceBg={surfaceBg}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Back to top */}
      <BackToTopButton visible={showBackToTop} />

      {/* Navigation footer */}
      <div className="py-10 px-4 border-t transition-colors duration-300" style={{ backgroundColor: darkMode ? "#0c0c0c" : "#f4f3f1", borderColor }}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full border transition-all"
            style={{ borderColor, color: textPrimary, backgroundColor: cardBg }}
          >
            ← Back
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 font-bold text-sm px-8 py-3.5 rounded-full text-white transition-all"
            style={{ backgroundColor: "#f97316" }}
          >
            All Destinations
          </motion.button>
        </div>
        <p className="text-center text-[10px] uppercase tracking-[0.2em] font-semibold mt-6" style={{ color: textMuted }}>
          Gladex Travel and Tours Corp. · Boracay 3D2N Package · Phase 1
        </p>
      </div>
    </div>
  );
}

// ── The booking_details query and console output are handled
//    inside the Phase 2 audit useEffect above (inside the component).
//    No duplicate imports or module-level hooks are needed here.