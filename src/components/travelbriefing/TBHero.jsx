// @ts-nocheck
import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";

// Gradient fallback per destination slug (in case image fails to load)
const DEST_GRADIENTS = {
  boracay: "linear-gradient(135deg, #0c4a6e 0%, #075985 40%, #0369a1 100%)",
  cebu:    "linear-gradient(135deg, #164e63 0%, #065f46 50%, #047857 100%)",
  elnido:  "linear-gradient(135deg, #134e4a 0%, #0f766e 50%, #14b8a6 100%)",
  bohol:   "linear-gradient(135deg, #78350f 0%, #92400e 40%, #d97706 100%)",
  default: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)",
};

export default function TBHero({ dest, darkMode }) {
  const [imgFailed, setImgFailed] = useState(false);

  const overlayStart = "rgba(0,0,0,0.45)";
  const overlayEnd   = "rgba(0,0,0,0.70)";
  const fallbackBg   = DEST_GRADIENTS[dest?.slug] || DEST_GRADIENTS.default;

  return (
    <div className="relative w-full overflow-hidden" style={{ minHeight: "36vh", maxHeight: "40vh" }}>

      {/* Background — image with gradient fallback */}
      {dest?.heroImage && !imgFailed ? (
        <img
          src={dest.heroImage}
          alt={dest.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "saturate(1.1) brightness(0.85)" }}
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
        className="relative z-10 flex flex-col items-center justify-center h-full text-white text-center px-4 pt-16 pb-6"
        style={{ minHeight: "36vh" }}
      >
        {/* Location badge */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
          className="flex items-center gap-1.5 mb-2 px-3 py-1 rounded-full border border-white/25 backdrop-blur-sm"
          style={{ backgroundColor: "rgba(255,255,255,0.1)", fontSize: "12px" }}
        >
          <MapPin className="w-3 h-3 opacity-75" />
          <span className="uppercase tracking-widest font-semibold opacity-85">Philippines · Gladex Travel</span>
        </motion.div>

        {/* Destination name */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
          className="font-black leading-none mb-1.5"
          style={{ fontSize: "clamp(2rem, 8vw, 4rem)", letterSpacing: "-0.02em" }}
        >
          {dest?.name || ""}
        </motion.h1>

        {/* Tagline / package name */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.3 }}
          className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-70"
        >
          {dest?.tagline || ""}
        </motion.p>

        {/* Airport badge */}
        {dest?.airport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.3 }}
            className="flex items-center gap-1.5 text-xs opacity-55"
          >
            <span>✈️</span>
            <span>{dest.airport}</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
