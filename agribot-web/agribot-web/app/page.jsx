"use client";
import { useState, useRef, useEffect, useCallback } from "react";

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────

const SYSTEM = `You are "AgriBot Pro," an elite, highly technical AI Agronomist and Senior Research Consultant specialized in Indian Precision Agriculture. Your operational framework is modeled after the Indian Council of Agricultural Research (ICAR), the National Bureau of Soil Survey and Land Use Planning (NBSS&LUP), and the Ministry of Agriculture & Farmers Welfare (DA&FW) directives.

Your mandate is to provide authoritative, data-driven, and scientifically accurate agricultural guidance to traditional farmers, commercial growers, and agritech researchers. Always give COMPLETE, thorough answers — never stop mid-response. If answering in points or tables, complete every item fully.

### 1. LOCATION-BASED CROP SUITABILITY MATRIX
When a user provides a geographical location (District, State, or Coordinates), execute a strict assessment:
- Step 1: Identify the Agro-Climatic and Agro-Ecological Sub-Region.
- Step 2: Determine local physical parameters: Soil Taxonomy (Vertisols/Black Cotton, Alluvial, Red Sandy Loam), mean annual rainfall, temperature ranges, and Length of Growing Period (LGP).
- Step 3: Provide recommendations:
  * Optimal Cultivars/Crops: Primary commercial crops, cash crops, or sustainable alternatives.
  * Sowing & Harvesting Windows: Precise calendar periods for Kharif, Rabi, or Zaid cycles.
  * Expected Yield Projections: Based on UPAg APY datasets.

### 2. NATURAL & ORGANIC FARMING EXPERTISE
You are deeply knowledgeable about:
- Zero Budget Natural Farming (ZBNF) by Subhash Palekar — Jivamrita, Bijamrita, Acchadana (mulching), Whapasa
- Panchagavya, Beejamrutha, Dasagavya preparation and application schedules
- Traditional Indian farming wisdom: native seed varieties, crop rotation, companion planting
- Vermicomposting, green manuring, and bio-dynamic preparations
- Tamil Nadu specific: Cauvery delta paddy culture, Madurai jasmine, Coimbatore sugarcane, native rice varieties (Mappillai Samba, Karunakkar, Kavuni), Kuzhimandai planting
- Natural pest management: Neem-based solutions, Agniastra, Brahmastra, fermented plant juice (FPJ)

### 3. SCIENTIFIC INPUT OPTIMIZATION
- Soil Nutrient Mechanics: Explain NPK ratios and physiological plant uptake.
- Soil Degradation: Explain long-term damage from over-application of chemicals.
- Precision Alternatives: Recommend ICAR-approved biofertilizers, nano-formulations, and Integrated Nutrient Management (INM).

### 4. ADVANCED AGRI-TECH
- Precision Farming: Computer vision (YOLO/ResNet) via UAV drones for disease/pest detection.
- Edge IoT: Soil moisture sensors, ETc calculations, automated drip irrigation.

### 5. BEHAVIORAL PROTOCOLS
- Tone: Professional, scientific, yet accessible to a Tamil Nadu farmer.
- Always complete your full answer. Never truncate. If using a table or numbered list, complete every row/item.
- Use Markdown: tables for comparisons, **bold** for technical terms, bullet points for steps.
- Guardrails: If outside agriculture/agronomy/environment, reply: "This system is strictly calibrated for agricultural science under ICAR/DA&FW frameworks. Please rephrase your query to focus on agronomic parameters."`;

// ─── QUICK QUESTIONS ──────────────────────────────────────────────────────────

const QUICK = [
  { icon: "🌾", text: "Best organic paddy varieties for Cauvery delta in Thanjavur, Tamil Nadu?" },
  { icon: "🧴", text: "How to prepare Panchagavya bio-stimulant for Tamil Nadu farms?" },
  { icon: "🐜", text: "Natural pest control for jasmine cultivation in Madurai, Tamil Nadu?" },
  { icon: "🌿", text: "Zero-budget natural farming (ZBNF) methods for Coimbatore district, TN?" },
  { icon: "🪱", text: "Vermicomposting setup for banana gardens in Tirunelveli, Tamil Nadu?" },
  { icon: "💧", text: "Rainwater harvesting for dry land farming in Sivagangai, Tamil Nadu?" },
];

// ─── INLINE MARKDOWN PARSER ───────────────────────────────────────────────────

function parseInline(str, base = 0) {
  const out = [];
  let s = str, k = base * 1000;
  while (s) {
    const pats = [
      { re: /\*\*(.+?)\*\*/, t: "b" },
      { re: /`(.+?)`/, t: "c" },
      { re: /\*(.+?)\*/, t: "i" },
    ];
    let best = null, bi = Infinity, bm = null;
    for (const p of pats) {
      const m = p.re.exec(s);
      if (m && m.index < bi) { best = p.t; bi = m.index; bm = m; }
    }
    if (!best) { out.push(<span key={k++}>{s}</span>); break; }
    if (bi > 0) out.push(<span key={k++}>{s.slice(0, bi)}</span>);
    const c = bm[1];
    if (best === "b") out.push(<strong key={k++} style={{ fontWeight: 700, color: "#1a3a0a" }}>{c}</strong>);
    else if (best === "i") out.push(<em key={k++} style={{ fontStyle: "italic" }}>{c}</em>);
    else out.push(<code key={k++} style={{ background: "#ecfdf5", color: "#166534", padding: "1px 5px", borderRadius: 4, fontSize: "0.81em", fontFamily: "monospace" }}>{c}</code>);
    s = s.slice(bi + bm[0].length);
  }
  return out;
}

// ─── BLOCK MARKDOWN RENDERER ─────────────────────────────────────────────────

function MdBlock({ text }) {
  const lines = text.split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (l.includes("|") && i + 1 < lines.length && /^[\s|:\-]+$/.test(lines[i + 1])) {
      const hdrs = l.split("|").map(s => s.trim()).filter(Boolean);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].includes("|")) {
        rows.push(lines[i].split("|").map(s => s.trim()).filter(Boolean));
        i++;
      }
      out.push(
        <div key={`t${i}`} style={{ overflowX: "auto", margin: "10px 0", borderRadius: 10, border: "1px solid #bbf7d0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.79em", minWidth: 280 }}>
            <thead>
              <tr style={{ background: "linear-gradient(90deg,#1a6b2f,#2d7a3a)", color: "#fff" }}>
                {hdrs.map((h, j) => <th key={j} style={{ padding: "8px 11px", textAlign: "left", fontWeight: 600, borderRight: "1px solid rgba(255,255,255,0.15)", whiteSpace: "nowrap" }}>{parseInline(h, i * 100 + j)}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, j) => (
                <tr key={j} style={{ background: j % 2 ? "#f0fdf4" : "#fff" }}>
                  {hdrs.map((_, k) => <td key={k} style={{ padding: "6px 11px", borderRight: "1px solid #dcfce7", color: "#374151", verticalAlign: "top", lineHeight: 1.5 }}>{parseInline(row[k] || "", j * 100 + k)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }
    if (l.startsWith("### ")) {
      out.push(<h3 key={i} style={{ fontSize: "0.88em", fontWeight: 700, color: "#166534", margin: "12px 0 4px", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#C8A84B" }}>◆</span>{parseInline(l.slice(4), i)}</h3>);
    } else if (l.startsWith("## ")) {
      out.push(<h2 key={i} style={{ fontSize: "0.95em", fontWeight: 700, color: "#14532d", margin: "14px 0 5px", borderBottom: "2px solid #C8A84B", paddingBottom: 4 }}>{parseInline(l.slice(3), i)}</h2>);
    } else if (l.startsWith("# ")) {
      out.push(<h1 key={i} style={{ fontSize: "1.05em", fontWeight: 800, color: "#0a2e12", margin: "14px 0 6px" }}>{parseInline(l.slice(2), i)}</h1>);
    } else if (/^[ \t]*[-*] /.test(l)) {
      const items = [];
      while (i < lines.length && /^[ \t]*[-*] /.test(lines[i])) {
        items.push({ text: lines[i].replace(/^[ \t]*[-*] /, ""), indent: /^ {2,}/.test(lines[i]) });
        i++;
      }
      out.push(
        <ul key={`ul${i}`} style={{ margin: "6px 0", padding: 0, listStyle: "none" }}>
          {items.map((it, j) => (
            <li key={j} style={{ display: "flex", gap: 7, alignItems: "flex-start", marginBottom: 4, paddingLeft: it.indent ? 18 : 0 }}>
              <span style={{ color: "#C8A84B", fontSize: "0.65em", marginTop: 5, flexShrink: 0 }}>▶</span>
              <span style={{ fontSize: "0.84em", color: "#374151", lineHeight: 1.65 }}>{parseInline(it.text, i * 100 + j)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (/^\d+\. /.test(l)) {
      const items = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(lines[i].replace(/^\d+\. /, ""));
        i++;
      }
      out.push(
        <ol key={`ol${i}`} style={{ margin: "6px 0", padding: 0, listStyle: "none" }}>
          {items.map((it, j) => (
            <li key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 4 }}>
              <span style={{ background: "linear-gradient(135deg,#C8A84B,#a8832a)", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.68em", fontWeight: 700, flexShrink: 0, marginTop: 3 }}>{j + 1}</span>
              <span style={{ fontSize: "0.84em", color: "#374151", lineHeight: 1.65 }}>{parseInline(it, i * 100 + j)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (/^---+$/.test(l.trim())) {
      out.push(<hr key={i} style={{ border: "none", borderTop: "1px solid #d1fae5", margin: "10px 0" }} />);
    } else if (l.trim()) {
      out.push(<p key={i} style={{ fontSize: "0.85em", color: "#374151", margin: "4px 0", lineHeight: 1.65 }}>{parseInline(l, i)}</p>);
    }
    i++;
  }
  return <div>{out}</div>;
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function AgriBot() {
  const [msgs, setMsgs] = useState([]);
  const [hist, setHist] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const endRef = useRef(null);
  const taRef = useRef(null);
  const bodyRef = useRef(null);
  const userScrolled = useRef(false);

  useEffect(() => {
    if (!userScrolled.current) endRef.current?.scrollIntoView({ behavior: "auto" });
  }, [msgs]);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const fn = () => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      userScrolled.current = scrollHeight - scrollTop - clientHeight > 80;
    };
    el.addEventListener("scroll", fn, { passive: true });
    return () => el.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (taRef.current) {
      taRef.current.style.height = "auto";
      taRef.current.style.height = Math.min(taRef.current.scrollHeight, 130) + "px";
    }
  }, [draft]);

  const send = useCallback(async (txt) => {
    const q = txt.trim();
    if (!q || busy) return;
    setDraft(""); setStarted(true);
    userScrolled.current = false;

    const nextH = [...hist, { role: "user", content: q }];
    setHist(nextH);
    setMsgs(p => [...p, { r: "u", t: q }, { r: "a", t: "" }]);
    setBusy(true);

    try {
      // Calls our secure /api/chat route — API key never leaves the server
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ system: SYSTEM, messages: nextH }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const raw = line.slice(6).trim();
          if (!raw || raw === "[DONE]") continue;
          try {
            const evt = JSON.parse(raw);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta" && evt.delta.text) {
              fullText += evt.delta.text;
              setMsgs(p => { const u = [...p]; u[u.length - 1] = { r: "a", t: fullText }; return u; });
            }
          } catch { /* partial chunk */ }
        }
      }

      setHist(h => [...h, { role: "assistant", content: fullText || "No response." }]);
      if (!fullText) setMsgs(p => { const u = [...p]; u[u.length - 1] = { r: "e", t: "⚠️ Empty response. Please try again." }; return u; });

    } catch (e) {
      setMsgs(p => { const u = [...p]; u[u.length - 1] = { r: "e", t: `⚠️ ${e.message || "Network error — please retry."}` }; return u; });
    } finally {
      setBusy(false);
      setTimeout(() => taRef.current?.focus(), 60);
    }
  }, [hist, busy]);

  const reset = () => { setMsgs([]); setHist([]); setStarted(false); setDraft(""); userScrolled.current = false; };
  const onKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(draft); } };
  const canSend = draft.trim().length > 0 && !busy;

  return (
    <div style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#070D08", fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", overflow: "hidden" }}>

      {/* HEADER */}
      <header style={{ flexShrink: 0, background: "rgba(7,13,8,0.97)", backdropFilter: "blur(14px)", borderBottom: "1px solid rgba(200,168,75,0.18)", padding: "11px 18px", zIndex: 10 }}>
        <div style={{ maxWidth: 740, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 42, height: 42, background: "linear-gradient(140deg,#2d7a3a,#1a5c25)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 21, boxShadow: "0 0 0 2px rgba(200,168,75,0.45), 0 4px 14px rgba(22,163,74,0.3)" }}>🌾</div>
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 11, height: 11, background: "#4ade80", borderRadius: "50%", border: "2px solid #070D08", animation: "agrPulse 2.5s ease-in-out infinite" }} />
            </div>
            <div>
              <div style={{ color: "#f0fdf4", fontWeight: 800, fontSize: 17, letterSpacing: "-0.4px", lineHeight: 1.15 }}>AgriBot <span style={{ color: "#C8A84B" }}>Pro</span></div>
              <div style={{ color: "#6ee7b7", fontSize: 10.5, fontWeight: 400, marginTop: 1 }}>Your Agriculture Assistant</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div style={{ color: "rgba(200,168,75,0.6)", fontSize: 11, fontWeight: 500 }}>by Olivadevan</div>
            {started && (
              <button onClick={reset}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.13)", borderRadius: 9, padding: "5px 13px", color: "#a7f3d0", fontSize: 12, cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                ↺ New Chat
              </button>
            )}
          </div>
        </div>
      </header>

      {/* BODY */}
      <main ref={bodyRef} style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 740, margin: "0 auto", width: "100%", padding: "16px 14px 6px", display: "flex", flexDirection: "column", flex: 1 }}>

          {!started && (
            <div style={{ flex: 1 }}>
              <div style={{ textAlign: "center", padding: "20px 8px 24px" }}>
                <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
                  <div style={{ width: 80, height: 80, background: "linear-gradient(140deg,#2d7a3a,#1a5c25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto", boxShadow: "0 0 0 3px rgba(200,168,75,0.4), 0 8px 32px rgba(22,163,74,0.3)" }}>🌱</div>
                  <div style={{ position: "absolute", bottom: 4, right: -2, background: "#C8A84B", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, border: "2px solid #070D08" }}>🤖</div>
                </div>
                <h1 style={{ color: "#f0fdf4", fontWeight: 900, fontSize: 25, letterSpacing: "-0.5px", margin: "0 0 5px" }}>AgriBot <span style={{ color: "#C8A84B" }}>Pro</span></h1>
                <p style={{ color: "#86efac", fontSize: 13, margin: "0 0 4px" }}>Your Agriculture Assistant</p>
                <p style={{ color: "rgba(200,168,75,0.5)", fontSize: 11, margin: "0 0 20px" }}>by Olivadevan</p>
              </div>
              <div style={{ color: "#4ade80", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 9, paddingLeft: 2 }}>◆ Quick-Start Questions</div>
              <div style={{ display: "grid", gap: 7 }}>
                {QUICK.map((q, i) => (
                  <button key={i} onClick={() => send(q.text)}
                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,168,75,0.16)", borderRadius: 12, padding: "12px 15px", color: "#d1fae5", fontSize: 13, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12, transition: "all 0.18s", width: "100%" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,168,75,0.08)"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.38)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.16)"; }}>
                    <span style={{ fontSize: 19, flexShrink: 0 }}>{q.icon}</span>
                    <span style={{ lineHeight: 1.4 }}>{q.text}</span>
                    <span style={{ marginLeft: "auto", color: "#C8A84B", flexShrink: 0 }}>›</span>
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "20px 0 4px" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(200,168,75,0.12)" }} />
                <span style={{ color: "rgba(200,168,75,0.4)", fontSize: 10.5 }}>or type your question below</span>
                <div style={{ flex: 1, height: 1, background: "rgba(200,168,75,0.12)" }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {msgs.map((msg, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: msg.r === "u" ? "flex-end" : "flex-start", gap: 9, alignItems: "flex-start" }}>
                {msg.r !== "u" && (
                  <div style={{ width: 30, height: 30, background: "linear-gradient(140deg,#2d7a3a,#1a5c25)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0, marginTop: 2, boxShadow: "0 0 0 1.5px rgba(200,168,75,0.38)" }}>🌾</div>
                )}
                <div style={{
                  maxWidth: "84%", padding: "11px 15px",
                  borderRadius: msg.r === "u" ? "17px 17px 4px 17px" : "4px 17px 17px 17px",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.22)",
                  ...(msg.r === "u"
                    ? { background: "linear-gradient(135deg,#b8902a,#C8A84B)" }
                    : msg.r === "e"
                    ? { background: "#fef2f2", border: "1px solid #fecaca" }
                    : { background: "#fff", border: "1px solid rgba(187,247,208,0.5)", borderLeft: "3px solid #4ade80" })
                }}>
                  {msg.r === "u"
                    ? <span style={{ fontSize: "0.88em", lineHeight: 1.55, color: "#fff" }}>{msg.t}</span>
                    : msg.r === "e"
                    ? <span style={{ fontSize: "0.87em", color: "#b91c1c" }}>{msg.t}</span>
                    : (
                      <div>
                        {msg.t
                          ? <MdBlock text={msg.t} />
                          : <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "2px 0" }}>
                              {[0, 1, 2].map(d => <div key={d} style={{ width: 7, height: 7, background: "#C8A84B", borderRadius: "50%", animation: `agriDot 1.3s ease-in-out ${d * 0.2}s infinite` }} />)}
                              <span style={{ fontSize: "0.78em", color: "#9ca3af", fontStyle: "italic", marginLeft: 4 }}>Consulting knowledge base...</span>
                            </div>
                        }
                        {busy && idx === msgs.length - 1 && msg.t && (
                          <span style={{ display: "inline-block", width: 2, height: 13, background: "#16a34a", marginLeft: 1, verticalAlign: "middle", animation: "agrBlink 0.9s step-end infinite" }} />
                        )}
                      </div>
                    )
                  }
                </div>
                {msg.r === "u" && (
                  <div style={{ width: 30, height: 30, background: "rgba(200,168,75,0.14)", border: "1.5px solid rgba(200,168,75,0.32)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>👤</div>
                )}
              </div>
            ))}
          </div>
          <div ref={endRef} style={{ height: 8 }} />
        </div>
      </main>

      {/* INPUT */}
      <footer style={{ flexShrink: 0, background: "rgba(7,13,8,0.97)", backdropFilter: "blur(14px)", borderTop: "1px solid rgba(200,168,75,0.16)", padding: "10px 14px 13px" }}>
        <div style={{ maxWidth: 740, margin: "0 auto" }}>
          <div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.055)", border: `1.5px solid ${canSend ? "rgba(200,168,75,0.48)" : "rgba(255,255,255,0.09)"}`, borderRadius: 15, display: "flex", alignItems: "flex-end", transition: "border-color 0.2s" }}>
              <textarea ref={taRef} value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={onKey}
                placeholder="Ask about crops, soil, natural farming, pest control..."
                rows={1}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#f0fdf4", fontSize: "0.875em", padding: "11px 14px", resize: "none", minHeight: 44, maxHeight: 130, fontFamily: "inherit", lineHeight: 1.55, caretColor: "#C8A84B" }}
              />
            </div>
            <button onClick={() => send(draft)} disabled={!canSend}
              style={{ width: 44, height: 44, borderRadius: 13, border: "none", flexShrink: 0, cursor: canSend ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", background: canSend ? "linear-gradient(135deg,#b8902a,#C8A84B)" : "rgba(255,255,255,0.07)", boxShadow: canSend ? "0 3px 14px rgba(200,168,75,0.42)" : "none", color: canSend ? "#fff" : "#4b5563" }}>
              {busy && !draft
                ? <div style={{ width: 17, height: 17, border: "2.5px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", animation: "agrSpin 0.7s linear infinite" }} />
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
              }
            </button>
          </div>
          <div style={{ textAlign: "center", marginTop: 6, color: "rgba(200,168,75,0.3)", fontSize: 10 }}>
            Enter to send · Shift+Enter for new line · Powered by Claude AI
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes agriDot { 0%,100%{transform:translateY(0);opacity:0.45} 50%{transform:translateY(-7px);opacity:1} }
        @keyframes agrPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.85)} }
        @keyframes agrSpin { to{transform:rotate(360deg)} }
        @keyframes agrBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:rgba(200,168,75,0.22);border-radius:4px}
        textarea::placeholder{color:rgba(110,231,183,0.28)!important}
        button:focus{outline:none}
      `}</style>
    </div>
  );
}
