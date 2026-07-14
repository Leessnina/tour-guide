import { useState } from 'react';
import { useStore } from '../../store/useStore';
import type { FoodItem } from '../../types';

interface Props {
  item: FoodItem;
}

export default function FoodCard({ item }: Props) {
  const updateFoodItem = useStore((s) => s.updateFoodItem);
  const removeFoodItem = useStore((s) => s.removeFoodItem);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dishInput, setDishInput] = useState('');

  const handleUpdate = (field: keyof FoodItem, value: any) => {
    updateFoodItem(item.id, { [field]: value });
  };

  const addDish = () => {
    const dish = dishInput.trim();
    if (dish && !item.recommendedDishes.includes(dish)) {
      handleUpdate('recommendedDishes', [...item.recommendedDishes, dish]);
    }
    setDishInput('');
  };

  const removeDish = (dish: string) => {
    handleUpdate(
      'recommendedDishes',
      item.recommendedDishes.filter((d) => d !== dish)
    );
  };

  const dayOptions = [
    { value: undefined, label: '未分配' },
    { value: 1, label: 'Day1 顺德' },
    { value: 2, label: 'Day2 澳门' },
    { value: 3, label: 'Day3 珠海' },
    { value: 4, label: 'Day4 返程' },
  ];

  const mealOptions = [
    { value: undefined, label: '未定' },
    { value: 'breakfast', label: '🌅 早餐' },
    { value: 'lunch', label: '☀️ 午餐' },
    { value: 'dinner', label: '🌙 晚餐' },
    { value: 'snack', label: '🍢 小吃' },
  ];

  return (
    <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-stone-50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {item.thumbnailDataUrl && (
          <img
            src={item.thumbnailDataUrl}
            alt=""
            className="w-12 h-12 object-cover rounded-lg border border-stone-100"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-stone-800 truncate">
            {item.name || '未命名美食'}
          </div>
          <div className="text-xs text-stone-400 truncate">
            {item.address || '地址待补充'}
            {item.aiParsed && (
              <span className="ml-1 text-green-500" title="AI 识别">
                🤖
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          {item.day && (
            <span className="text-xs bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded font-medium">
              D{item.day}
            </span>
          )}
          <span className="text-stone-300 text-sm">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </div>

      {/* Expanded edit form */}
      {isExpanded && (
        <div className="border-t border-stone-100 p-4 space-y-3 bg-stone-50/50">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">
              名称 *
            </label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => handleUpdate('name', e.target.value)}
              placeholder="餐厅/小吃店名称"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">
              地址
            </label>
            <input
              type="text"
              value={item.address}
              onChange={(e) => handleUpdate('address', e.target.value)}
              placeholder="详细地址或区域"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
          </div>

          {/* Day and Meal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1">
                日期
              </label>
              <select
                value={item.day ?? ''}
                onChange={(e) =>
                  handleUpdate(
                    'day',
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {dayOptions.map((opt) => (
                  <option key={String(opt.value ?? 'none')} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-stone-500 block mb-1">
                餐段
              </label>
              <select
                value={item.mealTime ?? ''}
                onChange={(e) =>
                  handleUpdate(
                    'mealTime',
                    e.target.value || undefined
                  )
                }
                className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              >
                {mealOptions.map((opt) => (
                  <option key={String(opt.value ?? 'none')} value={opt.value ?? ''}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Recommended dishes */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">
              推荐菜
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {item.recommendedDishes.map((dish) => (
                <span
                  key={dish}
                  className="inline-flex items-center gap-1 bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full"
                >
                  {dish}
                  <button
                    onClick={() => removeDish(dish)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={dishInput}
                onChange={(e) => setDishInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDish()}
                placeholder="添加推荐菜"
                className="flex-1 border border-stone-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
              />
              <button
                onClick={addDish}
                className="bg-stone-200 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-stone-300 cursor-pointer"
              >
                + 添加
              </button>
            </div>
          </div>

          {/* Avg price */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">
              人均（元）
            </label>
            <input
              type="number"
              value={item.avgPrice ?? ''}
              onChange={(e) =>
                handleUpdate(
                  'avgPrice',
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="人均价格"
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
          </div>

          {/* AI notes */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">
              🤖 AI 备注
            </label>
            <textarea
              value={item.notes}
              onChange={(e) => handleUpdate('notes', e.target.value)}
              placeholder="AI 识别的备注信息"
              rows={2}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white resize-none"
            />
          </div>

          {/* 👤 User supplement notes — 手动补充文字 */}
          <div>
            <label className="text-xs font-medium text-stone-500 block mb-1">
              ✍️ 手动补充（非必须）
            </label>
            <textarea
              value={item.userSupplement}
              onChange={(e) => handleUpdate('userSupplement', e.target.value)}
              placeholder="你自己的备注：排队经验、必点隐藏菜单、避雷提醒、营业时间…"
              rows={2}
              className="w-full border border-dashed border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-amber-50/30 resize-none"
            />
            <p className="text-[10px] text-stone-400 mt-0.5">
              这里写你额外知道的信息，和 AI 备注互不影响
            </p>
          </div>

          {/* OCR raw text (collapsible) */}
          {item.ocrRawText && (
            <details className="text-xs">
              <summary className="text-stone-400 cursor-pointer">
                查看 OCR 原始文本
              </summary>
              <pre className="mt-1 p-2 bg-stone-100 rounded text-stone-500 whitespace-pre-wrap max-h-32 overflow-y-auto">
                {item.ocrRawText}
              </pre>
            </details>
          )}

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm('确定删除这条美食记录吗？')) {
                removeFoodItem(item.id);
              }
            }}
            className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
          >
            🗑 删除此条
          </button>
        </div>
      )}
    </div>
  );
}
