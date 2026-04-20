interface MetricCardProps {
  label: string;
  value: string;
  unit: string;
  icon: string;
  color: "amber" | "blue" | "emerald" | "rose" | "purple";
}

const colorMap = {
  amber: {
    bg: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
    text: "text-amber-400",
    glow: "shadow-amber-500/5",
    icon: "bg-amber-500/15 text-amber-400",
  },
  blue: {
    bg: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/20",
    text: "text-blue-400",
    glow: "shadow-blue-500/5",
    icon: "bg-blue-500/15 text-blue-400",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "shadow-emerald-500/5",
    icon: "bg-emerald-500/15 text-emerald-400",
  },
  rose: {
    bg: "from-rose-500/10 to-rose-600/5",
    border: "border-rose-500/20",
    text: "text-rose-400",
    glow: "shadow-rose-500/5",
    icon: "bg-rose-500/15 text-rose-400",
  },
  purple: {
    bg: "from-purple-500/10 to-purple-600/5",
    border: "border-purple-500/20",
    text: "text-purple-400",
    glow: "shadow-purple-500/5",
    icon: "bg-purple-500/15 text-purple-400",
  },
};

export default function MetricCard({ label, value, unit, icon, color }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <div
      className={`relative overflow-hidden rounded-xl border ${c.border} bg-gradient-to-br ${c.bg} p-5 shadow-lg ${c.glow} transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-gray-400 uppercase">
            {label}
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold tabular-nums ${c.text}`}>
              {value}
            </span>
            <span className="text-sm text-gray-400">{unit}</span>
          </div>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.icon} text-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
