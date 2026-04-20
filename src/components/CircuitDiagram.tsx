"use client";

import { useEffect, useState } from "react";
import type { SimParams, SimResults } from "@/lib/simulation";

interface CircuitDiagramProps {
  params: SimParams;
  results: SimResults;
}

/* ── tiny helpers ── */
const fmt = (v: number, d = 2) => {
  const r = Math.round(v * 10 ** d) / 10 ** d;
  return r.toFixed(d);
};
const fmtHz = (hz: number) =>
  hz >= 1000 ? `${fmt(hz / 1000, 1)}kHz` : `${fmt(hz, 0)}Hz`;

/* ── reusable SVG sub-components ── */
function Probe({
  x,
  y,
  label,
  value,
  unit,
  color,
  anchor = "start",
}: {
  x: number;
  y: number;
  label: string;
  value: string;
  unit: string;
  color: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <g>
      <rect
        x={anchor === "end" ? x - 82 : anchor === "middle" ? x - 41 : x}
        y={y - 14}
        width={82}
        height={30}
        rx={5}
        fill="rgba(0,0,0,0.55)"
        stroke={color}
        strokeWidth={1}
        opacity={0.9}
      />
      <text
        x={anchor === "end" ? x - 41 : anchor === "middle" ? x : x + 41}
        y={y}
        textAnchor="middle"
        fill="#9ca3af"
        fontSize={8}
        fontFamily="monospace"
      >
        {label}
      </text>
      <text
        x={anchor === "end" ? x - 41 : anchor === "middle" ? x : x + 41}
        y={y + 12}
        textAnchor="middle"
        fill={color}
        fontSize={11}
        fontWeight="bold"
        fontFamily="monospace"
      >
        {value} {unit}
      </text>
    </g>
  );
}

export default function CircuitDiagram({ params, results }: CircuitDiagramProps) {
  const [switchOn, setSwitchOn] = useState(true);

  const { vin, dutyCycle, frequency, inductance, capacitance, resistance } = params;
  const {
    vout, iLAvg, iOut, deltaIL, deltaVout,
    iLMin, iLMax, vL_on, vL_off, iDiode,
    pIn, pOut, pLoad, isCCM,
  } = results;

  // Display-friendly values (avoid floating point junk)
  const lDisp = Math.round(inductance * 1e6);
  const cDisp = Math.round(capacitance * 1e6);
  const rDisp = Math.round(resistance * 10) / 10;
  const dDisp = Math.round(dutyCycle * 100);

  // Auto-toggle switch ON/OFF based on duty cycle
  useEffect(() => {
    const scaledPeriod = Math.max(500, Math.min(2000, 1200));
    const onTime = scaledPeriod * dutyCycle;
    const offTime = scaledPeriod * (1 - dutyCycle);
    let timeout: ReturnType<typeof setTimeout>;
    let active = true;
    const toggle = (on: boolean) => {
      if (!active) return;
      setSwitchOn(on);
      timeout = setTimeout(() => toggle(!on), on ? onTime : offTime);
    };
    toggle(true);
    return () => { active = false; clearTimeout(timeout); };
  }, [dutyCycle, frequency]);

  const act = "#22d3ee";
  const dim = "#27303d";
  const sw = switchOn ? "#22c55e" : "#ef4444";

  // Current flow line thickness scales with iLAvg (1.5 → 4px)
  const flowW = Math.max(1.5, Math.min(4, 1.5 + iLAvg * 0.8));

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 shadow-lg">
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 text-xs">🔧</span>
          Circuit Topology — Live Data
        </h3>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200 ${
            switchOn
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}>
            <span className={`h-2 w-2 rounded-full ${switchOn ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            Switch {switchOn ? "ON" : "OFF"}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            isCCM
              ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
              : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
          }`}>
            {isCCM ? "CCM" : "DCM"}
          </span>
        </div>
      </div>

      <svg viewBox="0 0 780 420" className="w-full" style={{ maxHeight: 420 }}>
        <defs>
          <style>{`
            @keyframes flow { to { stroke-dashoffset: -24; } }
            @keyframes pulse-glow { 0%,100%{opacity:.55} 50%{opacity:1} }
            .cf { stroke-dasharray: 8 16; animation: flow .7s linear infinite; }
            .glow { animation: pulse-glow 1.4s ease-in-out infinite; }
          `}</style>
          <marker id="arr" viewBox="0 0 10 7" refX="9" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <polygon points="0 0,10 3.5,0 7" fill={act} />
          </marker>
          <marker id="arr-dim" viewBox="0 0 10 7" refX="9" refY="3.5" markerWidth="7" markerHeight="5" orient="auto-start-reverse">
            <polygon points="0 0,10 3.5,0 7" fill={dim} />
          </marker>
        </defs>

        {/* ═══════════ GND rail ═══════════ */}
        <line x1={50} y1={300} x2={700} y2={300} stroke="#3f4957" strokeWidth={2} strokeDasharray="6 4" />
        <text x={712} y={304} fill="#6b7280" fontSize={10} fontFamily="monospace">GND</text>
        {[75, 320, 640].map(x => (
          <g key={x} transform={`translate(${x},300)`}>
            <line x1={-6} y1={6} x2={6} y2={6} stroke="#6b7280" strokeWidth={1.5} />
            <line x1={-4} y1={10} x2={4} y2={10} stroke="#6b7280" strokeWidth={1} />
            <line x1={-2} y1={14} x2={2} y2={14} stroke="#6b7280" strokeWidth={.5} />
          </g>
        ))}

        {/* ═══════════ VIN SOURCE ═══════════ */}
        <rect x={46} y={110} width={58} height={90} rx={7} fill="rgba(245,158,11,0.06)" stroke="#f59e0b" strokeWidth={2} />
        <line x1={62} y1={138} x2={90} y2={138} stroke="#f59e0b" strokeWidth={3} />
        <line x1={68} y1={152} x2={84} y2={152} stroke="#f59e0b" strokeWidth={1.5} />
        <text x={75} y={100} textAnchor="middle" fill="#9ca3af" fontSize={10} fontFamily="monospace">Vin</text>
        <text x={75} y={186} textAnchor="middle" fill="#fbbf24" fontSize={14} fontWeight="bold" fontFamily="monospace">{fmt(vin,1)}V</text>
        {/* + / - */}
        <text x={38} y={130} fill="#22c55e" fontSize={13} fontWeight="bold">+</text>
        <text x={38} y={168} fill="#ef4444" fontSize={13} fontWeight="bold">−</text>
        {/* Wires */}
        <line x1={75} y1={110} x2={75} y2={65} stroke="#f59e0b" strokeWidth={2} />
        <line x1={75} y1={200} x2={75} y2={300} stroke="#f59e0b" strokeWidth={2} />

        {/* ═══════════ TOP RAIL → SWITCH ═══════════ */}
        <line x1={75} y1={65} x2={200} y2={65} stroke={switchOn ? act : dim} strokeWidth={flowW} className={switchOn ? "cf" : ""} />

        {/* ═══════════ SWITCH (MOSFET) ═══════════ */}
        <rect x={200} y={42} width={70} height={46} rx={7}
          fill={switchOn ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)"}
          stroke={sw} strokeWidth={2} className="transition-all duration-300" />
        <text x={235} y={62} textAnchor="middle" fill={sw} fontSize={11} fontWeight="bold" fontFamily="monospace">
          Q: {switchOn ? "ON" : "OFF"}
        </text>
        <text x={235} y={80} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="monospace">
          MOSFET
        </text>
        {/* PWM info */}
        <text x={235} y={35} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="monospace">
          PWM  D={dDisp}%  f={fmtHz(frequency)}
        </text>

        {/* Switch → junction */}
        <line x1={270} y1={65} x2={320} y2={65} stroke={switchOn ? act : dim} strokeWidth={flowW} className={switchOn ? "cf" : ""}/>
        {/* Junction node */}
        <circle cx={320} cy={65} r={4} fill={act} opacity={.8} />

        {/* ═══════════ INDUCTOR (vertical) ═══════════ */}
        <line x1={320} y1={65} x2={320} y2={110} stroke={act} strokeWidth={flowW} className="cf" />
        <path
          d="M320,110 Q342,120 320,130 Q298,140 320,150 Q342,160 320,170 Q298,180 320,190"
          fill="none" stroke="#818cf8" strokeWidth={2.5} strokeLinecap="round" />
        <line x1={320} y1={190} x2={320} y2={240} stroke={act} strokeWidth={flowW} className="cf" />
        <line x1={320} y1={240} x2={320} y2={300} stroke={act} strokeWidth={flowW} className="cf" />

        {/* L label + value */}
        <rect x={335} y={138} width={62} height={26} rx={4} fill="rgba(99,102,241,0.08)" stroke="rgba(99,102,241,0.25)" strokeWidth={1} />
        <text x={366} y={148} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="monospace">L</text>
        <text x={366} y={160} textAnchor="middle" fill="#a5b4fc" fontSize={11} fontWeight="bold" fontFamily="monospace">{lDisp}µH</text>

        {/* ── Inductor live probes ── */}
        {switchOn && (
          <Probe x={190} y={155} label="V_L (ON)" value={fmt(vL_on, 1)} unit="V" color="#818cf8" anchor="end" />
        )}
        {!switchOn && (
          <Probe x={190} y={155} label="V_L (OFF)" value={fmt(vL_off, 1)} unit="V" color="#c084fc" anchor="end" />
        )}

        {/* ═══════════ DIODE ═══════════ */}
        <line x1={320} y1={65} x2={450} y2={65}
          stroke={!switchOn ? act : dim} strokeWidth={flowW} className={!switchOn ? "cf" : ""} />
        {/* Diode triangle + bar */}
        <g transform="translate(460,45)">
          <polygon points="0,0 22,0 11,28"
            fill={!switchOn ? "rgba(34,211,238,0.12)" : "none"}
            stroke={!switchOn ? act : dim} strokeWidth={2} />
          <line x1={0} y1={28} x2={22} y2={28} stroke={!switchOn ? act : dim} strokeWidth={2.5} />
        </g>
        <text x={500} y={63} fill="#6b7280" fontSize={9} fontFamily="monospace">D</text>
        {/* Diode → output rail */}
        <line x1={471} y1={73} x2={471} y2={105}
          stroke={!switchOn ? act : dim} strokeWidth={flowW} className={!switchOn ? "cf" : ""} />

        {/* Diode probe */}
        {!switchOn && (
          <Probe x={505} y={48} label="I_D" value={fmt(iDiode, 2)} unit="A" color="#22d3ee" />
        )}

        {/* ═══════════ OUTPUT NODE RAIL (horizontal) ═══════════ */}
        <line x1={471} y1={105} x2={545} y2={105}
          stroke={!switchOn ? act : dim} strokeWidth={flowW - 0.5} className={!switchOn ? "cf" : ""} />
        <line x1={590} y1={105} x2={640} y2={105}
          stroke={!switchOn ? act : dim} strokeWidth={flowW - 0.5} className={!switchOn ? "cf" : ""} />

        {/* ═══════════ CAPACITOR ═══════════ */}
        <line x1={545} y1={80} x2={545} y2={130} stroke="#34d399" strokeWidth={2.5} />
        <line x1={555} y1={80} x2={555} y2={130} stroke="#34d399" strokeWidth={2.5} />
        {/* C down to GND */}
        <line x1={550} y1={130} x2={550} y2={300}
          stroke={!switchOn ? act : dim} strokeWidth={1.5} className={!switchOn ? "cf" : ""} />
        <line x1={550} y1={80} x2={550} y2={65}
          stroke={dim} strokeWidth={1} />

        {/* C label */}
        <rect x={525} y={135} width={55} height={22} rx={4} fill="rgba(52,211,153,0.08)" stroke="rgba(52,211,153,0.25)" strokeWidth={1} />
        <text x={552} y={144} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="monospace">C</text>
        <text x={552} y={153} textAnchor="middle" fill="#6ee7b7" fontSize={10} fontWeight="bold" fontFamily="monospace">{cDisp}µF</text>

        {/* − polarity at output top */}
        <text x={460} y={100} fill="#ef4444" fontSize={13} fontWeight="bold">−</text>

        {/* ═══════════ LOAD RESISTANCE ═══════════ */}
        <path
          d="M640,105 L640,135 L628,143 L652,151 L628,159 L652,167 L628,175 L652,183 L640,191 L640,220"
          fill="none" stroke="#fb923c" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {/* R down to GND */}
        <line x1={640} y1={220} x2={640} y2={300}
          stroke={!switchOn ? act : dim} strokeWidth={flowW - 0.5} className={!switchOn ? "cf" : ""} />
        {/* + polarity at bottom */}
        <text x={648} y={295} fill="#22c55e" fontSize={13} fontWeight="bold">+</text>

        {/* R label */}
        <rect x={654} y={147} width={52} height={26} rx={4} fill="rgba(251,146,60,0.08)" stroke="rgba(251,146,60,0.25)" strokeWidth={1} />
        <text x={680} y={157} textAnchor="middle" fill="#6b7280" fontSize={8} fontFamily="monospace">R</text>
        <text x={680} y={169} textAnchor="middle" fill="#fdba74" fontSize={11} fontWeight="bold" fontFamily="monospace">{rDisp}Ω</text>

        {/* GND return */}
        <line x1={320} y1={300} x2={640} y2={300}
          stroke={!switchOn ? act : dim} strokeWidth={flowW - 0.5} className={!switchOn ? "cf" : ""} />
        <line x1={75} y1={300} x2={320} y2={300} stroke="#3f4957" strokeWidth={2} />

        {/* ═══════════ CURRENT FLOW ARROWS ═══════════ */}
        {switchOn && (
          <g className="glow">
            <polyline points="110,65 195,65" fill="none" stroke={act} strokeWidth={2} markerEnd="url(#arr)" />
            <text x={145} y={57} fill={act} fontSize={8} fontFamily="monospace">I_L →</text>
            {/* Down through inductor */}
            <line x1={310} y1={108} x2={310} y2={195} stroke={act} strokeWidth={1.5} markerEnd="url(#arr)" opacity={.6} />
            <text x={275} y={228} fill={act} fontSize={8} fontFamily="monospace">↓ {fmt(iLAvg)}A</text>
          </g>
        )}
        {!switchOn && (
          <g className="glow">
            <polyline points="330,65 445,65" fill="none" stroke={act} strokeWidth={2} markerEnd="url(#arr)" />
            <text x={365} y={57} fill={act} fontSize={8} fontFamily="monospace">I_D →</text>
            <line x1={648} y1={115} x2={648} y2={210} stroke={act} strokeWidth={1.5} markerEnd="url(#arr)" opacity={.6} />
            <text x={660} y={200} fill={act} fontSize={8} fontFamily="monospace">↓</text>
            {/* Return path along GND */}
            <polyline points="625,308 340,308" fill="none" stroke={act} strokeWidth={1.5} markerEnd="url(#arr)" opacity={.5} />
            <text x={465} y={322} fill={act} fontSize={8} fontFamily="monospace">← return</text>
          </g>
        )}

        {/* ═══════════ LIVE DATA PROBES ═══════════ */}
        {/* Output Voltage */}
        <Probe x={590} y={235} label="Vout" value={fmt(vout, 2)} unit="V" color="#60a5fa" anchor="middle" />

        {/* Output voltage ripple */}
        <Probe x={590} y={272} label="ΔVout" value={fmt(deltaVout, 3)} unit="V" color="#34d399" anchor="middle" />

        {/* Load current */}
        <Probe x={700} y={200} label="I_out" value={fmt(iOut, 3)} unit="A" color="#fb923c" />

        {/* IL avg near inductor */}
        <Probe x={190} y={193} label="I_L avg" value={fmt(iLAvg, 3)} unit="A" color="#818cf8" anchor="end" />

        {/* IL min / max */}
        <Probe x={190} y={230} label="I_L min" value={fmt(iLMin, 3)} unit="A" color={isCCM ? "#22d3ee" : "#fbbf24"} anchor="end" />
        <Probe x={190} y={267} label="I_L max" value={fmt(iLMax, 3)} unit="A" color="#22d3ee" anchor="end" />

        {/* ═══════════ PHASE INFO BAR ═══════════ */}
        <rect x={20} y={340} width={740} height={68} rx={9}
          fill={switchOn ? "rgba(34,197,94,0.05)" : "rgba(239,68,68,0.05)"}
          stroke={switchOn ? "rgba(34,197,94,0.18)" : "rgba(239,68,68,0.18)"} strokeWidth={1} />

        <text x={390} y={362} textAnchor="middle"
          fill={switchOn ? "#86efac" : "#fca5a5"} fontSize={11} fontFamily="monospace">
          {switchOn
            ? `▶ ON:  Vin(${fmt(vin,1)}V) → Q → L(${lDisp}µH) → GND  |  Energy stored in inductor`
            : `▶ OFF:  L → D → C(${cDisp}µF) ∥ R(${rDisp}Ω) → GND  |  Energy delivered to load`}
        </text>

        {/* Power info */}
        <text x={390} y={382} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">
          P_in = {fmt(pIn, 2)} W    P_out = {fmt(pOut, 2)} W    P_load = {fmt(pLoad, 2)} W    ΔI_L = {fmt(deltaIL, 3)} A
        </text>

        {/* ΔIL ripple */}
        <text x={390} y={398} textAnchor="middle" fill="#6b7280" fontSize={9} fontFamily="monospace">
          I_L: {fmt(iLMin, 3)}A → {fmt(iLMax, 3)}A    |    Vout = {fmt(vout, 2)} V    |    f = {fmtHz(frequency)}    |    D = {dDisp}%
        </text>
      </svg>
    </div>
  );
}
