"use client";

import { useState, useEffect, useRef } from "react";
import { shareitem, getttloptions, getviewoptions, type VaultItem } from "@/lib/share";
import * as QRCode from "qrcode";

interface ShareDialogProps {
  item: VaultItem;
  open: boolean;
  onClose: () => void;
}

export function ShareDialog({ item, open, onClose }: ShareDialogProps) {
  const [views, setViews] = useState(1);
  const [ttl, setTtl] = useState("1d");
  const [loading, setLoading] = useState(false);
  const [shareurl, setShareurl] = useState("");
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [qrcode, setQrcode] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else {
      dialogRef.current?.close();
      setShareurl("");
      setQrcode("");
      setViews(1);
      setTtl("1d");
      setCopied(false);
      setRevealed(false);
    }
  }, [open]);

  useEffect(() => {
    if (shareurl) {
      QRCode.toDataURL(shareurl, { width: 200, margin: 2, color: { dark: "#ffffff", light: "#000000" } }).then(setQrcode);
    }
  }, [shareurl]);

  async function handleshare() {
    setLoading(true);
    try {
      const result = await shareitem(item, { views, ttl });
      setShareurl(result.url);
    } catch {
      alert("failed to create share link");
    } finally {
      setLoading(false);
    }
  }

  async function handlecopy() {
    await navigator.clipboard.writeText(shareurl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setTimeout(async () => {
      try {
        const current = await navigator.clipboard.readText();
        if (current === shareurl) await navigator.clipboard.writeText("");
      } catch {}
    }, 30000);
  }

  function handlebackdrop(e: React.MouseEvent) {
    if (e.target === dialogRef.current) onClose();
  }

  function reset() {
    setShareurl("");
    setQrcode("");
    setRevealed(false);
  }

  const ttloptions = getttloptions();
  const viewoptions = getviewoptions();

  if (!open) return null;

  return (
    <dialog ref={dialogRef} onClick={handlebackdrop} onCancel={onClose} className="bg-transparent p-0 backdrop:bg-black/80">
      <div className="bg-[#0a0a0a] border border-white/10 p-6 w-[400px] max-w-[90vw]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-white">share item</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {!shareurl ? (
          <div className="space-y-6">
            <div className="p-4 bg-white/5 border border-white/10">
              <p className="text-sm text-white/60 mb-1">{item.type}</p>
              <p className="text-white font-medium">{item.title}</p>
            </div>
            <div>
              <label className="text-xs tracking-widest text-white/40 block mb-2">views</label>
              <div className="flex gap-1.5">
                {viewoptions.map((n) => (
                  <button key={n} type="button" onClick={() => setViews(n)} className={`flex-1 h-9 text-sm transition-colors ${views === n ? "bg-[#d4b08c] text-black" : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"}`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs tracking-widest text-white/40 block mb-2">expires</label>
              <div className="flex gap-1.5 flex-wrap">
                {ttloptions.map((opt) => (
                  <button key={opt.value} type="button" onClick={() => setTtl(opt.value)} className={`px-3 h-9 text-sm transition-colors ${ttl === opt.value ? "bg-[#d4b08c] text-black" : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"}`}>{opt.label}</button>
                ))}
              </div>
            </div>
            <ul className="space-y-1">
              <li className="text-xs text-white/30 flex items-center gap-2"><span className="w-1 h-1 bg-[#d4b08c] rounded-full" />encrypted with a unique key</li>
              <li className="text-xs text-white/30 flex items-center gap-2"><span className="w-1 h-1 bg-[#d4b08c] rounded-full" />key never sent to server</li>
              <li className="text-xs text-white/30 flex items-center gap-2"><span className="w-1 h-1 bg-[#d4b08c] rounded-full" />self-destructs after viewing</li>
            </ul>
            <button onClick={handleshare} disabled={loading} className="w-full bg-[#d4b08c] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed">{loading ? "creating..." : "create share link"}</button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">{qrcode && <img src={qrcode} alt="qr code" className="w-48 h-48" />}</div>
            <div>
              <div className="border border-white/10 p-4 bg-white/5 flex items-center gap-3">
                <code className="text-sm text-white/80 font-mono flex-1 truncate">{revealed ? shareurl : "••••••••••••••••••••••••••••••••"}</code>
                <button type="button" onClick={() => setRevealed(!revealed)} className="text-white/40 hover:text-white text-xs tracking-widest shrink-0">{revealed ? "hide" : "show"}</button>
              </div>
            </div>
            <button onClick={handlecopy} className="w-full bg-[#d4b08c] text-black py-3 text-sm tracking-widest font-bold hover:opacity-80 transition-opacity">{copied ? "copied" : "copy link"}</button>
            <p className="text-xs text-white/30 text-center">{copied ? "link will be cleared from clipboard in 30s" : `link expires after ${views} view${views > 1 ? "s" : ""}`}</p>
            <button onClick={reset} className="w-full border border-white/10 py-3 text-sm tracking-widest text-white/40 hover:text-white hover:border-white/30 transition-colors">create another link</button>
          </div>
        )}
      </div>
    </dialog>
  );
}
