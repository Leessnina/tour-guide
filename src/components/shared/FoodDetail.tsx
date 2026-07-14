import { useStore } from '../../store/useStore';
import { MEAL_LABELS, DAY_COLORS } from '../../types';

export default function FoodDetail() {
  const selectedFoodId = useStore((s) => s.selectedFoodId);
  const setSelectedFood = useStore((s) => s.setSelectedFood);
  const foodItems = useStore((s) => s.foodItems);
  const updateFoodItem = useStore((s) => s.updateFoodItem);

  const item = foodItems.find((f) => f.id === selectedFoodId);

  if (!item) return null;

  const mealInfo = item.mealTime ? MEAL_LABELS[item.mealTime] : null;
  const dayColor = item.day ? DAY_COLORS[item.day] : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={() => setSelectedFood(null)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full max-h-[85dvh] overflow-y-auto p-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setSelectedFood(null)}
          className="absolute top-3 right-3 text-stone-400 hover:text-stone-600 text-xl cursor-pointer w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        {/* Image */}
        {item.thumbnailDataUrl && (
          <img
            src={item.thumbnailDataUrl}
            alt=""
            className="w-full h-48 object-cover rounded-xl mb-4 border border-stone-100"
          />
        )}

        {/* Name */}
        <h3 className="text-xl font-bold text-stone-800 mb-1">
          {item.name || '未命名美食'}
        </h3>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-3">
          {item.day && (
            <span
              className="text-xs text-white px-2 py-0.5 rounded-full font-medium"
              style={{ backgroundColor: dayColor }}
            >
              Day {item.day}
            </span>
          )}
          {mealInfo && (
            <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
              {mealInfo.emoji} {mealInfo.label}
            </span>
          )}
          {item.aiParsed && (
            <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
              🤖 AI 识别
            </span>
          )}
        </div>

        {/* Address */}
        {item.address && (
          <div className="flex items-start gap-2 mb-3">
            <span className="text-stone-400 mt-0.5">📍</span>
            <span className="text-sm text-stone-600">{item.address}</span>
          </div>
        )}

        {/* Price */}
        {item.avgPrice && (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-stone-400">💰</span>
            <span className="text-sm text-stone-600">人均 ¥{item.avgPrice}</span>
          </div>
        )}

        {/* Recommended dishes */}
        {item.recommendedDishes.length > 0 && (
          <div className="mb-3">
            <div className="text-sm font-medium text-stone-500 mb-1">🍽️ 推荐菜</div>
            <div className="flex flex-wrap gap-1.5">
              {item.recommendedDishes.map((dish) => (
                <span
                  key={dish}
                  className="text-sm bg-orange-50 text-orange-600 px-2 py-1 rounded-lg"
                >
                  {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* AI Notes */}
        {item.notes && (
          <div className="mb-3 p-3 bg-stone-50 rounded-lg">
            <div className="text-xs font-medium text-stone-400 mb-1">🤖 AI 备注</div>
            <p className="text-sm text-stone-600">{item.notes}</p>
          </div>
        )}

        {/* User Supplement */}
        {item.userSupplement && (
          <div className="mb-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-xs font-medium text-amber-600 mb-1">✍️ 手动补充</div>
            <p className="text-sm text-amber-800">{item.userSupplement}</p>
          </div>
        )}

        {/* Remove from schedule button */}
        {item.day && (
          <button
            onClick={() =>
              updateFoodItem(item.id, {
                day: undefined,
                mealTime: undefined,
              })
            }
            className="text-xs text-stone-400 hover:text-red-500 cursor-pointer mt-2"
          >
            从行程中移除
          </button>
        )}
      </div>
    </div>
  );
}
