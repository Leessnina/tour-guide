import { useStore } from '../../store/useStore';

export default function ScreenshotGrid() {
  const screenshots = useStore((s) => s.screenshots);
  const removeScreenshot = useStore((s) => s.removeScreenshot);

  if (screenshots.length === 0) return null;

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-stone-500 mb-2">
        已上传 {screenshots.length} 张截图
      </h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {screenshots.map((ss) => (
          <div key={ss.id} className="relative group">
            <img
              src={ss.thumbnailDataUrl}
              alt={ss.fileName}
              className="w-full aspect-square object-cover rounded-lg border border-stone-200"
            />
            {/* Status badge */}
            {ss.ocrStatus === 'processing' && (
              <span className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full animate-pulse">
                识别中
              </span>
            )}
            {ss.ocrStatus === 'done' && (
              <span className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                ✓
              </span>
            )}
            {ss.ocrStatus === 'error' && (
              <span className="absolute top-1 left-1 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                ✗
              </span>
            )}
            {/* Delete button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeScreenshot(ss.id);
              }}
              className="absolute top-1 right-1 bg-black/50 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
              title="删除"
            >
              ×
            </button>
            <p className="text-[10px] text-stone-400 mt-1 truncate">
              {ss.fileName}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
