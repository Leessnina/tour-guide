export default function Header() {
  return (
    <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍜</span>
          <h1 className="text-lg font-bold text-stone-800 m-0">
            美食攻略整理器
          </h1>
        </div>
        <span className="text-xs text-stone-400 hidden sm:block">
          截图 → 识别 → 排行程 → 导出
        </span>
      </div>
    </header>
  );
}
