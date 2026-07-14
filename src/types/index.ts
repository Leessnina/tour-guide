export interface FoodItem {
  id: string;
  name: string;
  address: string;
  coordinates?: { lng: number; lat: number };
  recommendedDishes: string[];
  avgPrice?: number;
  notes: string;
  /** 用户手动补充的文字备注（不来自AI识别） */
  userSupplement: string;

  day?: 1 | 2 | 3 | 4;
  mealTime?: 'breakfast' | 'lunch' | 'dinner' | 'snack';

  screenshotId: string;
  thumbnailDataUrl?: string;

  ocrRawText?: string;
  aiParsed: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Screenshot {
  id: string;
  dataUrl: string;
  thumbnailDataUrl: string;
  fileName: string;
  uploadTime: number;
  ocrStatus: 'pending' | 'processing' | 'done' | 'error';
  ocrError?: string;
}

export interface TripDay {
  day: 1 | 2 | 3 | 4;
  label: string;
  date?: string;
}

export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const MEAL_LABELS: Record<MealTime, { label: string; emoji: string }> = {
  breakfast: { label: '早餐', emoji: '🌅' },
  lunch: { label: '午餐', emoji: '☀️' },
  dinner: { label: '晚餐', emoji: '🌙' },
  snack: { label: '小吃/夜宵', emoji: '🍢' },
};

export const DAY_COLORS: Record<number, string> = {
  1: '#f97316',
  2: '#3b82f6',
  3: '#22c55e',
  4: '#a855f7',
};

export type TabKey = 'import' | 'timeline' | 'map';
