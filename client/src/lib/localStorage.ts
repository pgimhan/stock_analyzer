import type { StockAnalysis, AnalysisResult } from "@shared/schema";

interface SavedAnalysis {
  id: string;
  timestamp: number;
  inputData: StockAnalysis;
  result: AnalysisResult;
}

const STORAGE_KEY = "stock_analyses";

export const saveAnalysis = (inputData: StockAnalysis, result: AnalysisResult): void => {
  const analyses = getAnalyses();
  const newAnalysis: SavedAnalysis = {
    id: `${inputData.tickerSymbol}-${Date.now()}`,
    timestamp: Date.now(),
    inputData,
    result,
  };
  analyses.unshift(newAnalysis);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
};

export const getAnalyses = (): SavedAnalysis[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteAnalysis = (id: string): void => {
  const analyses = getAnalyses().filter(a => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(analyses));
};

export const clearAllAnalyses = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
