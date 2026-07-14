import { useCallback, useRef, useState } from 'react';
import { useStore } from '../../store/useStore';

export default function UploadZone() {
  const addScreenshot = useStore((s) => s.addScreenshot);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArr = Array.from(files).filter((f) =>
        f.type.startsWith('image/')
      );
      for (const file of fileArr) {
        try {
          await addScreenshot(file);
        } catch {
          // skip failed uploads
        }
      }
    },
    [addScreenshot]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
        isDragOver
          ? 'border-orange-400 bg-orange-50 scale-[1.02]'
          : 'border-stone-300 hover:border-orange-300 hover:bg-stone-50'
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleInputChange}
        className="hidden"
      />
      <div className="text-4xl mb-3">📸</div>
      <p className="text-stone-600 font-medium mb-1">
        点击或拖拽上传美食截图
      </p>
      <p className="text-stone-400 text-sm">
        支持 PNG / JPG / WEBP，可批量上传
      </p>
    </div>
  );
}
