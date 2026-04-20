export interface SimParams {
  vin: number;
  dutyCycle: number; // 0–1
  frequency: number; // Hz
  inductance: number; // H
  capacitance: number; // F
  resistance: number; // Ω
}

export interface SimResults {
  vout: number;
  deltaIL: number;
  iLAvg: number;
  iOut: number;
  deltaVout: number;
  // Per-component values
  iLMin: number;
  iLMax: number;
  vL_on: number;   // voltage across inductor during switch ON
  vL_off: number;  // voltage across inductor during switch OFF
  iDiode: number;  // average diode current
  pIn: number;     // input power
  pOut: number;    // output power
  pLoad: number;   // power dissipated in load
  efficiency: number; // ideal efficiency (always 100% in ideal, but shows the value)
  isCCM: boolean;
}

export function calculate(p: SimParams): SimResults {
  const D = p.dutyCycle;
  const vout = -p.vin * (D / (1 - D));
  const deltaIL = (p.vin * D) / (p.frequency * p.inductance);
  const iOut = Math.abs(vout) / p.resistance;
  const iLAvg = iOut / (1 - D);
  const deltaVout = (iOut * D) / (p.frequency * p.capacitance);

  const iLMin = iLAvg - deltaIL / 2;
  const iLMax = iLAvg + deltaIL / 2;
  const vL_on = p.vin;
  const vL_off = vout; // negative
  const iDiode = iOut; // average diode current = Iout in CCM
  const pOut = Math.abs(vout) * iOut;
  const pIn = p.vin * iLAvg * D;
  const pLoad = iOut * iOut * p.resistance;
  const efficiency = pIn > 0 ? (pOut / pIn) * 100 : 0;
  const isCCM = iLMin > 0;

  return {
    vout, deltaIL, iLAvg, iOut, deltaVout,
    iLMin, iLMax, vL_on, vL_off, iDiode,
    pIn, pOut, pLoad, efficiency, isCCM,
  };
}

export interface WaveformData {
  time: number[];
  inductorCurrent: number[];
  outputVoltage: number[];
}

export function generateWaveforms(
  p: SimParams,
  r: SimResults,
  numCycles = 3,
  points = 1000
): WaveformData {
  const tPeriod = 1 / p.frequency;
  const tOn = p.dutyCycle * tPeriod;
  const totalTime = numCycles * tPeriod;

  const time: number[] = [];
  const inductorCurrent: number[] = [];
  const outputVoltage: number[] = [];

  for (let i = 0; i < points; i++) {
    const t = (i / (points - 1)) * totalTime;
    const tMod = t % tPeriod;

    time.push(t * 1e6); // µs

    // Inductor current — triangle wave
    if (tMod < tOn) {
      inductorCurrent.push(
        r.iLAvg - r.deltaIL / 2 + (r.deltaIL / tOn) * tMod
      );
    } else {
      inductorCurrent.push(
        r.iLAvg +
          r.deltaIL / 2 -
          (r.deltaIL / (tPeriod - tOn)) * (tMod - tOn)
      );
    }

    // Output voltage — sawtooth ripple
    if (tMod < tOn) {
      outputVoltage.push(
        r.vout + r.deltaVout / 2 - (r.deltaVout / tOn) * tMod
      );
    } else {
      outputVoltage.push(
        r.vout -
          r.deltaVout / 2 +
          (r.deltaVout / (tPeriod - tOn)) * (tMod - tOn)
      );
    }
  }

  return { time, inductorCurrent, outputVoltage };
}
