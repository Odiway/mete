interface SliderProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  icon?: string;
}

export default function ParamSlider({
  label,
  unit,
  value,
  min,
  max,
  step,
  onChange,
  icon,
}: SliderProps) {
  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
          {icon && <span className="text-base">{icon}</span>}
          {label}
        </label>
        <span className="text-sm font-mono font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
          {value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full cursor-pointer"
      />
      <div className="flex justify-between text-[10px] text-gray-500 mt-0.5 px-0.5">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
