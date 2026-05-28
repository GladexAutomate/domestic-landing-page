export default function DarkModeToggle({ darkMode, setDarkMode }) {
  return (
    <div className="fixed top-5 right-5 z-[999] flex items-center gap-2.5">
      <span
        className="text-[11px] font-bold tracking-[0.2em] uppercase select-none transition-colors duration-300"
        style={{ color: darkMode ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.4)" }}
      >
        {darkMode ? "DARK" : "LIGHT"}
      </span>
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="relative flex-shrink-0 transition-all duration-300 hover:scale-105 focus:outline-none"
        style={{
          width: "42px",
          height: "24px",
          borderRadius: "12px",
          background: darkMode ? "#FF8C00" : "rgba(0,0,0,0.2)",
          boxShadow: darkMode
            ? "0 0 12px rgba(255,140,0,0.5), inset 0 1px 3px rgba(0,0,0,0.2)"
            : "inset 0 1px 3px rgba(0,0,0,0.25)",
          transition: "background 0.3s ease, box-shadow 0.3s ease",
        }}
        aria-label="Toggle dark mode"
      >
        {/* Knob */}
        <span
          className="absolute top-[3px] block rounded-full bg-white shadow-sm"
          style={{
            width: "18px",
            height: "18px",
            left: darkMode ? "21px" : "3px",
            transition: "left 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
          }}
        />
      </button>
    </div>
  );
}