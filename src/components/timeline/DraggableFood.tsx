import type { FoodItem } from '../../types';
import { useStore } from '../../store/useStore';

interface Props {
  item: FoodItem;
  compact?: boolean;
  onDragStart?: () => void;
}

export default function DraggableFood({ item, compact = false, onDragStart }: Props) {
  const setSelectedFood = useStore((s) => s.setSelectedFood);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  if (compact) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => setSelectedFood(item.id)}
        className="bg-white rounded-lg border border-stone-200 p-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-orange-300 hover:shadow transition-all text-sm"
      >
        <div className="flex items-center gap-2">
          {item.thumbnailDataUrl && (
            <img
              src={item.thumbnailDataUrl}
              alt=""
              className="w-8 h-8 object-cover rounded"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-stone-700 truncate text-sm">
              {item.name || '未命名'}
            </div>
            {item.recommendedDishes.length > 0 && (
              <div className="text-xs text-stone-400 truncate">
                {item.recommendedDishes.slice(0, 2).join('、')}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => setSelectedFood(item.id)}
      className="bg-white rounded-xl border border-stone-200 p-3 shadow-sm cursor-grab active:cursor-grabbing hover:border-orange-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-3">
        {item.thumbnailDataUrl && (
          <img
            src={item.thumbnailDataUrl}
            alt=""
            className="w-14 h-14 object-cover rounded-lg border border-stone-100 flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-800">{item.name || '未命名美食'}</div>
          {item.address && (
            <div className="text-xs text-stone-400 mt-0.5 truncate">📍 {item.address}</div>
          )}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.recommendedDishes.slice(0, 3).map((dish) => (
              <span
                key={dish}
                className="text-xs bg-orange-50 text-orange-600 px-1.5 py-0.5 rounded"
              >
                {dish}
              </span>
            ))}
            {item.recommendedDishes.length > 3 && (
              <span className="text-xs text-stone-400">
                +{item.recommendedDishes.length - 3}
              </span>
            )}
          </div>
          {/* Show user supplement indicator */}
          {item.userSupplement && (
            <div className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <span>✍️</span>
              <span className="truncate">{item.userSupplement}</span>
            </div>
          )}
        </div>
        {item.avgPrice && (
          <div className="text-xs text-stone-400 whitespace-nowrap">
            ￥{item.avgPrice}/人
          </div>
        )}
      </div>
    </div>
  );
}
