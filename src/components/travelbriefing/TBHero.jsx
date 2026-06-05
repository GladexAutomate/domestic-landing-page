// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronDown } from "lucide-react";

// Gradient fallback per destination slug (in case image fails to load)
const DEST_GRADIENTS = {
  boracay: "linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0369a1 100%)",
  cebu:    "linear-gradient(135deg, #164e63 0%, #065f46 50%, #047857 100%)",
  elnido:  "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)",
  default: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
};

export default function TBHero({ dest, darkMode }) {
  const [imgFailed, setImgFailed] = useState(false);

  const overlayStart = "rgba(0,0,0,0.5)";
  const overlayEnd   = "rgba(0,0,0,0.75)";
  const fallbackBg   = DEST_GRADIENTS[dest?.slug] || DEST_GRADIENTS.default;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "92vh" }}>

      {/* Background — image with gradient fallback */}
      {dest?.heroImage && !imgFailed ? (
        <img
          src={dest.heroImage}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(1.15) brightness(0.9)" }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={{ background: fallbackBg }}
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: `linear-gradient(to bottom, ${overlayStart} 0%, ${overlayEnd} 100%)` }}
      />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 pt-24 pb-20"
        style={{ minHeight: "92vh" }}
      >
        {/* Location badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-center gap-1.5 mb-5 px-3 py-1 rounded-full border border-white/25 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", fontSize: "11px" }}
        >
          <MapPin className="w-3 h-3 opacity-75" />
          <span className="uppercase tracking-widest font-semibold opacity-85">Philippines</span>
        </motion.div>

        {/* Destination name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="font-black leading-none mb-3"
          style={{ fontSize: "clamp(3rem, 12vw, 7rem)", letterSpacing: "-0.02em" }}
        >
          {dest?.name || ""}
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-sm sm:text-base font-semibold uppercase tracking-widest mb-4 opacity-75"
        >
          {dest?.tagline || ""}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="max-w-xl text-sm sm:text-base leading-relaxed opacity-80 mb-10"
        >
          {dest?.description || ""}
        </motion.p>

        {/* Airport badge */}
        {dest?.airport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="flex items-center gap-2 text-xs opacity-60"
          >
            <span>✈️</span>
            <span>{dest.airport}</span>
          </motion.div>
        )}

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40"
        >
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.4 }}>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
