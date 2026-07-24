// @ts-nocheck
import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Upload, FileText, Trash2, Download, AlertCircle, CheckCircle, X, FileImage, File, FileWarning } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { lookupBooking, FUSIOO_DEST_MAP, normalizeGdx } from "@/services/supabaseService";
import { uploadVoucher, getVouchers, deleteVoucher } from "@/services/voucherService";

const ORANGE = "#FF9913";
const SESSION_KEY = "gdx_admin_auth";

const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
  : null;

const DEST_LABEL = { boracay: "Boracay", cebu: "Cebu", elnido: "El Nido", siargao: "Siargao", puertoprincesa: "Puerto Princesa", davao: "Davao" };

function formatAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fileIcon(type) {
  if (!type) return <File size={16} />;
  if (type.includes("pdf")) return <FileText size={16} />;
  if (type.includes("image")) return <FileImage size={16} />;
  return <File size={16} />;
}

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function Toast({ toasts }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10, pointerEvents: "none" }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "12px 16px", borderRadius: 12,
              background: t.type === "error" ? "#fff1f1" : "#f0fdf4",
              border: `1.5px solid ${t.type === "error" ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)"}`,
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              fontSize: "13px", fontWeight: 700,
              color: t.type === "error" ? "#dc2626" : "#16a34a",
              minWidth: 240, maxWidth: 340, pointerEvents: "auto",
            }}
          >
            {t.type === "error" ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function DeleteModal({ file, onConfirm, onCancel, loading }) {
  return (
    <AnimatePresence>
      {file && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, backdropFilter: "blur(2px)" }}
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 16 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
              zIndex: 1001, background: "#fff", borderRadius: 18, padding: "28px 28px 24px",
              width: "min(400px, calc(100vw - 40px))", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
          >
            {/* Icon */}
            <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(220,38,38,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
              <Trash2 size={22} color="#dc2626" />
            </div>

            <h3 style={{ fontSize: "16px", fontWeight: 900, color: "#111", margin: "0 0 6px" }}>Delete File?</h3>
            <p style={{ fontSize: "13px", color: "#888", margin: "0 0 6px", lineHeight: 1.5 }}>
              This will permanently remove:
            </p>
            <p style={{
              fontSize: "12.5px", fontWeight: 700, color: "#333",
              background: "#f5f5f5", borderRadius: 8, padding: "8px 12px",
              margin: "0 0 22px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {file.file_name}
            </p>
            <p style={{ fontSize: "12px", color: "#bbb", margin: "0 0 22px" }}>This action cannot be undone.</p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onCancel}
                disabled={loading}
                style={{
                  flex: 1, padding: "11px", borderRadius: 11, border: "1.5px solid #e5e5e5",
                  background: "#fff", fontSize: "13px", fontWeight: 700, color: "#555", cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <motion.button
                onClick={onConfirm}
                disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                style={{
                  flex: 1, padding: "11px", borderRadius: 11, border: "none",
                  background: loading ? "#fee2e2" : "linear-gradient(135deg, #ef4444, #dc2626)",
                  fontSize: "13px", fontWeight: 800, color: "#fff", cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
              >
                {loading
                  ? <><div style={{ width: 13, height: 13, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Deleting…</>
                  : <><Trash2 size={13} /> Delete</>
                }
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function AdminVouchers() {
  const [gdxInput, setGdxInput]     = useState("");
  const [booking,  setBooking]      = useState(null);
  const [vouchers, setVouchers]     = useState([]);
  const [searching, setSearching]   = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting,  setDeleting]    = useState(false);
  const [searchErr, setSearchErr]   = useState("");
  const [uploadErr, setUploadErr]   = useState("");
  const [success,   setSuccess]     = useState("");
  const [dragOver,  setDragOver]    = useState(false);
  const [toasts,      setToasts]     = useState([]);
  const [pendingList, setPendingList] = useState(null);
  const fileRef = useRef(null);

  const session = (() => { try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null"); } catch { return null; } })();

  useEffect(() => {
    if (!supabase) { setPendingList([]); return; }
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const knownDestIds = new Set(Object.keys(FUSIOO_DEST_MAP));
    Promise.all([
      supabase.from("fusioo_booking_transactions").select("id, data->>gdx, data->>lead_name, data->destination, synced_at").gte("synced_at", thirtyDaysAgo).order("synced_at", { ascending: false }).limit(200),
      supabase.from("vouchers").select("gdx"),
    ]).then(([bRes, vRes]) => {
      const voucherGdxSet = new Set((vRes.data || []).map(v => String(v.gdx)));
      const list = (bRes.data || []).filter(b => {
        if (!b.gdx) return false;
        const dest = Array.isArray(b.destination) ? b.destination[0] : b.destination;
        return dest && knownDestIds.has(dest) && !voucherGdxSet.has(String(b.gdx));
      }).map(b => ({
        ...b,
        destSlug: FUSIOO_DEST_MAP[Array.isArray(b.destination) ? b.destination[0] : b.destination],
      }));
      setPendingList(list);
    }).catch(() => setPendingList([]));
  }, []);

  const addToast = (message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  };

  const cleanGdx = (raw) => raw.trim().replace(/^gdx[-\s]*/i, "");

  const handleSearch = async (e, overrideGdx) => {
    e?.preventDefault();
    const gdx = overrideGdx || cleanGdx(gdxInput);
    if (!gdx) return;
    setSearching(true); setSearchErr(""); setBooking(null); setVouchers([]);
    try {
      const bk = await lookupBooking(gdx);
      if (!bk) { setSearchErr("No booking found for that GDX number."); setSearching(false); return; }
      setBooking(bk);
      const existing = await getVouchers(bk.gdx);
      setVouchers(existing);
    } catch (e) {
      setSearchErr(e.message || "Lookup failed.");
    }
    setSearching(false);
  };

  const processFile = useCallback(async (file) => {
    if (!file || !booking) return;
    setUploading(true); setUploadErr(""); setSuccess("");
    try {
      await uploadVoucher({
        gdx: booking.gdx,
        file,
        uploadedBy: session?.user || null,
      });
      setSuccess(`"${file.name}" uploaded successfully.`);
      addToast(`"${file.name}" uploaded successfully.`);
      const updated = await getVouchers(booking.gdx);
      setVouchers(updated);
    } catch (e) {
      setUploadErr(e.message || "Upload failed.");
      addToast(e.message || "Upload failed.", "error");
    }
    setUploading(false);
  }, [booking, gdxInput, session]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteVoucher(deleteTarget.id, deleteTarget.storage_path);
      setVouchers(prev => prev.filter(x => x.id !== deleteTarget.id));
      addToast(`"${deleteTarget.file_name}" deleted.`);
      setDeleteTarget(null);
    } catch (e) {
      addToast(`Delete failed: ${e.message}`, "error");
    }
    setDeleting(false);
  };

  return (
    <>
      <motion.div
        style={{ padding: "24px 28px", maxWidth: 720 }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 900, color: "#111", margin: "0 0 4px" }}>Voucher Upload</h2>
          <p style={{ fontSize: "12px", color: "#aaa", margin: 0 }}>Search a GDX booking, then attach a voucher file for the client to download.</p>
        </div>

        {/* GDX Search */}
        <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={13} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#ccc", pointerEvents: "none" }} />
            <input
              value={gdxInput}
              onChange={e => { setGdxInput(e.target.value); setSearchErr(""); }}
              placeholder="Enter GDX number (e.g. 11056)"
              style={{ width: "100%", padding: "10px 14px 10px 34px", borderRadius: 11, border: `1.5px solid ${searchErr ? "rgba(220,38,38,0.4)" : "#e5e5e5"}`, fontSize: "13px", color: "#111", outline: "none", boxSizing: "border-box", background: "#fff" }}
            />
          </div>
          <motion.button
            type="submit"
            disabled={!gdxInput.trim() || searching}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ padding: "10px 20px", borderRadius: 11, background: !gdxInput.trim() ? "#f0f0f0" : `linear-gradient(135deg, ${ORANGE}, #e07c00)`, color: !gdxInput.trim() ? "#bbb" : "#fff", fontWeight: 800, fontSize: "13px", border: "none", cursor: !gdxInput.trim() ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}
          >
            {searching
              ? <div style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
              : <><Search size={13} /> Search</>
            }
          </motion.button>
        </form>

        {/* Search error */}
        <AnimatePresence>
          {searchErr && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.18)", borderRadius: 10, marginBottom: 16, fontSize: "12.5px", color: "#dc2626", fontWeight: 600 }}
            >
              <AlertCircle size={14} /> {searchErr}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pending list — bookings without a voucher */}
        <AnimatePresence>
          {!booking && pendingList !== null && pendingList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginBottom: 20 }}
            >
              <p style={{ fontSize: "11px", fontWeight: 900, color: "#bbb", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 8px" }}>
                Needs Voucher · {pendingList.length} booking{pendingList.length > 1 ? "s" : ""}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {pendingList.map((b, i) => (
                  <motion.button
                    key={b.id}
                    initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    onClick={() => { setGdxInput(b.gdx); handleSearch(null, b.gdx); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#fff", border: "1.5px solid rgba(249,115,22,0.15)", borderRadius: 11, cursor: "pointer", textAlign: "left", width: "100%" }}
                    whileHover={{ borderColor: "rgba(249,115,22,0.4)", background: "rgba(249,115,22,0.03)" }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(249,115,22,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FileWarning size={13} color="#f97316" />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.lead_name || "—"}</p>
                      <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>{normalizeGdx(b.gdx)} · {DEST_LABEL[b.destSlug] || b.destSlug} · booked {formatAgo(b.synced_at)}</p>
                    </div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#f97316", background: "rgba(249,115,22,0.08)", padding: "3px 8px", borderRadius: 6, flexShrink: 0 }}>Upload</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Booking found */}
        <AnimatePresence>
          {booking && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ background: "#fff", border: "1.5px solid #f0ece7", borderRadius: 14, overflow: "hidden", marginBottom: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
            >
              {/* Back button */}
              {pendingList?.length > 0 && (
                <button
                  onClick={() => { setBooking(null); setVouchers([]); setGdxInput(""); setSearchErr(""); setSuccess(""); setUploadErr(""); }}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: "none", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700, color: "#aaa", borderBottom: "1px solid #f0ece7", width: "100%" }}
                >
                  ← Back to list
                </button>
              )}

              {/* Booking info */}
              <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0ece7", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#aaa", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 2px" }}>{booking.gdx}</p>
                  <p style={{ fontSize: "14px", fontWeight: 900, color: "#111", margin: "0 0 2px" }}>{booking.leadName}</p>
                  <p style={{ fontSize: "12px", color: "#888", margin: 0 }}>{booking.destination} · {booking.typeOfPackage || "—"}</p>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: 999, background: "rgba(22,163,74,0.1)", color: "#16a34a", fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>✓ Found</span>
              </div>

              {/* Upload zone */}
              <div style={{ padding: "18px" }}>
                <p style={{ fontSize: "11.5px", fontWeight: 800, color: "#555", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Attach Voucher</p>

                <div
                  onClick={() => !uploading && fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  style={{
                    border: `2px dashed ${dragOver ? ORANGE : uploading ? "#e0e0e0" : "#ddd"}`,
                    borderRadius: 12, padding: "28px 20px", textAlign: "center",
                    background: dragOver ? `${ORANGE}08` : uploading ? "#fafafa" : "#fafafa",
                    cursor: uploading ? "not-allowed" : "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  {uploading ? (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 22, height: 22, border: `2.5px solid ${ORANGE}30`, borderTopColor: ORANGE, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      <p style={{ fontSize: "13px", color: "#aaa", margin: 0, fontWeight: 600 }}>Uploading…</p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: `${ORANGE}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload size={18} color={ORANGE} />
                      </div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#333", margin: 0 }}>
                        {dragOver ? "Drop file here" : "Click or drag to upload"}
                      </p>
                      <p style={{ fontSize: "11.5px", color: "#bbb", margin: 0 }}>PDF, images, or any file · no size limit</p>
                    </div>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="*/*" onChange={handleFileChange} style={{ display: "none" }} />

                {/* Upload feedback */}
                <AnimatePresence>
                  {(uploadErr || success) && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 10, padding: "9px 12px", borderRadius: 9, background: uploadErr ? "rgba(220,38,38,0.06)" : "rgba(22,163,74,0.06)", border: `1px solid ${uploadErr ? "rgba(220,38,38,0.2)" : "rgba(22,163,74,0.2)"}`, fontSize: "12.5px", color: uploadErr ? "#dc2626" : "#16a34a", fontWeight: 600 }}
                    >
                      {uploadErr ? <AlertCircle size={13} /> : <CheckCircle size={13} />}
                      {uploadErr || success}
                      <button onClick={() => { setUploadErr(""); setSuccess(""); }} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}><X size={12} /></button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Existing vouchers */}
              {vouchers.length > 0 && (
                <div style={{ borderTop: "1px solid #f0ece7", padding: "14px 18px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 10px" }}>Attached Files ({vouchers.length})</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {vouchers.map(v => (
                      <motion.div key={v.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#f9f9f9", borderRadius: 10, border: "1px solid #f0f0f0" }}
                      >
                        <div style={{ color: ORANGE, flexShrink: 0 }}>{fileIcon(v.file_type)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "12.5px", fontWeight: 700, color: "#111", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.file_name}</p>
                          <p style={{ fontSize: "11px", color: "#bbb", margin: 0 }}>{formatBytes(v.file_size)} · {formatDate(v.created_at)} {v.uploaded_by ? `· by ${v.uploaded_by}` : ""}</p>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const res = await fetch(v.file_url);
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              window.open(url, "_blank");
                              setTimeout(() => URL.revokeObjectURL(url), 60000);
                            } catch {
                              window.open(v.file_url, "_blank");
                            }
                          }}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, background: `${ORANGE}12`, color: ORANGE, fontWeight: 700, fontSize: "11px", border: "none", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Download size={12} /> View
                        </button>
                        <button
                          onClick={() => setDeleteTarget(v)}
                          style={{ display: "flex", padding: "5px 7px", borderRadius: 7, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)", color: "#dc2626", cursor: "pointer", flexShrink: 0 }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {vouchers.length === 0 && !uploading && (
                <div style={{ padding: "0 18px 16px", fontSize: "12px", color: "#ccc", fontWeight: 600 }}>
                  No files attached yet.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </motion.div>

      {/* Delete confirmation modal */}
      <DeleteModal
        file={deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setDeleteTarget(null)}
        loading={deleting}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} />
    </>
  );
}
