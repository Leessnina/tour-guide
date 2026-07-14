import { useState } from 'react';
import { useStore } from '../../store/useStore';
import { recognizeImage } from '../../services/ocr';
import { parseFoodInfo, hasApiKey, setApiKey } from '../../services/aiParser';

export default function RecognizeButton() {
  const screenshots = useStore((s) => s.screenshots);
  const processingIds = useStore((s) => s.processingIds);
  const updateScreenshotStatus = useStore((s) => s.updateScreenshotStatus);
  const addFoodItem = useStore((s) => s.addFoodItem);
  const setProcessing = useStore((s) => s.setProcessing);
  const clearProcessing = useStore((s) => s.clearProcessing);

  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(!hasApiKey());
  const [statusMsg, setStatusMsg] = useState('');

  const pendingScreenshots = screenshots.filter(
    (s) => s.ocrStatus === 'pending'
  );

  const handleSetApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      setShowApiKeyInput(false);
      setApiKeyInput('');
    }
  };

  const handleRecognizeAll = async () => {
    if (!hasApiKey()) {
      setShowApiKeyInput(true);
      return;
    }

    setStatusMsg('');

    for (const ss of pendingScreenshots) {
      setProcessing(ss.id);
      updateScreenshotStatus(ss.id, 'processing');

      try {
        // Step 1: OCR
        const ocrResult = await recognizeImage(ss.dataUrl);
        const cleanText = ocrResult.text.trim();

        if (!cleanText) {
          // No text found — still create empty food item for manual input
          await addFoodItem({
            screenshotId: ss.id,
            thumbnailDataUrl: ss.thumbnailDataUrl,
            ocrRawText: '',
            aiParsed: false,
            name: '',
            address: '',
            recommendedDishes: [],
            notes: '',
            userSupplement: '',
          });
          updateScreenshotStatus(ss.id, 'done');
          clearProcessing(ss.id);
          continue;
        }

        // Step 2: AI parse
        let aiResult;
        try {
          aiResult = await parseFoodInfo(cleanText);
        } catch {
          // AI failed, still create item with OCR text
          await addFoodItem({
            screenshotId: ss.id,
            thumbnailDataUrl: ss.thumbnailDataUrl,
            ocrRawText: cleanText,
            aiParsed: false,
            name: '',
            address: '',
            recommendedDishes: [],
            notes: '',
            userSupplement: '',
          });
          updateScreenshotStatus(ss.id, 'done');
          clearProcessing(ss.id);
          continue;
        }

        // Step 3: Save result
        await addFoodItem({
          screenshotId: ss.id,
          thumbnailDataUrl: ss.thumbnailDataUrl,
          ocrRawText: cleanText,
          aiParsed: true,
          name: aiResult.name,
          address: aiResult.address,
          recommendedDishes: aiResult.recommendedDishes,
          notes: aiResult.notes,
          userSupplement: '',
        });

        updateScreenshotStatus(ss.id, 'done');
      } catch (err: any) {
        updateScreenshotStatus(ss.id, 'error', err.message || '识别失败');
      } finally {
        clearProcessing(ss.id);
      }
    }

    setStatusMsg(`✅ 全部识别完成！切换到「📋 行程」查看结果`);
  };

  return (
    <div className="mt-4 space-y-3">
      {/* API Key input */}
      {showApiKeyInput && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 mb-2 font-medium">
            🔑 请输入 Claude API Key（仅保存在本地浏览器）
          </p>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="sk-ant-..."
              className="flex-1 border border-amber-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              onKeyDown={(e) => e.key === 'Enter' && handleSetApiKey()}
            />
            <button
              onClick={handleSetApiKey}
              className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 cursor-pointer"
            >
              保存
            </button>
          </div>
          <p className="text-xs text-amber-600 mt-1">
            Key 仅保存在你的浏览器中，不会上传到任何服务器
          </p>
        </div>
      )}

      {/* Recognize button */}
      {pendingScreenshots.length > 0 && (
        <button
          onClick={handleRecognizeAll}
          disabled={processingIds.size > 0}
          className="w-full bg-orange-500 text-white py-3 rounded-xl font-medium text-sm hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          {processingIds.size > 0 ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              识别中...（{processingIds.size} 张）
            </span>
          ) : (
            `🚀 全部识别（${pendingScreenshots.length} 张）`
          )}
        </button>
      )}

      {/* Status message */}
      {statusMsg && (
        <p className="text-sm text-green-600 text-center font-medium">
          {statusMsg}
        </p>
      )}

      {/* All done */}
      {screenshots.length > 0 && pendingScreenshots.length === 0 && (
        <p className="text-sm text-stone-400 text-center">
          ✅ 所有截图已识别完成
        </p>
      )}
    </div>
  );
}
