import { useState, useEffect, useRef } from "react";

// ─── In-memory shared DB (simulates backend) ──────────────────────────────────
const DB = {
  sessions: {
    "s1": { id: "s1", name: "Test AG Session UI", description: "Testing the UI functionality", status: "active", createdAt: Date.now() - 86400000, points: [] },
    "s2": { id: "s2", name: "AG", description: "", status: "active", createdAt: Date.now() - 3600000, points: [] },
    "s3": { id: "s3", name: "E2E Test Session", description: "End to end test", status: "active", createdAt: Date.now() - 7200000, points: [] },
    "s4": { id: "s4", name: "AG Bel horizon", description: "", status: "active", createdAt: Date.now() - 10800000, points: [] },
    "s5": { id: "s5", name: "Syndic", description: "", status: "active", createdAt: Date.now() - 14400000, points: [] },
  },
  responses: {},
  nextId: 100,
};

function uid() { return String(DB.nextId++); }

function getResponses(sessionId, pointId) {
  return DB.responses[`${sessionId}:${pointId}`] || [];
}

function addResponse(sessionId, pointId, data) {
  const key = `${sessionId}:${pointId}`;
  if (!DB.responses[key]) DB.responses[key] = [];
  DB.responses[key].push({ id: uid(), ...data, ts: Date.now() });
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  // Layout
  page: { minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans', 'Helvetica Neue', Arial, sans-serif", color: "#111" },
  // Nav
  nav: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 40px", height: 60, background: "#fff", borderBottom: "1px solid #e5e5e5", position: "sticky", top: 0, zIndex: 100 },
  navBrand: { display: "flex", alignItems: "center", gap: 12, fontWeight: 700, fontSize: 17, color: "#111", cursor: "pointer" },
  navIcon: { width: 36, height: 36, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16 },
  navActions: { display: "flex", gap: 8 },
  navBtn: { padding: "8px 16px", background: "transparent", border: "1px solid #e5e5e5", borderRadius: 8, cursor: "pointer", fontSize: 14, color: "#555", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" },
  // Hero
  hero: { position: "relative", padding: "80px 48px 60px", overflow: "hidden", minHeight: 340, display: "flex", flexDirection: "column", justifyContent: "center" },
  heroBg: { position: "absolute", inset: 0, background: "url('https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1400&q=60') center/cover no-repeat", opacity: 0.13, zIndex: 0 },
  heroContent: { position: "relative", zIndex: 1, maxWidth: 680 },
  heroTitle: { fontSize: 52, fontWeight: 800, lineHeight: 1.1, margin: "0 0 20px", color: "#111" },
  heroSub: { color: "#555", fontSize: 17, lineHeight: 1.6, maxWidth: 520, margin: "0 0 36px" },
  heroCta: { display: "inline-flex", alignItems: "center", gap: 10, padding: "14px 28px", background: "#111", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  // Section
  section: { padding: "48px 48px 0" },
  sectionTitle: { fontSize: 26, fontWeight: 700, margin: "0 0 28px" },
  // Cards grid
  grid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 48 },
  card: { background: "#fff", borderRadius: 16, padding: 28, border: "1px solid #e8e8e8", cursor: "pointer", transition: "box-shadow 0.15s, transform 0.15s" },
  cardTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 6px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
  cardDesc: { color: "#777", fontSize: 14, margin: "0 0 20px" },
  badge: { background: "#dbeafe", color: "#1d4ed8", borderRadius: 20, padding: "3px 12px", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap" },
  cardActions: { display: "flex", gap: 10 },
  cardBtn: { flex: 1, padding: "10px 16px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontWeight: 500 },
  cardBtnIcon: { padding: "10px 14px", background: "#fff", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 16, cursor: "pointer" },
  // How it works
  howGrid: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, marginBottom: 48 },
  howCard: { background: "#fff", borderRadius: 16, padding: 32, border: "1px solid #e8e8e8" },
  howNum: { fontSize: 40, fontWeight: 800, color: "#ddd", margin: "0 0 20px" },
  howTitle: { fontSize: 18, fontWeight: 700, margin: "0 0 10px" },
  howDesc: { color: "#666", fontSize: 14, lineHeight: 1.6, margin: 0 },
  // Footer
  footer: { padding: "24px 48px", borderTop: "1px solid #e5e5e5", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#999", background: "#fff" },
  // Modal
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#fff", borderRadius: 16, padding: 36, width: "100%", maxWidth: 480, boxShadow: "0 20px 60px rgba(0,0,0,0.15)" },
  modalTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 8px" },
  modalSub: { color: "#777", fontSize: 14, margin: "0 0 28px" },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 },
  input: { width: "100%", padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 16 },
  textarea: { width: "100%", padding: "12px 14px", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", resize: "vertical", marginBottom: 16 },
  btnPrimary: { width: "100%", padding: "14px", background: "#111", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
  btnSecondary: { width: "100%", padding: "14px", background: "#fff", color: "#555", border: "1px solid #e5e5e5", borderRadius: 8, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 10 },
};

// ─── QR Code (SVG pattern) ────────────────────────────────────────────────────
function QRCode({ value, size = 160 }) {
  const cells = 25;
  const cs = size / cells;
  let hash = 5381;
  for (let i = 0; i < value.length; i++) hash = ((hash << 5) + hash) + value.charCodeAt(i);
  const isFinderR = (r, c) => (r < 7 && c < 7) || (r < 7 && c >= cells - 7) || (r >= cells - 7 && c < 7);
  const isFinderBorder = (r, c) => {
    if (r < 7 && c < 7) return r === 0 || r === 6 || c === 0 || c === 6;
    if (r < 7 && c >= cells - 7) return r === 0 || r === 6 || c === cells - 7 || c === cells - 1;
    if (r >= cells - 7 && c < 7) return r === cells - 7 || r === cells - 1 || c === 0 || c === 6;
    return false;
  };
  const rects = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      let filled;
      if (isFinderR(r, c)) filled = !isFinderBorder(r, c);
      else filled = ((hash >>> ((r * cells + c) % 31)) & 1) === 1;
      if (filled) rects.push(<rect key={`${r}-${c}`} x={c * cs} y={r * cs} width={cs} height={cs} fill="#111" />);
    }
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ background: "#fff", borderRadius: 4 }}>
      {rects}
    </svg>
  );
}

// ─── PARTICIPANT QUESTIONNAIRE ────────────────────────────────────────────────
function ParticipantView({ sessionId, pointId, onDone }) {
  const [step, setStep] = useState("name");
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState({});
  const [done, setDone] = useState(false);

  const session = DB.sessions[sessionId];
  const point = session?.points?.find(p => p.id === pointId);

  if (!session || !point) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f0", fontFamily: "inherit" }}>
      <div style={{ textAlign: "center", color: "#666" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
        <p>Session ou point introuvable.</p>
        <button onClick={onDone} style={{ ...S.btnSecondary, width: "auto", padding: "10px 24px" }}>Retour</button>
      </div>
    </div>
  );

  function set(key, val) { setAnswers(a => ({ ...a, [key]: val })); }

  function submit() {
    addResponse(sessionId, pointId, {
      name,
      hasObjection: answers.hasObjection === "oui",
      perception: answers.perception,
      interestType: answers.interestType,
      riskLevel: answers.riskLevel,
      protectsCollective: answers.protectsCollective,
      verifiable: answers.verifiable,
      canLift: answers.canLift,
      amendment: answers.amendment || "",
    });
    setDone(true);
  }

  const pStyle = {
    minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif",
    display: "flex", flexDirection: "column",
  };
  const headerStyle = { background: "#fff", borderBottom: "1px solid #e5e5e5", padding: "16px 24px", display: "flex", alignItems: "center", gap: 12 };
  const bodyStyle = { flex: 1, padding: 24, maxWidth: 540, margin: "0 auto", width: "100%" };
  const qTitle = { fontSize: 20, fontWeight: 700, margin: "0 0 8px" };
  const qSub = { color: "#666", fontSize: 14, margin: "0 0 24px" };

  function ChoiceCard({ val, label, sub, current, onClick, accent }) {
    const sel = current === val;
    return (
      <button onClick={onClick} style={{
        width: "100%", padding: "16px 20px", background: sel ? "#f0f9ff" : "#fff",
        border: `2px solid ${sel ? "#2563eb" : "#e5e5e5"}`, borderRadius: 12,
        cursor: "pointer", textAlign: "left", fontFamily: "inherit",
        marginBottom: 10, transition: "border-color 0.15s",
      }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: sel ? "#2563eb" : "#111" }}>{label}</div>
        {sub && <div style={{ fontSize: 13, color: "#777", marginTop: 3 }}>{sub}</div>}
      </button>
    );
  }

  if (done) return (
    <div style={pStyle}>
      <div style={headerStyle}>
        <div style={{ ...S.navIcon, width: 28, height: 28, fontSize: 13 }}>SC</div>
        <span style={{ fontWeight: 700 }}>Socratic Consensus</span>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ width: 64, height: 64, background: "#dcfce7", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>✓</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 8px" }}>Réponse enregistrée</h2>
          <p style={{ color: "#666", margin: "0 0 28px" }}>Merci {name}, votre réponse a été transmise avec succès.</p>
          <button onClick={onDone} style={{ ...S.btnPrimary, width: "auto", padding: "12px 28px" }}>Retour à l'accueil</button>
        </div>
      </div>
    </div>
  );

  const steps = ["name", "objection", "perception", "interestType", "riskLevel", "protectsCollective", "verifiable", "canLift", "amendment"];
  const curIdx = steps.indexOf(step);
  const progress = Math.round((curIdx / (steps.length - 1)) * 100);

  return (
    <div style={pStyle}>
      <div style={headerStyle}>
        <div style={{ ...S.navIcon, width: 28, height: 28, fontSize: 13 }}>SC</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{point.title}</div>
          <div style={{ fontSize: 12, color: "#777" }}>{session.name}</div>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 3, background: "#e5e5e5" }}>
        <div style={{ height: "100%", background: "#111", width: `${progress}%`, transition: "width 0.3s" }} />
      </div>

      <div style={bodyStyle}>
        {step === "name" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Bienvenue</h2>
            <p style={qSub}>Veuillez entrer votre nom pour participer au questionnaire.</p>
            <label style={S.label}>Nom & Prénom</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Marie Dupont"
              style={S.input} onKeyDown={e => e.key === "Enter" && name.trim() && setStep("objection")} autoFocus />
            <button onClick={() => name.trim() && setStep("objection")} disabled={!name.trim()}
              style={{ ...S.btnPrimary, opacity: name.trim() ? 1 : 0.4 }}>Commencer →</button>
          </div>
        )}

        {step === "objection" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Y a-t-il une objection ?</h2>
            <p style={qSub}>Avez-vous une réserve ou une opposition concernant ce point ?</p>
            <ChoiceCard val="non" label="✓ Non" sub="Je n'ai pas d'objection sur ce point" current={answers.hasObjection}
              onClick={() => { set("hasObjection", "non"); setTimeout(() => setStep("perception"), 200); }} />
            <ChoiceCard val="oui" label="✋ Oui" sub="J'ai une objection à formuler" current={answers.hasObjection}
              onClick={() => { set("hasObjection", "oui"); setTimeout(() => setStep("perception"), 200); }} />
          </div>
        )}

        {step === "perception" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Comment percevez-vous ce point ?</h2>
            <p style={qSub}>Quelle est la nature de votre intervention ?</p>
            {[
              { val: "comprehension", label: "💬 Compréhension", sub: "Je manque d'informations pour me prononcer" },
              { val: "reglement", label: "📋 Règlement", sub: "Il s'agit d'une question de procédure" },
              { val: "objection", label: "⚠️ Objection", sub: "Je m'oppose à une décision" },
            ].map(o => (
              <ChoiceCard key={o.val} {...o} current={answers.perception}
                onClick={() => {
                  set("perception", o.val);
                  setTimeout(() => {
                    if (answers.hasObjection === "non" && o.val !== "objection") { submit(); setDone(true); }
                    else setStep("interestType");
                  }, 200);
                }} />
            ))}
          </div>
        )}

        {step === "interestType" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Quel intérêt est concerné ?</h2>
            <p style={qSub}>Identifiez le type d'intérêt que votre objection protège.</p>
            {[
              { val: "personnel", label: "👤 Personnel" },
              { val: "sous-groupe", label: "👥 Sous-groupe" },
              { val: "collectif", label: "🏛️ Collectif" },
              { val: "juridique", label: "⚖️ Juridique" },
              { val: "financier", label: "💰 Financier" },
            ].map(o => (
              <ChoiceCard key={o.val} {...o} current={answers.interestType}
                onClick={() => { set("interestType", o.val); setTimeout(() => setStep("riskLevel"), 200); }} />
            ))}
          </div>
        )}

        {step === "riskLevel" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Quel est le risque si la décision est adoptée telle quelle ?</h2>
            <p style={qSub}>Évaluez le niveau de certitude du risque.</p>
            {[
              { val: "certain", label: "🔴 Certain", sub: "Le risque est avéré et immédiat" },
              { val: "probable", label: "🟠 Probable", sub: "Le risque est vraisemblable" },
              { val: "hypothetique", label: "🟡 Hypothétique", sub: "Le risque est possible mais incertain" },
            ].map(o => (
              <ChoiceCard key={o.val} {...o} current={answers.riskLevel}
                onClick={() => { set("riskLevel", o.val); setTimeout(() => setStep("protectsCollective"), 200); }} />
            ))}
          </div>
        )}

        {step === "protectsCollective" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>L'objection protège-t-elle un intérêt collectif ?</h2>
            <p style={qSub}>L'objection va-t-elle dans l'intérêt de l'ensemble du groupe ?</p>
            {["Oui", "Non"].map(o => (
              <ChoiceCard key={o} val={o} label={o} current={answers.protectsCollective}
                onClick={() => { set("protectsCollective", o); setTimeout(() => setStep("verifiable"), 200); }} />
            ))}
          </div>
        )}

        {step === "verifiable" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Est-elle fondée sur un fait vérifiable ?</h2>
            <p style={qSub}>L'objection s'appuie-t-elle sur des éléments factuels et vérifiables ?</p>
            {["Oui", "Non"].map(o => (
              <ChoiceCard key={o} val={o} label={o} current={answers.verifiable}
                onClick={() => { set("verifiable", o); setTimeout(() => setStep("canLift"), 200); }} />
            ))}
          </div>
        )}

        {step === "canLift" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Peut-on lever le risque sans bloquer la décision ?</h2>
            <p style={qSub}>Serait-il possible de modifier la décision pour lever ce risque ?</p>
            {["Oui", "Non"].map(o => (
              <ChoiceCard key={o} val={o} label={o} current={answers.canLift}
                onClick={() => { set("canLift", o); setTimeout(() => setStep("amendment"), 200); }} />
            ))}
          </div>
        )}

        {step === "amendment" && (
          <div style={{ paddingTop: 32 }}>
            <h2 style={qTitle}>Proposition d'amendement</h2>
            <p style={qSub}>Si vous avez une proposition pour modifier la décision et lever l'objection, décrivez-la ici (optionnel).</p>
            <label style={S.label}>Votre proposition</label>
            <textarea
              value={answers.amendment || ""}
              onChange={e => set("amendment", e.target.value)}
              placeholder="Décrivez votre amendement proposé..."
              rows={5} style={S.textarea}
            />
            <button onClick={submit} style={S.btnPrimary}>Soumettre ma réponse</button>
            <button onClick={submit} style={S.btnSecondary}>Passer sans amendement</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SESSION MANAGER VIEW ─────────────────────────────────────────────────────
function SessionView({ sessionId, onBack }) {
  const [tab, setTab] = useState("points"); // points | display
  const [session, setSession] = useState(DB.sessions[sessionId]);
  const [responses, setResponses] = useState({});
  const [activePoint, setActivePoint] = useState(null);
  const [showAddPoint, setShowAddPoint] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [pointTitle, setPointTitle] = useState("");
  const [pointDesc, setPointDesc] = useState("");
  const [voteMode, setVoteMode] = useState(false);
  const [votes, setVotes] = useState({ pour: 0, contre: 0, abstention: 0 });
  const pollRef = useRef(null);

  useEffect(() => {
    pollRef.current = setInterval(() => {
      setSession({ ...DB.sessions[sessionId] });
      const r = {};
      (DB.sessions[sessionId]?.points || []).forEach(p => {
        r[p.id] = getResponses(sessionId, p.id);
      });
      setResponses(r);
    }, 800);
    return () => clearInterval(pollRef.current);
  }, [sessionId]);

  function addPoint() {
    if (!pointTitle.trim()) return;
    const id = uid();
    DB.sessions[sessionId].points.push({ id, title: pointTitle, description: pointDesc, status: "open", createdAt: Date.now() });
    setSession({ ...DB.sessions[sessionId] });
    setPointTitle(""); setPointDesc(""); setShowAddPoint(false);
  }

  const pt = session?.points?.find(p => p.id === activePoint);
  const ptResponses = activePoint ? (responses[activePoint] || []) : [];
  const objections = ptResponses.filter(r => r.hasObjection);
  const noObjection = ptResponses.filter(r => !r.hasObjection);

  const riskColor = { certain: "#ef4444", probable: "#f59e0b", hypothetique: "#84cc16" };
  const totalVotes = votes.pour + votes.contre + votes.abstention;

  // Display mode (projector)
  if (tab === "display" && pt) {
    return (
      <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif", padding: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div>
            <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>{session.name}</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, margin: 0 }}>{pt.title}</h1>
          </div>
          <button onClick={() => setTab("points")} style={{ ...S.navBtn, fontSize: 15 }}>← Retour</button>
        </div>
        {/* Live stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 40 }}>
          {[
            { label: "Participants", val: ptResponses.length, color: "#111" },
            { label: "Sans objection", val: noObjection.length, color: "#16a34a" },
            { label: "Objections", val: objections.length, color: "#dc2626" },
            { label: "Amendements", val: objections.filter(r => r.amendment).length, color: "#d97706" },
          ].map(s => (
            <div key={s.label} style={{ background: "#f9f9f9", borderRadius: 16, padding: 28, textAlign: "center" }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ color: "#666", fontSize: 15, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        {/* Objections */}
        {objections.length > 0 && (
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 20px", color: "#dc2626" }}>Objections ({objections.length})</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
              {objections.map(r => (
                <div key={r.id} style={{ background: "#fff9f9", border: "1px solid #fee2e2", borderRadius: 12, padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                    <span style={{ fontWeight: 700 }}>{r.name}</span>
                    {r.riskLevel && <span style={{ color: riskColor[r.riskLevel], fontSize: 13, fontWeight: 600 }}>{r.riskLevel}</span>}
                  </div>
                  {r.amendment && (
                    <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: 12, fontSize: 14, color: "#166534" }}>
                      💡 {r.amendment}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {objections.length === 0 && ptResponses.length > 0 && (
          <div style={{ textAlign: "center", padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#16a34a" }}>Consensus atteint !</div>
            <div style={{ color: "#666", marginTop: 8 }}>Aucune objection — vous pouvez passer au vote.</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif" }}>
      {/* Nav */}
      <div style={S.nav}>
        <div style={S.navBrand} onClick={onBack}>
          <div style={S.navIcon}>👥</div>
          Socratic Consensus
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#666" }}>{session?.name}</span>
          <button onClick={onBack} style={S.navBtn}>← Retour</button>
        </div>
      </div>

      <div style={{ padding: "40px 48px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 36 }}>
          <div>
            <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 6px" }}>{session?.name}</h1>
            {session?.description && <p style={{ color: "#666", margin: 0 }}>{session.description}</p>}
          </div>
          <button onClick={() => setShowAddPoint(true)} style={S.heroCta}>+ Ajouter un point</button>
        </div>

        {/* Points list */}
        {(!session?.points || session.points.length === 0) ? (
          <div style={{ textAlign: "center", padding: "60px 20px", background: "#fff", borderRadius: 16, border: "2px dashed #e5e5e5" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <p style={{ color: "#777", fontSize: 16 }}>Aucun point à l'ordre du jour.<br />Ajoutez un premier point pour commencer.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {session.points.map((p, i) => {
              const resp = responses[p.id] || [];
              const obj = resp.filter(r => r.hasObjection);
              const isActive = activePoint === p.id;
              return (
                <div key={p.id}>
                  <div style={{
                    background: "#fff", borderRadius: 16, padding: 24,
                    border: `2px solid ${isActive ? "#111" : "#e8e8e8"}`,
                    cursor: "pointer"
                  }} onClick={() => setActivePoint(isActive ? null : p.id)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <span style={{ fontSize: 22, fontWeight: 800, color: "#ddd" }}>0{i+1}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 17 }}>{p.title}</div>
                          {p.description && <div style={{ color: "#777", fontSize: 14, marginTop: 2 }}>{p.description}</div>}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {resp.length > 0 && <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "4px 12px", fontSize: 13 }}>{resp.length} réponses</span>}
                        {obj.length > 0 && <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 20, padding: "4px 12px", fontSize: 13 }}>{obj.length} objections</span>}
                        {obj.length === 0 && resp.length > 0 && <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 20, padding: "4px 12px", fontSize: 13 }}>✓ Consensus</span>}
                        <button onClick={e => { e.stopPropagation(); setShowQR(p.id); }} style={{ ...S.cardBtnIcon, fontSize: 18 }}>📱</button>
                        <button onClick={e => { e.stopPropagation(); setActivePoint(p.id); setTab("display"); }} style={{ ...S.cardBtnIcon, fontSize: 18 }}>🖥️</button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded panel */}
                  {isActive && (
                    <div style={{ background: "#fff", borderRadius: "0 0 16px 16px", border: "2px solid #111", borderTop: "1px solid #f0f0f0", padding: "0 24px 24px" }}>
                      {/* Stats */}
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, padding: "20px 0 20px" }}>
                        {[
                          { label: "Total", val: resp.length },
                          { label: "Sans objection", val: resp.length - obj.length, color: "#16a34a" },
                          { label: "Objections", val: obj.length, color: "#dc2626" },
                          { label: "Amendements", val: obj.filter(r => r.amendment).length, color: "#d97706" },
                        ].map(s => (
                          <div key={s.label} style={{ background: "#f9f9f9", borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                            <div style={{ fontSize: 28, fontWeight: 800, color: s.color || "#111" }}>{s.val}</div>
                            <div style={{ fontSize: 12, color: "#666", marginTop: 2 }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Objections list */}
                      {obj.length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#dc2626", marginBottom: 12, letterSpacing: 0.5 }}>OBJECTIONS</div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {obj.map(r => (
                              <div key={r.id} style={{ background: "#fff9f9", border: "1px solid #fee2e2", borderRadius: 10, padding: 16 }}>
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8, alignItems: "center" }}>
                                  <span style={{ fontWeight: 700 }}>{r.name}</span>
                                  {r.riskLevel && <span style={{ background: `${riskColor[r.riskLevel]}20`, color: riskColor[r.riskLevel], borderRadius: 20, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{r.riskLevel}</span>}
                                  {r.interestType && <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>{r.interestType}</span>}
                                  {r.protectsCollective && <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>Collectif: {r.protectsCollective}</span>}
                                  {r.canLift && <span style={{ background: "#f1f5f9", borderRadius: 20, padding: "2px 10px", fontSize: 12 }}>Levable: {r.canLift}</span>}
                                </div>
                                {r.amendment && (
                                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", fontSize: 14, color: "#166534" }}>
                                    <span style={{ fontWeight: 600 }}>Amendement : </span>{r.amendment}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No objection */}
                      {resp.filter(r => !r.hasObjection).length > 0 && (
                        <div style={{ marginBottom: 20 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", marginBottom: 10, letterSpacing: 0.5 }}>SANS OBJECTION</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {resp.filter(r => !r.hasObjection).map(r => (
                              <span key={r.id} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 20, padding: "6px 14px", fontSize: 14, color: "#166534" }}>
                                ✓ {r.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {resp.length === 0 && (
                        <div style={{ textAlign: "center", padding: 32, color: "#999" }}>
                          <div style={{ fontSize: 32, marginBottom: 8 }}>📱</div>
                          <p>En attente des réponses. Partagez le QR code avec les participants.</p>
                          <button onClick={() => setShowQR(p.id)} style={{ ...S.heroCta, fontSize: 14, padding: "10px 20px" }}>Afficher le QR Code</button>
                        </div>
                      )}

                      {/* Vote section */}
                      {obj.length === 0 && resp.length > 0 && (
                        <div style={{ borderTop: "1px solid #e5e5e5", paddingTop: 20, marginTop: 10 }}>
                          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: 0.5 }}>VOTE FINAL</div>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                            {[
                              { t: "pour", label: "✓ Pour", bg: "#f0fdf4", border: "#bbf7d0", color: "#16a34a" },
                              { t: "contre", label: "✗ Contre", bg: "#fff9f9", border: "#fee2e2", color: "#dc2626" },
                              { t: "abstention", label: "— Abstention", bg: "#f9f9f9", border: "#e5e5e5", color: "#666" },
                            ].map(v => (
                              <button key={v.t} onClick={() => setVotes(prev => ({ ...prev, [v.t]: prev[v.t] + 1 }))}
                                style={{ padding: "16px", background: v.bg, border: `1px solid ${v.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", color: v.color, fontWeight: 700, fontSize: 15 }}>
                                <div style={{ fontSize: 28, marginBottom: 4 }}>{votes[v.t]}</div>
                                {v.label}
                              </button>
                            ))}
                          </div>
                          {totalVotes > 0 && (
                            <div style={{ marginTop: 12, display: "flex", height: 8, borderRadius: 4, overflow: "hidden", gap: 2 }}>
                              {votes.pour > 0 && <div style={{ flex: votes.pour, background: "#16a34a" }} />}
                              {votes.contre > 0 && <div style={{ flex: votes.contre, background: "#dc2626" }} />}
                              {votes.abstention > 0 && <div style={{ flex: votes.abstention, background: "#999" }} />}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
      {showQR && (() => {
        const qrPoint = session?.points?.find(p => p.id === showQR);
        const qrVal = `SESSION:${sessionId}:POINT:${showQR}`;
        return (
          <div style={S.overlay} onClick={() => setShowQR(null)}>
            <div style={{ ...S.modal, textAlign: "center" }} onClick={e => e.stopPropagation()}>
              <h3 style={{ ...S.modalTitle, textAlign: "center" }}>QR Code — {qrPoint?.title}</h3>
              <p style={{ color: "#666", fontSize: 14, marginBottom: 24 }}>Les participants scannent ce code pour accéder au questionnaire.</p>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <QRCode value={qrVal} size={180} />
              </div>
              <div style={{ background: "#f5f5f0", borderRadius: 8, padding: "10px 16px", fontSize: 12, color: "#666", fontFamily: "monospace", marginBottom: 20, wordBreak: "break-all" }}>
                {qrVal}
              </div>
              <button onClick={() => setShowQR(null)} style={S.btnPrimary}>Fermer</button>
            </div>
          </div>
        );
      })()}

      {/* Add point modal */}
      {showAddPoint && (
        <div style={S.overlay} onClick={() => setShowAddPoint(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Ajouter un point</h3>
            <p style={S.modalSub}>Définissez le point à soumettre au processus socratique.</p>
            <label style={S.label}>Titre du point *</label>
            <input value={pointTitle} onChange={e => setPointTitle(e.target.value)} placeholder="Ex: Budget prévisionnel 2025" style={S.input} autoFocus />
            <label style={S.label}>Description (optionnel)</label>
            <textarea value={pointDesc} onChange={e => setPointDesc(e.target.value)} placeholder="Détails supplémentaires..." rows={3} style={S.textarea} />
            <button onClick={addPoint} disabled={!pointTitle.trim()} style={{ ...S.btnPrimary, opacity: pointTitle.trim() ? 1 : 0.4 }}>Ajouter le point</button>
            <button onClick={() => setShowAddPoint(false)} style={S.btnSecondary}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HISTORIQUE VIEW ──────────────────────────────────────────────────────────
function HistoriqueView({ onBack }) {
  const sessions = Object.values(DB.sessions);
  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f0", fontFamily: "'DM Sans','Helvetica Neue',Arial,sans-serif" }}>
      <div style={S.nav}>
        <div style={S.navBrand} onClick={onBack}>
          <div style={S.navIcon}>👥</div>
          Socratic Consensus
        </div>
        <button onClick={onBack} style={S.navBtn}>← Accueil</button>
      </div>
      <div style={{ padding: "48px" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, margin: "0 0 32px" }}>Historique des sessions</h1>
        <div style={S.grid}>
          {sessions.map(s => (
            <div key={s.id} style={S.card}>
              <div style={S.cardTitle}>
                {s.name}
                <span style={S.badge}>Active</span>
              </div>
              {s.description && <p style={S.cardDesc}>{s.description}</p>}
              <p style={{ color: "#999", fontSize: 13 }}>{s.points?.length || 0} point(s) · {new Date(s.createdAt).toLocaleDateString("fr-FR")}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("home"); // home | session | historique | participant
  const [activeSession, setActiveSession] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showQRScan, setShowQRScan] = useState(false);
  const [sessions, setSessions] = useState(DB.sessions);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => { setSessions({ ...DB.sessions }); setTick(n => n + 1); }, 1000);
    return () => clearInterval(t);
  }, []);

  function createSession() {
    if (!newName.trim()) return;
    const id = uid();
    DB.sessions[id] = { id, name: newName, description: newDesc, status: "active", createdAt: Date.now(), points: [] };
    setSessions({ ...DB.sessions });
    setNewName(""); setNewDesc(""); setShowCreate(false);
    setActiveSession(id); setView("session");
  }

  function handleQRScan() {
    // FORMAT: SESSION:xxx:POINT:yyy
    const parts = qrInput.split(":");
    if (parts.length === 4 && parts[0] === "SESSION" && parts[2] === "POINT") {
      setParticipantData({ sessionId: parts[1], pointId: parts[3] });
      setView("participant"); setShowQRScan(false);
    }
  }

  if (view === "session") return <SessionView sessionId={activeSession} onBack={() => setView("home")} />;
  if (view === "historique") return <HistoriqueView onBack={() => setView("home")} />;
  if (view === "participant") return (
    <ParticipantView sessionId={participantData.sessionId} pointId={participantData.pointId} onDone={() => setView("home")} />
  );

  const sessionList = Object.values(sessions);

  return (
    <div style={S.page}>
      {/* Nav */}
      <div style={S.nav}>
        <div style={S.navBrand}>
          <div style={S.navIcon}>👥</div>
          Socratic Consensus
        </div>
        <div style={S.navActions}>
          <button onClick={() => setView("historique")} style={S.navBtn}>🕐 Historique</button>
          <button onClick={() => setView("historique")} style={S.navBtn}>🖥️ Administration</button>
          <button onClick={() => setShowQRScan(true)} style={{ ...S.navBtn, background: "#f0fdf4", borderColor: "#bbf7d0", color: "#16a34a" }}>📱 Participer (QR)</button>
        </div>
      </div>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.heroBg} />
        <div style={S.heroContent}>
          <h1 style={S.heroTitle}>
            Processus Socratique<br />
            <span style={{ color: "#555" }}>pour vos Assemblées<br />Générales</span>
          </h1>
          <p style={S.heroSub}>
            Identifiez les objections, proposez des amendements et atteignez le consensus grâce à un questionnement structuré en temps réel.
          </p>
          <button onClick={() => setShowCreate(true)} style={S.heroCta}>
            + Créer une session
          </button>
        </div>
      </div>

      {/* Sessions actives */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>Sessions actives</h2>
        <div style={S.grid}>
          {sessionList.map(s => {
            const totalObj = (s.points || []).reduce((acc, p) => acc + getResponses(s.id, p.id).filter(r => r.hasObjection).length, 0);
            return (
              <div key={s.id} style={S.card}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div style={S.cardTitle}>
                  <span>{s.name}</span>
                  <span style={S.badge}>Active</span>
                </div>
                {s.description && <p style={S.cardDesc}>{s.description}</p>}
                <div style={S.cardActions}>
                  <button onClick={() => { setActiveSession(s.id); setView("session"); }} style={S.cardBtn}>
                    Gérer →
                  </button>
                  <button onClick={() => { setActiveSession(s.id); setView("session"); }} style={S.cardBtnIcon} title="Mode affichage">🖥️</button>
                </div>
              </div>
            );
          })}
          {/* Add session card */}
          <div style={{ ...S.card, border: "2px dashed #e5e5e5", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 160, cursor: "pointer", color: "#999" }}
            onClick={() => setShowCreate(true)}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#111"; e.currentTarget.style.color = "#111"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e5e5e5"; e.currentTarget.style.color = "#999"; }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>+</div>
              <div style={{ fontWeight: 600 }}>Nouvelle session</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={S.section}>
        <h2 style={S.sectionTitle}>Comment ça fonctionne</h2>
        <div style={S.howGrid}>
          {[
            { num: "01", title: "Présentez le point", desc: "Créez une session et ajoutez les points à l'ordre du jour. Un QR code unique est généré pour chaque point." },
            { num: "02", title: "Collectez les réponses", desc: "Les participants scannent le QR code et répondent au questionnaire socratique pour exprimer leurs objections." },
            { num: "03", title: "Atteignez le consensus", desc: "Visualisez les objections en temps réel, traitez les amendements et procédez au vote final." },
          ].map(h => (
            <div key={h.num} style={S.howCard}>
              <div style={S.howNum}>{h.num}</div>
              <h3 style={S.howTitle}>{h.title}</h3>
              <p style={S.howDesc}>{h.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <span>Socratic Consensus - Faciliter le consentement en assemblée générale</span>
        <span>© 2026</span>
      </div>

      {/* Create session modal */}
      {showCreate && (
        <div style={S.overlay} onClick={() => setShowCreate(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Créer une session</h3>
            <p style={S.modalSub}>Configurez votre session d'assemblée générale.</p>
            <label style={S.label}>Nom de la session *</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Ex: AG annuelle 2026" style={S.input} autoFocus
              onKeyDown={e => e.key === "Enter" && createSession()} />
            <label style={S.label}>Description (optionnel)</label>
            <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description de la session..." rows={3} style={S.textarea} />
            <button onClick={createSession} disabled={!newName.trim()} style={{ ...S.btnPrimary, opacity: newName.trim() ? 1 : 0.4 }}>
              Créer la session
            </button>
            <button onClick={() => setShowCreate(false)} style={S.btnSecondary}>Annuler</button>
          </div>
        </div>
      )}

      {/* QR scan modal (simulated) */}
      {showQRScan && (
        <div style={S.overlay} onClick={() => setShowQRScan(false)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <h3 style={S.modalTitle}>Accès participant</h3>
            <p style={S.modalSub}>Collez le code affiché sous le QR code pour simuler le scan.</p>
            <label style={S.label}>Code QR</label>
            <input value={qrInput} onChange={e => setQrInput(e.target.value)}
              placeholder="SESSION:xxx:POINT:yyy" style={{ ...S.input, fontFamily: "monospace", fontSize: 13 }} />
            <button onClick={handleQRScan} style={S.btnPrimary}>Accéder au questionnaire</button>
            <button onClick={() => setShowQRScan(false)} style={S.btnSecondary}>Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
