import { useState } from 'react';
import { exportToImage } from '../../utils/export';

export default function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToImage('timeline-export-area', '美食攻略行程.png');
    } catch (err: any) {
      alert('导出失败：' + (err.message || '未知错误'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-xl font-medium text-sm hover:bg-stone-700 disabled:opacity-50 transition-colors cursor-pointer shadow-lg"
    >
      {exporting ? (
        <>
          <span className="animate-spin">⏳</span>
          导出中...
        </>
      ) : (
        <>
          <span>📸</span>
          导出长图
        </>
      )}
    </button>
  );
}
