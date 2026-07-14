import Dexie, { type EntityTable } from 'dexie';
import type { FoodItem, Screenshot } from '../types';

class FoodGuideDB extends Dexie {
  screenshots!: EntityTable<Screenshot, 'id'>;
  foodItems!: EntityTable<FoodItem, 'id'>;

  constructor() {
    super('food-guide-db');
    this.version(1).stores({
      screenshots: 'id, uploadTime, ocrStatus',
      foodItems: 'id, day, mealTime, screenshotId, createdAt',
    });
  }
}

export const db = new FoodGuideDB();
