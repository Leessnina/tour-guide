import { useStore } from '../../store/useStore';
import DraggableFood from './DraggableFood';

export default function UnassignedPool() {
  const getUnassignedFoodItems = useStore((s) => s.getUnassignedFoodItems);

  const items = getUnassignedFoodItems();

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">📥</span>
        <span className="text-sm font-medium text-stone-600">待分配</span>
        <span className="text-xs bg-stone-100 text-stone-500 px-1.5 py-0.5 rounded-full">
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-stone-300 text-center py-6">
          暂无待分配的美食~
        </p>
      ) : (
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {items.map((item) => (
            <DraggableFood key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
