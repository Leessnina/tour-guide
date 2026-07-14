import { useStore } from '../../store/useStore';
import type { TabKey } from '../../types';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'import', label: '导入识别', emoji: '📤' },
  { key: 'timeline', label: '行程', emoji: '📋' },
  { key: 'map', label: '地图', emoji: '🗺️' },
];

export default function TabBar() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  return (
    <nav className="bg-white border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 flex">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 sm:flex-none py-3 px-4 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <span className="mr-1.5">{tab.emoji}</span>
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
