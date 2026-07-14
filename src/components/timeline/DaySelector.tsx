import { useStore } from '../../store/useStore';

interface Props {
  activeDay: number;
  onSelectDay: (day: number) => void;
}

export default function DaySelector({ activeDay, onSelectDay }: Props) {
  const tripDays = useStore((s) => s.tripDays);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {tripDays.map((day) => (
        <button
          key={day.day}
          onClick={() => onSelectDay(day.day)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${
            activeDay === day.day
              ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
              : 'bg-white text-stone-600 border border-stone-200 hover:border-orange-300'
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
}
