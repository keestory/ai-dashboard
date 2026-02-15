import { create } from 'zustand';

export interface Analysis {
  id: string;
  workspaceId: string;
  userId: string;
  name: string;
  description?: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: 'csv' | 'xls' | 'xlsx';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  rowCount?: number;
  columnCount?: number;
  createdAt: string;
  completedAt?: string;
}

interface AnalysisState {
  // State
  currentAnalysis: Analysis | null;
  analyses: Analysis[];
  isLoading: boolean;
  uploadProgress: number;

  // Actions
  setCurrentAnalysis: (analysis: Analysis | null) => void;
  setAnalyses: (analyses: Analysis[]) => void;
  addAnalysis: (analysis: Analysis) => void;
  updateAnalysis: (id: string, data: Partial<Analysis>) => void;
  removeAnalysis: (id: string) => void;
  setUploadProgress: (progress: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  reset: () => void;
}

const initialState = {
  currentAnalysis: null,
  analyses: [],
  isLoading: false,
  uploadProgress: 0,
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  ...initialState,

  setCurrentAnalysis: (analysis) => set({ currentAnalysis: analysis }),

  setAnalyses: (analyses) => set({ analyses }),

  addAnalysis: (analysis) =>
    set((state) => ({
      analyses: [analysis, ...state.analyses],
    })),

  updateAnalysis: (id, data) =>
    set((state) => ({
      analyses: state.analyses.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
      currentAnalysis:
        state.currentAnalysis?.id === id
          ? { ...state.currentAnalysis, ...data }
          : state.currentAnalysis,
    })),

  removeAnalysis: (id) =>
    set((state) => ({
      analyses: state.analyses.filter((a) => a.id !== id),
      currentAnalysis:
        state.currentAnalysis?.id === id ? null : state.currentAnalysis,
    })),

  setUploadProgress: (progress) => set({ uploadProgress: progress }),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),
}));
