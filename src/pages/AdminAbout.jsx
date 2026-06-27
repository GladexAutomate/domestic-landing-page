// @ts-nocheck
import React from "react";
import { Database, Star, Zap, Lock, RefreshCw, Globe, BookOpen, Info } from "lucide-react";

const ORANGE = "#FF9913";

function Section({ icon: Icon, color, title, children }) {
  return (
    <div style={{ background: "#fff", borderRadius: "14px", border: "1px solid rgba(0,0,0,0.07)", padding: "22px 24px", borderLeft: `4px solid ${color}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={15} color={color} />
        </div>
        <h2 style={{ fontSize: "0.95rem", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      <div style={{ fontSize: "0.82rem", color: "#555", lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

function Step({ num, text }) {
  return (
    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
      <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: `${ORANGE}18`, color: ORANGE, fontSize: "10px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>{num}</div>
      <p style={{ margin: 0 }}>{text}</p>
    </div>
  );
}

export default function AdminAbout() {
  return (
    <div style={{ padding: "32px", maxWidth: "780px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111", margin: 0, letterSpacing: "-0.02em" }}>About this Panel</h1>
        <p style={{ fontSize: "13px", color: "#999", margin: "4px 0 0" }}>What everything here is for and how to use it</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

        <Section icon={Globe} color="#3B82F6" title="What is the Travel Briefing System?">
          <p style={{ margin: "0 0 8px" }}>
            When a client books a Gladex tour, they receive a link to their personal travel briefing page — e.g. <code style={{ background: "#f5f5f5", padding: "1px 6px", borderRadius: "5px" }}>gladextours.com/destination/boracay?gdx=12345</code>. That page shows their itinerary, packing guide, hotel info, transfers, and optional tours — all personalized to their booking.
          </p>
          <p style={{ margin: 0 }}>
            This admin panel manages the backend data that makes those pages work correctly.
          </p>
        </Section>

        <Section icon={Database} color={ORANGE} title="GDX Cache — What it does">
          <p style={{ margin: "0 0 10px" }}>
            The GDX Cache is a lookup table that maps each booking's GDX number to a destination slug (e.g. GDX 12345 → <code style={{ background: "#f5f5f5", padding: "1px 6px", borderRadius: "5px" }}>boracay</code>). When a client visits their briefing link, the system checks this cache to instantly know which destination page to load — without re-scanning the entire bookings database.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <Step num="1" text="Client books a Boracay tour → GDX number is created in Fusioo/Supabase." />
            <Step num="2" text="Admin runs Bulk Cache All → system reads all bookings and stamps each GDX with the correct destination slug." />
            <Step num="3" text="Client opens their briefing link → GDX is resolved in milliseconds using the cache → correct page loads." />
          </div>
          <div style={{ marginTop: "12px", padding: "10px 14px", background: "rgba(255,153,19,0.07)", borderRadius: "10px", border: "1px solid rgba(255,153,19,0.18)", fontSize: "11.5px", fontWeight: 600, color: "#92400e" }}>
            💡 Run <strong>Bulk Cache All</strong> regularly — especially after new bookings come in — to keep the cache up to date.
          </div>
        </Section>

        <Section icon={Zap} color="#16a34a" title="Bulk Cache All — How it works">
          <p style={{ margin: "0 0 8px" }}>
            Clicking <strong>Bulk Cache All</strong> fetches all bookings from the database, resolves each one's destination text to a slug (e.g. "Boracay, Aklan" → <code style={{ background: "#f5f5f5", padding: "1px 6px", borderRadius: "5px" }}>boracay</code>), then updates the existing cache entries. It only updates — it never inserts new rows — so it's safe to run at any time.
          </p>
          <p style={{ margin: 0 }}>
            <strong>Unresolved</strong> entries are bookings where the destination text didn't match any known Philippine destination. These could be international bookings or destinations with unusual text in Fusioo.
          </p>
        </Section>

        <Section icon={Star} color="#8B5CF6" title="Client Reviews — What it does">
          <p style={{ margin: "0 0 8px" }}>
            Client reviews are submitted directly from the travel briefing page after their trip. Reviews rated 4–5 stars display publicly on the booking page. Reviews rated 1–3 stars are admin-only and never shown to clients.
          </p>
          <p style={{ margin: 0 }}>
            The <strong>By Destination</strong> tab shows reviews grouped by destination. The <strong>By Agent</strong> tab groups reviews by the booking agent, useful for performance tracking.
          </p>
        </Section>

        <Section icon={Lock} color="#6B7280" title="Access & Security">
          <p style={{ margin: "0 0 8px" }}>
            Admin access is controlled via the <code style={{ background: "#f5f5f5", padding: "1px 6px", borderRadius: "5px" }}>VITE_ADMIN_USERS</code> environment variable. Format: <code style={{ background: "#f5f5f5", padding: "1px 6px", borderRadius: "5px" }}>Username:password,Username2:password2</code>. Sessions are stored in <code style={{ background: "#f5f5f5", padding: "1px 6px", borderRadius: "5px" }}>sessionStorage</code> and expire when the browser tab is closed.
          </p>
          <p style={{ margin: 0, color: "#dc2626", fontWeight: 600, fontSize: "11.5px" }}>
            Never share admin credentials. The panel has full read/write access to the reviews database and cache.
          </p>
        </Section>

      </div>
    </div>
  );
}
