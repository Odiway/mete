"use client";

import { useMemo, useState } from "react";
import ParamSlider from "@/components/ParamSlider";
import MetricCard from "@/components/MetricCard";
import PlotlyChart from "@/components/PlotlyChart";
import CircuitDiagram from "@/components/CircuitDiagram";
import { calculate, generateWaveforms } from "@/lib/simulation";

export default function Simulator() {
  const [vin, setVin] = useState(12);
  const [dutyPct, setDutyPct] = useState(50);
  const [fKhz, setFKhz] = useState(20);
  const [lUh, setLUh] = useState(100);
  const [cUf, setCUf] = useState(100);
  const [resistance, setResistance] = useState(10);

  const params = useMemo(
    () => ({
      vin,
      dutyCycle: dutyPct / 100,
      frequency: fKhz * 1000,
      inductance: lUh * 1e-6,
      capacitance: cUf * 1e-6,
      resistance,
    }),
    [vin, dutyPct, fKhz, lUh, cUf, resistance]
  );

  const results = useMemo(() => calculate(params), [params]);
  const waveforms = useMemo(
    () => generateWaveforms(params, results),
    [params, results]
  );

  const plotLayout = (title: string, yLabel: string): Partial<Plotly.Layout> => ({
    title: {
      text: title,
      font: { color: "#e5e7eb", size: 15 },
    },
    paper_bgcolor: "transparent",
    plot_bgcolor: "rgba(17,24,39,0.6)",
    font: { color: "#9ca3af", family: "var(--font-geist-sans), system-ui, sans-serif" },
    xaxis: {
      title: { text: "Time (µs)", font: { size: 12, color: "#6b7280" } },
      gridcolor: "rgba(55,65,81,0.5)",
      zerolinecolor: "rgba(75,85,99,0.5)",
      tickfont: { size: 11 },
    },
    yaxis: {
      title: { text: yLabel, font: { size: 12, color: "#6b7280" } },
      gridcolor: "rgba(55,65,81,0.5)",
      zerolinecolor: "rgba(75,85,99,0.5)",
      tickfont: { size: 11 },
    },
    margin: { t: 50, r: 20, b: 50, l: 60 },
    hovermode: "x unified" as const,
    hoverlabel: { bgcolor: "#1f2937", bordercolor: "#374151", font: { color: "#e5e7eb" } },
  });

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className="w-80 shrink-0 border-r border-gray-800 bg-gray-900/70 backdrop-blur-lg p-6 flex flex-col gap-6 overflow-y-auto">
        <div>
          <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400 text-sm">
              ⚙
            </span>
            Circuit Parameters
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Adjust sliders to update in real-time
          </p>
        </div>

        <div className="space-y-5">
          <ParamSlider
            label="Input Voltage (Vin)"
            unit="V"
            value={vin}
            min={5}
            max={24}
            step={0.5}
            onChange={setVin}
            icon="⚡"
          />
          <ParamSlider
            label="Duty Cycle (D)"
            unit="%"
            value={dutyPct}
            min={10}
            max={90}
            step={1}
            onChange={setDutyPct}
            icon="⏱"
          />
          <ParamSlider
            label="Frequency (f)"
            unit="kHz"
            value={fKhz}
            min={10}
            max={100}
            step={1}
            onChange={setFKhz}
            icon="〜"
          />

          <div className="border-t border-gray-800 pt-4">
            <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-3">
              Passive Components
            </p>
            <div className="space-y-5">
              <ParamSlider
                label="Inductor (L)"
                unit="µH"
                value={lUh}
                min={10}
                max={500}
                step={10}
                onChange={setLUh}
                icon="🔌"
              />
              <ParamSlider
                label="Capacitor (C)"
                unit="µF"
                value={cUf}
                min={10}
                max={500}
                step={10}
                onChange={setCUf}
                icon="🔋"
              />
              <ParamSlider
                label="Load Resistance (R)"
                unit="Ω"
                value={resistance}
                min={5}
                max={50}
                step={1}
                onChange={setResistance}
                icon="Ω"
              />
            </div>
          </div>
        </div>

        {/* Formula reference */}
        <div className="mt-auto border-t border-gray-800 pt-4">
          <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">
            Key Formula
          </p>
          <div className="rounded-lg bg-gray-800/60 px-3 py-2 font-mono text-xs text-gray-300">
            V<sub>out</sub> = −V<sub>in</sub> × D / (1 − D)
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-50 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg shadow-lg shadow-blue-500/20">
              ⚡
            </span>
            Inverting Buck-Boost Converter
          </h1>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            PWM-controlled DC-DC converter that can step up or step down the
            input voltage while producing an inverted (negative) output.
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Output Voltage"
            value={results.vout.toFixed(2)}
            unit="V"
            icon="⚡"
            color="amber"
          />
          <MetricCard
            label="Inductor Ripple"
            value={results.deltaIL.toFixed(3)}
            unit="A"
            icon="〜"
            color="blue"
          />
          <MetricCard
            label="Voltage Ripple"
            value={results.deltaVout.toFixed(3)}
            unit="V"
            icon="📊"
            color="emerald"
          />
          <MetricCard
            label="Average IL"
            value={results.iLAvg.toFixed(3)}
            unit="A"
            icon="📈"
            color="purple"
          />
        </div>

        {/* Circuit Diagram */}
        <CircuitDiagram
          vin={vin}
          vout={results.vout}
          dutyCycle={params.dutyCycle}
          frequency={params.frequency}
          inductance={params.inductance}
          capacitance={params.capacitance}
          resistance={resistance}
          iLAvg={results.iLAvg}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Inductor Current */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 shadow-lg">
            <PlotlyChart
              data={[
                {
                  x: waveforms.time,
                  y: waveforms.inductorCurrent,
                  type: "scatter",
                  mode: "lines",
                  name: "IL (A)",
                  line: { color: "#f59e0b", width: 2.5, shape: "linear" },
                  fill: "tozeroy",
                  fillcolor: "rgba(245,158,11,0.08)",
                },
              ]}
              layout={plotLayout("Inductor Current (I_L)", "Current (A)")}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: "100%", height: 340 }}
            />
          </div>

          {/* Output Voltage */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 shadow-lg">
            <PlotlyChart
              data={[
                {
                  x: waveforms.time,
                  y: waveforms.outputVoltage,
                  type: "scatter",
                  mode: "lines",
                  name: "Vout (V)",
                  line: { color: "#3b82f6", width: 2.5, shape: "linear" },
                  fill: "tozeroy",
                  fillcolor: "rgba(59,130,246,0.08)",
                },
              ]}
              layout={plotLayout("Output Voltage Ripple (V_out)", "Voltage (V)")}
              config={{ displayModeBar: false, responsive: true }}
              useResizeHandler
              style={{ width: "100%", height: 340 }}
            />
          </div>
        </div>

        {/* CCM / DCM indicator */}
        <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-4 flex items-center gap-4">
          {results.iLAvg - results.deltaIL / 2 > 0 ? (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-bold">
                ✓
              </span>
              <div>
                <p className="text-sm font-medium text-emerald-400">
                  Continuous Conduction Mode (CCM)
                </p>
                <p className="text-xs text-gray-500">
                  Inductor current never reaches zero — I<sub>L,min</sub> ={" "}
                  {(results.iLAvg - results.deltaIL / 2).toFixed(3)} A
                </p>
              </div>
            </>
          ) : (
            <>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/15 text-amber-400 text-sm font-bold">
                !
              </span>
              <div>
                <p className="text-sm font-medium text-amber-400">
                  Discontinuous Conduction Mode (DCM)
                </p>
                <p className="text-xs text-gray-500">
                  Inductor current drops to zero — consider increasing L or
                  decreasing R
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
