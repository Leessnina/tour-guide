import { DAY_COLORS } from '../../types';

interface Props {
  visibleDays: Set<number>;
  onToggleDay: (day: number) => void;
  countsByDay: Record<number, number>;
}

export default function MapFilter({ visibleDays, onToggleDay, countsByDay }: Props) {
  return (
    <div className="absolute top-2 left-2 z-10 bg-white/95 backdrop-blur rounded-xl shadow-lg p-3 min-w-[140px]">
      <div className="text-xs font-medium text-stone-500 mb-2">图例筛选</div>
      {[1, 2, 3, 4].map((day) => (
        <button
          key={day}
          onClick={() => onToggleDay(day)}
          className={`flex items-center gap-2 w-full px-2 py-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
            visibleDays.has(day)
              ? 'bg-stone-50 text-stone-700'
              : 'opacity-40 text-stone-400'
          }`}
        >
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: DAY_COLORS[day] }}
          />
          <span className="flex-1 text-left">Day {day}</span>
          <span className="text-stone-400 tabular-nums">
            {countsByDay[day] || 0}
          </span>
        </button>
      ))}
    </div>
  );
}
