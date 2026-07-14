import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { FoodItem, MealTime } from '../../types';
import { MEAL_LABELS } from '../../types';
import DraggableFood from './DraggableFood';

interface Props {
  day: number;
  mealTime: MealTime;
}

export default function MealSlot({ day, mealTime }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);
  const getFoodItemsForSlot = useStore((s) => s.getFoodItemsForSlot);
  const updateFoodItem = useStore((s) => s.updateFoodItem);

  const items = getFoodItemsForSlot(day, mealTime);
  const { label, emoji } = MEAL_LABELS[mealTime];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const foodId = e.dataTransfer.getData('text/plain');
    if (foodId) {
      updateFoodItem(foodId, { day: day as FoodItem['day'], mealTime });
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border-2 border-dashed p-3 min-h-[80px] transition-all ${
        isDragOver
          ? 'border-orange-400 bg-orange-50 drop-zone-active'
          : 'border-stone-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{emoji}</span>
        <span className="text-xs font-medium text-stone-500">{label}</span>
        {items.length > 0 && (
          <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
            {items.length}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-stone-300 text-center py-4">
          拖拽美食卡片到这里
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <DraggableFood key={item.id} item={item} compact />
          ))}
        </div>
      )}
    </div>
  );
}
