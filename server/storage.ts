// This application performs all calculations client-side
// No backend storage is required for the stock valuation calculator

export interface IStorage {
  // Storage interface placeholder for future features if needed
}

export class MemStorage implements IStorage {
  constructor() {
    // No storage needed for current implementation
  }
}

export const storage = new MemStorage();
