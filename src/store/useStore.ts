import { create } from 'zustand';
import type { FoodItem, Screenshot, TripDay, TabKey, MealTime } from '../types';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';

interface AppState {
  // Navigation
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;

  // Trip days
  tripDays: TripDay[];
  setTripDays: (days: TripDay[]) => void;

  // Screenshots
  screenshots: Screenshot[];
  loadScreenshots: () => Promise<void>;
  addScreenshot: (file: File) => Promise<Screenshot>;
  removeScreenshot: (id: string) => Promise<void>;
  updateScreenshotStatus: (
    id: string,
    status: Screenshot['ocrStatus'],
    error?: string
  ) => Promise<void>;

  // Food items
  foodItems: FoodItem[];
  loadFoodItems: () => Promise<void>;
  addFoodItem: (item: Partial<FoodItem> & { screenshotId: string }) => Promise<FoodItem>;
  updateFoodItem: (id: string, updates: Partial<FoodItem>) => Promise<void>;
  removeFoodItem: (id: string) => Promise<void>;
  getFoodItemsForSlot: (day: number, mealTime: MealTime) => FoodItem[];
  getUnassignedFoodItems: () => FoodItem[];
  getFoodItemsByDay: (day: number) => FoodItem[];

  // OCR processing
  processingIds: Set<string>;
  setProcessing: (id: string) => void;
  clearProcessing: (id: string) => void;

  // Selected food item for detail view
  selectedFoodId: string | null;
  setSelectedFood: (id: string | null) => void;
}

function compressImage(file: File, maxW = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = (h * maxW) / w;
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createThumbnail(dataUrl: string, size = 200): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(size / img.width, size / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.6));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

export const useStore = create<AppState>((set, get) => ({
  // Navigation
  activeTab: 'import',
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Trip days
  tripDays: [
    { day: 1, label: '顺德·Day1', date: '' },
    { day: 2, label: '澳门·Day2', date: '' },
    { day: 3, label: '珠海·Day3', date: '' },
    { day: 4, label: '返程·Day4', date: '' },
  ],
  setTripDays: (days) => set({ tripDays: days }),

  // Screenshots
  screenshots: [],
  loadScreenshots: async () => {
    const screenshots = await db.screenshots.reverse().sortBy('uploadTime');
    set({ screenshots });
  },
  addScreenshot: async (file) => {
    const id = uuidv4();
    const dataUrl = await compressImage(file);
    const thumbnailDataUrl = await createThumbnail(dataUrl);
    const screenshot: Screenshot = {
      id,
      dataUrl,
      thumbnailDataUrl,
      fileName: file.name,
      uploadTime: Date.now(),
      ocrStatus: 'pending',
    };
    await db.screenshots.add(screenshot);
    const screenshots = [...get().screenshots, screenshot];
    set({ screenshots });
    return screenshot;
  },
  removeScreenshot: async (id) => {
    await db.screenshots.delete(id);
    await db.foodItems.where('screenshotId').equals(id).delete();
    set({
      screenshots: get().screenshots.filter((s) => s.id !== id),
      foodItems: get().foodItems.filter((f) => f.screenshotId !== id),
    });
  },
  updateScreenshotStatus: async (id, status, error) => {
    const updates: Partial<Screenshot> = { ocrStatus: status };
    if (error) updates.ocrError = error;
    await db.screenshots.update(id, updates);
    set({
      screenshots: get().screenshots.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  },

  // Food items
  foodItems: [],
  loadFoodItems: async () => {
    const foodItems = await db.foodItems.reverse().sortBy('createdAt');
    set({ foodItems });
  },
  addFoodItem: async (partial) => {
    const id = uuidv4();
    const now = Date.now();
    const item: FoodItem = {
      id,
      name: '',
      address: '',
      recommendedDishes: [],
      notes: '',
      userSupplement: '',
      aiParsed: false,
      createdAt: now,
      updatedAt: now,
      ...partial,
    };
    await db.foodItems.add(item);
    set({ foodItems: [item, ...get().foodItems] });
    return item;
  },
  updateFoodItem: async (id, updates) => {
    const finalUpdates = { ...updates, updatedAt: Date.now() };
    await db.foodItems.update(id, finalUpdates);
    set({
      foodItems: get().foodItems.map((f) =>
        f.id === id ? { ...f, ...finalUpdates } : f
      ),
    });
  },
  removeFoodItem: async (id) => {
    await db.foodItems.delete(id);
    set({ foodItems: get().foodItems.filter((f) => f.id !== id) });
  },
  getFoodItemsForSlot: (day, mealTime) => {
    return get().foodItems.filter(
      (f) => f.day === day && f.mealTime === mealTime
    );
  },
  getUnassignedFoodItems: () => {
    return get().foodItems.filter((f) => !f.day || !f.mealTime);
  },
  getFoodItemsByDay: (day) => {
    return get().foodItems.filter((f) => f.day === day);
  },

  // Processing
  processingIds: new Set(),
  setProcessing: (id) =>
    set({ processingIds: new Set([...get().processingIds, id]) }),
  clearProcessing: (id) => {
    const next = new Set(get().processingIds);
    next.delete(id);
    set({ processingIds: next });
  },

  // Selected food
  selectedFoodId: null,
  setSelectedFood: (id) => set({ selectedFoodId: id }),
}));
