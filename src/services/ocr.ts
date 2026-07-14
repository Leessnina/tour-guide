import Tesseract from 'tesseract.js';

let worker: Tesseract.Worker | null = null;

async function getWorker(): Promise<Tesseract.Worker> {
  if (worker) return worker;

  worker = await Tesseract.createWorker('chi_sim', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text') {
        // progress can be emitted here if needed
      }
    },
  });

  return worker;
}

export interface OCRResult {
  text: string;
  confidence: number;
}

export async function recognizeImage(dataUrl: string): Promise<OCRResult> {
  const w = await getWorker();
  const result = await w.recognize(dataUrl);
  return {
    text: result.data.text,
    confidence: result.data.confidence,
  };
}

export async function terminateWorker(): Promise<void> {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
}
