// @ts-nocheck
import React from "react";

const GLADEX_LOGO = "https://media.base44.com/images/public/6a0d6ad01d34ead888ecdd6f/5ecc9b2cd_Untitled-design-75.png";

export default function SiteLock() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F2F2F2",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "24px",
        padding: "48px 40px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: "#FFF4E5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <img src={GLADEX_LOGO} alt="Gladex Tours" style={{ height: "40px", objectFit: "contain" }} />
        </div>

        <h1 style={{
          fontSize: "1.25rem",
          fontWeight: 900,
          color: "#111",
          margin: "0 0 8px",
          letterSpacing: "-0.02em",
        }}>
          Site Unavailable
        </h1>

        <p style={{
          fontSize: "13.5px",
          color: "#999",
          margin: "0 0 28px",
          lineHeight: 1.6,
          fontWeight: 500,
        }}>
          This page is currently under maintenance.<br />
          Please check back later.
        </p>

        <div style={{
          padding: "12px 16px",
          background: "#FFF4E5",
          borderRadius: "12px",
          border: "1px solid rgba(255,153,19,0.2)",
        }}>
          <p style={{
            fontSize: "12px",
            color: "#92400e",
            margin: 0,
            fontWeight: 600,
          }}>
            For inquiries, contact us at{" "}
            <a href="mailto:info@gladextours.com" style={{ color: "#FF9913", textDecoration: "none", fontWeight: 700 }}>
              info@gladextours.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
