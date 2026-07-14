import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { loadAmapScript, hasAmapKey, setAmapKey, geocodeAddress } from '../../services/amap';
import { DAY_COLORS } from '../../types';
import MapFilter from './MapFilter';

export default function MapView() {
  const foodItems = useStore((s) => s.foodItems);
  const [visibleDays, setVisibleDays] = useState(new Set([1, 2, 3, 4]));
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(!hasAmapKey());
  const [statusMsg, setStatusMsg] = useState('');
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Count food items by day (only those with coordinates or addresses)
  const countsByDay: Record<number, number> = {};
  for (let d = 1; d <= 4; d++) {
    countsByDay[d] = foodItems.filter((f) => f.day === d).length;
  }

  const handleSetKey = async () => {
    if (!apiKeyInput.trim()) return;
    setAmapKey(apiKeyInput.trim());
    setShowKeyInput(false);
    setApiKeyInput('');
    setStatusMsg('正在加载高德地图...');
    try {
      await loadAmapScript();
      setMapLoaded(true);
      setStatusMsg('');
    } catch {
      setStatusMsg('地图加载失败，请检查 Key 是否正确');
    }
  };

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !containerRef.current) return;

    try {
      mapRef.current = new window.AMap.Map(containerRef.current, {
        zoom: 12,
        center: [113.55, 22.23], // Zhuhai area
        viewMode: '2D',
      });
    } catch {
      setStatusMsg('地图初始化失败');
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [mapLoaded]);

  // Update markers when foodItems or visibleDays change
  const updateMarkers = useCallback(async () => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((m) => mapRef.current?.remove(m));
    markersRef.current = [];

    for (const item of foodItems) {
      if (!item.day || !visibleDays.has(item.day)) continue;

      // Try to geocode if we have address but no coordinates
      let pos = item.coordinates;
      if (!pos && item.address) {
        try {
          const geo = await geocodeAddress(item.address);
          if (geo) {
            pos = { lng: geo.lng, lat: geo.lat };
          }
        } catch {
          // skip geocoding errors
        }
      }

      if (!pos) continue;

      const color = DAY_COLORS[item.day] || '#f97316';
      const marker = new window.AMap.Marker({
        position: [pos.lng, pos.lat],
        title: item.name,
        icon: new window.AMap.Icon({
          size: new window.AMap.Size(24, 34),
          image: `https://a.amap.com/jsapi_demos/static/demo-center/icons/poi-marker-${color.replace('#', '') === 'f97316' ? 'red' : color.replace('#', '') === '3b82f6' ? 'blue' : color.replace('#', '') === '22c55e' ? 'green' : 'purple'}.png`,
          imageSize: new window.AMap.Size(24, 34),
        }),
      });

      // Info window content
      const infoContent = `
        <div style="padding:8px;min-width:180px;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
          <div style="font-weight:bold;font-size:14px;margin-bottom:4px;">${item.name || '未命名'}</div>
          ${item.address ? `<div style="font-size:12px;color:#78716c;margin-bottom:4px;">📍 ${item.address}</div>` : ''}
          ${item.recommendedDishes.length > 0 ? `<div style="font-size:12px;color:#f97316;">🍽️ ${item.recommendedDishes.slice(0, 5).join('、')}</div>` : ''}
          ${item.userSupplement ? `<div style="font-size:11px;color:#d97706;margin-top:4px;padding:4px;background:#fffbeb;border-radius:4px;">✍️ ${item.userSupplement}</div>` : ''}
          ${item.avgPrice ? `<div style="font-size:11px;color:#a8a29e;margin-top:2px;">💰 人均 ¥${item.avgPrice}</div>` : ''}
        </div>
      `;

      marker.on('click', () => {
        const infoWindow = new window.AMap.InfoWindow({
          content: infoContent,
          offset: new window.AMap.Pixel(0, -34),
        });
        infoWindow.open(mapRef.current, marker.getPosition());
      });

      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    }
  }, [foodItems, visibleDays]);

  useEffect(() => {
    if (mapRef.current) {
      updateMarkers();
    }
  }, [updateMarkers]);

  const toggleDay = (day: number) => {
    setVisibleDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) next.delete(day);
      else next.add(day);
      return next;
    });
  };

  return (
    <div className="relative w-full" style={{ height: 'calc(100dvh - 140px)' }}>
      {/* API Key input */}
      {showKeyInput && (
        <div className="absolute inset-0 flex items-center justify-center z-20 bg-stone-100/80 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm mx-4 w-full">
            <p className="text-sm font-medium text-stone-700 mb-3">
              🗺️ 请输入高德地图 JS API Key
            </p>
            <p className="text-xs text-stone-400 mb-3">
              免费获取：
              <a
                href="https://lbs.amap.com/api/javascript-api-v2/summary"
                target="_blank"
                rel="noopener"
                className="text-blue-500 underline ml-1"
              >
                高德开放平台
              </a>
            </p>
            <input
              type="text"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="输入你的 Key"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSetKey()}
            />
            <button
              onClick={handleSetKey}
              className="w-full bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 cursor-pointer"
            >
              加载地图
            </button>
            <p className="text-[10px] text-stone-400 mt-2">
              Key 仅保存在你的浏览器中
            </p>
          </div>
        </div>
      )}

      {/* Status message */}
      {statusMsg && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-white rounded-lg shadow-lg px-4 py-2 text-sm text-stone-600">
          {statusMsg}
        </div>
      )}

      {/* Map filter */}
      {mapLoaded && (
        <MapFilter
          visibleDays={visibleDays}
          onToggleDay={toggleDay}
          countsByDay={countsByDay}
        />
      )}

      {/* Map container */}
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden border border-stone-200" />
    </div>
  );
}
