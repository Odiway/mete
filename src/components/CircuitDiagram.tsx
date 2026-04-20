"use client";

import { useEffect, useState } from "react";

interface CircuitDiagramProps {
  vin: number;
  vout: number;
  dutyCycle: number;
  frequency: number;
  inductance: number;
  capacitance: number;
  resistance: number;
  iLAvg: number;
}

export default function CircuitDiagram({
  vin,
  vout,
  dutyCycle,
  frequency,
  inductance,
  capacitance,
  resistance,
  iLAvg,
}: CircuitDiagramProps) {
  const [switchOn, setSwitchOn] = useState(true);

  // Auto-toggle switch based on duty cycle and frequency
  useEffect(() => {
    const period = 1000 / (frequency / 1000); // ms per cycle, slowed for visual
    const scaledPeriod = Math.max(400, Math.min(2000, period * 50));
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
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [dutyCycle, frequency]);

  // Current flow paths
  // Switch ON:  Vin+ → Switch → Inductor → GND (energy stored in L)
  // Switch OFF: Inductor → Diode → Capacitor/Load → GND → Inductor (energy delivered)

  const activeColor = "#22d3ee"; // cyan
  const dimColor = "#374151";
  const switchColor = switchOn ? "#22c55e" : "#ef4444";
  const switchLabel = switchOn ? "ON" : "OFF";

  // Animated dash for current flow
  const flowAnim = "flow 0.8s linear infinite";

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-400 text-xs">
            🔧
          </span>
          Circuit Topology
        </h3>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              switchOn
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-red-500/15 text-red-400 border border-red-500/30"
            } transition-all duration-200`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                switchOn ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            Switch {switchLabel}
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 720 340"
        className="w-full"
        style={{ maxHeight: 340 }}
      >
        <defs>
          {/* Animated dash pattern for current flow */}
          <style>{`
            @keyframes flow {
              to { stroke-dashoffset: -24; }
            }
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.6; }
              50% { opacity: 1; }
            }
            .current-flow {
              stroke-dasharray: 8 16;
              animation: ${flowAnim};
            }
            .glow {
              animation: pulse-glow 1.5s ease-in-out infinite;
            }
          `}</style>

          {/* Arrow marker */}
          <marker
            id="arrow-active"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={activeColor} />
          </marker>
          <marker
            id="arrow-dim"
            viewBox="0 0 10 7"
            refX="9"
            refY="3.5"
            markerWidth="8"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill={dimColor} />
          </marker>

          {/* Component glow filter */}
          <filter id="comp-glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ═══════════════ GROUND LINE ═══════════════ */}
        <line
          x1={60}
          y1={260}
          x2={660}
          y2={260}
          stroke="#4b5563"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
        <text x={670} y={264} fill="#6b7280" fontSize={11} fontFamily="monospace">
          GND
        </text>

        {/* ═══════════════ VIN SOURCE ═══════════════ */}
        {/* Battery symbol */}
        <rect
          x={50}
          y={90}
          width={50}
          height={80}
          rx={6}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={2}
          opacity={0.8}
        />
        <line x1={62} y1={118} x2={88} y2={118} stroke="#f59e0b" strokeWidth={3} />
        <line x1={67} y1={132} x2={83} y2={132} stroke="#f59e0b" strokeWidth={1.5} />
        <text
          x={75}
          y={158}
          textAnchor="middle"
          fill="#fbbf24"
          fontSize={13}
          fontWeight="bold"
          fontFamily="monospace"
        >
          {vin}V
        </text>
        <text
          x={75}
          y={80}
          textAnchor="middle"
          fill="#9ca3af"
          fontSize={10}
          fontFamily="monospace"
        >
          Vin
        </text>

        {/* Vin+ wire up */}
        <line x1={75} y1={90} x2={75} y2={50} stroke="#f59e0b" strokeWidth={2} />
        {/* Top rail from Vin to Switch */}
        <line
          x1={75}
          y1={50}
          x2={200}
          y2={50}
          stroke={switchOn ? activeColor : dimColor}
          strokeWidth={2.5}
          className={switchOn ? "current-flow" : ""}
        />

        {/* ═══════════════ SWITCH (MOSFET) ═══════════════ */}
        <rect
          x={190}
          y={30}
          width={60}
          height={40}
          rx={6}
          fill={switchOn ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)"}
          stroke={switchColor}
          strokeWidth={2}
          className="transition-all duration-300"
        />
        <text
          x={220}
          y={55}
          textAnchor="middle"
          fill={switchColor}
          fontSize={12}
          fontWeight="bold"
          fontFamily="monospace"
        >
          S: {switchLabel}
        </text>
        {/* PWM label */}
        <text
          x={220}
          y={23}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={9}
          fontFamily="monospace"
        >
          PWM D={dutyCycle * 100}%
        </text>

        {/* Switch to inductor junction */}
        <line
          x1={250}
          y1={50}
          x2={300}
          y2={50}
          stroke={switchOn ? activeColor : dimColor}
          strokeWidth={2.5}
          className={switchOn ? "current-flow" : ""}
        />

        {/* Junction point (node A) */}
        <circle cx={300} cy={50} r={4} fill={activeColor} opacity={0.8} />

        {/* ═══════════════ INDUCTOR ═══════════════ */}
        {/* Inductor from junction down */}
        <line
          x1={300}
          y1={50}
          x2={300}
          y2={100}
          stroke={activeColor}
          strokeWidth={2.5}
          className="current-flow"
        />
        {/* Inductor coil symbol */}
        <g transform="translate(300, 100)">
          <path
            d="M 0,0 C 15,-20 15,0 0,0 C 15,0 15,20 0,20 C 15,0 15,20 0,20 C 15,20 15,40 0,40 C 15,20 15,40 0,40 C 15,40 15,60 0,60"
            fill="none"
            stroke="#818cf8"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
          {/* Better coil representation */}
        </g>
        {/* Simplified inductor — zigzag */}
        <path
          d={`M 300,100 
              Q 320,110 300,120 
              Q 280,130 300,140 
              Q 320,150 300,160 
              Q 280,170 300,180`}
          fill="none"
          stroke="#818cf8"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        <rect
          x={310}
          y={125}
          width={55}
          height={22}
          rx={4}
          fill="rgba(99,102,241,0.1)"
          stroke="rgba(99,102,241,0.3)"
          strokeWidth={1}
        />
        <text
          x={337}
          y={140}
          textAnchor="middle"
          fill="#a5b4fc"
          fontSize={11}
          fontFamily="monospace"
        >
          {inductance * 1e6}µH
        </text>
        <text
          x={260}
          y={145}
          textAnchor="end"
          fill="#6b7280"
          fontSize={9}
          fontFamily="monospace"
        >
          L
        </text>

        {/* Inductor to bottom junction */}
        <line
          x1={300}
          y1={180}
          x2={300}
          y2={260}
          stroke={activeColor}
          strokeWidth={2.5}
          className="current-flow"
        />

        {/* ═══════════════ DIODE ═══════════════ */}
        {/* From junction (top) going right to diode */}
        <line
          x1={300}
          y1={50}
          x2={420}
          y2={50}
          stroke={!switchOn ? activeColor : dimColor}
          strokeWidth={2.5}
          className={!switchOn ? "current-flow" : ""}
        />

        {/* Diode symbol at (420, 50) pointing down */}
        <g transform="translate(440, 30)">
          {/* Triangle */}
          <polygon
            points="0,0 20,0 10,25"
            fill={!switchOn ? "rgba(34,211,238,0.15)" : "none"}
            stroke={!switchOn ? activeColor : dimColor}
            strokeWidth={2}
          />
          {/* Bar */}
          <line
            x1={0}
            y1={25}
            x2={20}
            y2={25}
            stroke={!switchOn ? activeColor : dimColor}
            strokeWidth={2.5}
          />
        </g>
        <text
          x={475}
          y={48}
          fill="#6b7280"
          fontSize={9}
          fontFamily="monospace"
        >
          D
        </text>

        {/* Diode down to capacitor/load rail */}
        <line
          x1={450}
          y1={55}
          x2={450}
          y2={80}
          stroke={!switchOn ? activeColor : dimColor}
          strokeWidth={2.5}
          className={!switchOn ? "current-flow" : ""}
        />

        {/* ═══════════════ CAPACITOR ═══════════════ */}
        {/* Horizontal to cap */}
        <line
          x1={450}
          y1={80}
          x2={520}
          y2={80}
          stroke={!switchOn ? activeColor : dimColor}
          strokeWidth={2}
          className={!switchOn ? "current-flow" : ""}
        />

        {/* Capacitor symbol */}
        <line x1={520} y1={65} x2={520} y2={95} stroke="#34d399" strokeWidth={2.5} />
        <line x1={530} y1={65} x2={530} y2={95} stroke="#34d399" strokeWidth={2.5} />
        <rect
          x={505}
          y={98}
          width={60}
          height={18}
          rx={3}
          fill="rgba(52,211,153,0.1)"
          stroke="rgba(52,211,153,0.3)"
          strokeWidth={1}
        />
        <text
          x={535}
          y={112}
          textAnchor="middle"
          fill="#6ee7b7"
          fontSize={10}
          fontFamily="monospace"
        >
          {capacitance * 1e6}µF
        </text>
        <text
          x={525}
          y={58}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={9}
          fontFamily="monospace"
        >
          C
        </text>

        {/* ═══════════════ LOAD RESISTANCE ═══════════════ */}
        {/* From cap to load */}
        <line
          x1={530}
          y1={80}
          x2={610}
          y2={80}
          stroke={!switchOn ? activeColor : dimColor}
          strokeWidth={2}
          className={!switchOn ? "current-flow" : ""}
        />

        {/* Resistor zigzag */}
        <path
          d={`M 610,80 L 610,120 
              L 600,128 L 620,136 L 600,144 L 620,152 L 600,160 L 620,168 
              L 610,176 L 610,200`}
          fill="none"
          stroke="#fb923c"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x={622}
          y={130}
          width={48}
          height={22}
          rx={4}
          fill="rgba(251,146,60,0.1)"
          stroke="rgba(251,146,60,0.3)"
          strokeWidth={1}
        />
        <text
          x={646}
          y={145}
          textAnchor="middle"
          fill="#fdba74"
          fontSize={11}
          fontFamily="monospace"
        >
          {resistance}Ω
        </text>
        <text
          x={595}
          y={150}
          textAnchor="end"
          fill="#6b7280"
          fontSize={9}
          fontFamily="monospace"
        >
          R
        </text>

        {/* Load to GND */}
        <line
          x1={610}
          y1={200}
          x2={610}
          y2={260}
          stroke={!switchOn ? activeColor : dimColor}
          strokeWidth={2}
          className={!switchOn ? "current-flow" : ""}
        />

        {/* Bottom rail */}
        <line
          x1={75}
          y1={260}
          x2={300}
          y2={260}
          stroke="#4b5563"
          strokeWidth={2}
        />
        <line
          x1={300}
          y1={260}
          x2={610}
          y2={260}
          stroke={!switchOn ? activeColor : dimColor}
          strokeWidth={2}
          className={!switchOn ? "current-flow" : ""}
        />

        {/* Vin- wire down */}
        <line x1={75} y1={170} x2={75} y2={260} stroke="#f59e0b" strokeWidth={2} />

        {/* ═══════════════ CURRENT ARROWS ═══════════════ */}
        {switchOn && (
          <g className="glow">
            {/* ON path: Vin+ → Switch → Junction → Inductor → GND */}
            <polyline
              points="110,50 185,50"
              fill="none"
              stroke={activeColor}
              strokeWidth={2}
              markerEnd="url(#arrow-active)"
            />
            <text x={140} y={42} fill={activeColor} fontSize={9} fontFamily="monospace">
              I_L →
            </text>
            {/* Down through inductor */}
            <line
              x1={290}
              y1={95}
              x2={290}
              y2={185}
              stroke={activeColor}
              strokeWidth={1.5}
              markerEnd="url(#arrow-active)"
              opacity={0.7}
            />
            <text x={250} y={215} fill={activeColor} fontSize={9} fontFamily="monospace">
              ↓ {iLAvg.toFixed(2)}A
            </text>
          </g>
        )}

        {!switchOn && (
          <g className="glow">
            {/* OFF path: L → through diode → C/R → GND → back */}
            <polyline
              points="310,50 420,50"
              fill="none"
              stroke={activeColor}
              strokeWidth={2}
              markerEnd="url(#arrow-active)"
            />
            <text x={340} y={42} fill={activeColor} fontSize={9} fontFamily="monospace">
              I_D →
            </text>
            {/* Through load */}
            <line
              x1={618}
              y1={90}
              x2={618}
              y2={190}
              stroke={activeColor}
              strokeWidth={1.5}
              markerEnd="url(#arrow-active)"
              opacity={0.7}
            />
            <text x={635} y={175} fill={activeColor} fontSize={9} fontFamily="monospace">
              ↓
            </text>
          </g>
        )}

        {/* ═══════════════ OUTPUT VOLTAGE LABEL ═══════════════ */}
        <rect
          x={480}
          y={210}
          width={100}
          height={30}
          rx={6}
          fill="rgba(59,130,246,0.1)"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth={1.5}
        />
        <text
          x={530}
          y={218}
          textAnchor="middle"
          fill="#6b7280"
          fontSize={9}
          fontFamily="monospace"
        >
          Vout
        </text>
        <text
          x={530}
          y={234}
          textAnchor="middle"
          fill="#60a5fa"
          fontSize={13}
          fontWeight="bold"
          fontFamily="monospace"
        >
          {vout.toFixed(1)}V
        </text>

        {/* +/- polarity markers on output */}
        <text x={456} y={76} fill="#ef4444" fontSize={14} fontWeight="bold">
          −
        </text>
        <text x={608} y={258} fill="#22c55e" fontSize={14} fontWeight="bold">
          +
        </text>

        {/* ═══════════════ PHASE DESCRIPTION ═══════════════ */}
        <rect
          x={15}
          y={290}
          width={690}
          height={40}
          rx={8}
          fill={
            switchOn
              ? "rgba(34,197,94,0.06)"
              : "rgba(239,68,68,0.06)"
          }
          stroke={switchOn ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}
          strokeWidth={1}
        />
        <text
          x={360}
          y={316}
          textAnchor="middle"
          fill={switchOn ? "#86efac" : "#fca5a5"}
          fontSize={11}
          fontFamily="monospace"
        >
          {switchOn
            ? "▶ Switch ON: Vin → Switch → Inductor → GND   |   Energy stored in inductor (L charging)"
            : "▶ Switch OFF: Inductor → Diode → C ∥ R → GND   |   Energy delivered to load (L discharging)"}
        </text>

        {/* Ground symbol nodes */}
        {[75, 300, 610].map((x) => (
          <g key={x} transform={`translate(${x}, 260)`}>
            <line x1={-6} y1={6} x2={6} y2={6} stroke="#6b7280" strokeWidth={1.5} />
            <line x1={-4} y1={10} x2={4} y2={10} stroke="#6b7280" strokeWidth={1} />
            <line x1={-2} y1={14} x2={2} y2={14} stroke="#6b7280" strokeWidth={0.5} />
          </g>
        ))}
      </svg>
    </div>
  );
}
