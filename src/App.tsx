import { useEffect } from 'react';
import { useStore } from './store/useStore';
import { db } from './db';
import Header from './components/layout/Header';
import TabBar from './components/layout/TabBar';
import UploadZone from './components/import/UploadZone';
import ScreenshotGrid from './components/import/ScreenshotGrid';
import RecognizeButton from './components/import/RecognizeButton';
import FoodCard from './components/import/FoodCard';
import Timeline from './components/timeline/Timeline';
import MapView from './components/map/MapView';
import FoodDetail from './components/shared/FoodDetail';

function App() {
  const activeTab = useStore((s) => s.activeTab);
  const foodItems = useStore((s) => s.foodItems);
  const loadScreenshots = useStore((s) => s.loadScreenshots);
  const loadFoodItems = useStore((s) => s.loadFoodItems);

  // Load data from IndexedDB on mount
  useEffect(() => {
    loadScreenshots();
    loadFoodItems();
  }, [loadScreenshots, loadFoodItems]);

  // Register a cleanup hook for the DB
  useEffect(() => {
    const handleBeforeUnload = () => db.close();
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-dvh bg-stone-50 flex flex-col">
      <Header />
      <TabBar />

      {/* Main content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-4">
        {activeTab === 'import' && (
          <div className="space-y-4">
            <UploadZone />
            <ScreenshotGrid />
            <RecognizeButton />

            {/* Food item list */}
            {foodItems.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-stone-500 mb-2">
                  识别结果 ({foodItems.length} 条)
                </h3>
                <div className="space-y-2">
                  {foodItems.map((item) => (
                    <FoodCard key={item.id} item={item} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {foodItems.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🍽️</div>
                <p className="text-stone-400 text-sm">
                  上传美食截图，开始识别吧！
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && <Timeline />}

        {activeTab === 'map' && <MapView />}
      </main>

      {/* Food detail modal */}
      <FoodDetail />

      {/* Footer */}
      <footer className="text-center py-3 text-xs text-stone-300 border-t border-stone-100">
        所有数据仅保存在你的浏览器中 🔒
      </footer>
    </div>
  );
}

export default App;
