import { useState } from 'react';
import DaySelector from './DaySelector';
import MealSlot from './MealSlot';
import UnassignedPool from './UnassignedPool';
import ExportButton from '../shared/ExportButton';
import type { MealTime } from '../../types';

const MEAL_TIMES: MealTime[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function Timeline() {
  const [activeDay, setActiveDay] = useState(1);

  return (
    <div id="timeline-export-area">
      {/* Day selector */}
      <div className="mb-4">
        <DaySelector activeDay={activeDay} onSelectDay={setActiveDay} />
      </div>

      {/* Meal slots */}
      <div className="space-y-3 mb-4">
        {MEAL_TIMES.map((mealTime) => (
          <MealSlot key={mealTime} day={activeDay} mealTime={mealTime} />
        ))}
      </div>

      {/* Unassigned pool */}
      <UnassignedPool />

      {/* Export button */}
      <div className="mt-6 flex justify-center">
        <ExportButton />
      </div>
    </div>
  );
}
