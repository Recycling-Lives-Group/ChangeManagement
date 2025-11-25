import { create } from 'zustand';
import type { ChangeRequest, ChangeRequestFormData, FilterParams } from '@cm/types';
import { changesApi } from '../services/api';

interface ChangesState {
  changes: ChangeRequest[];
  currentChange: ChangeRequest | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
  filters: FilterParams;
  fetchChanges: (params?: any) => Promise<void>;
  fetchChange: (id: string) => Promise<void>;
  createChange: (data: ChangeRequestFormData) => Promise<ChangeRequest>;
  updateChange: (id: string, data: Partial<ChangeRequestFormData>) => Promise<void>;
  deleteChange: (id: string) => Promise<void>;
  approveChange: (id: string, comments?: string) => Promise<void>;
  rejectChange: (id: string, comments: string) => Promise<void>;
  setFilters: (filters: FilterParams) => void;
  setPage: (page: number) => void;
}

export const useChangesStore = create<ChangesState>((set, get) => ({
  changes: [],
  currentChange: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    total: 0,
  },
  filters: {},

  fetchChanges: async (params) => {
    try {
      set({ isLoading: true, error: null });
      const { filters, pagination } = get();
      const response = await changesApi.getChanges({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
        ...params,
      });

      set({
        changes: response.data || [],
        pagination: response.meta || pagination,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch changes',
        isLoading: false,
      });
    }
  },

  fetchChange: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await changesApi.getChange(id);
      set({
        currentChange: response.data || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to fetch change',
        isLoading: false,
      });
    }
  },

  createChange: async (data: ChangeRequestFormData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await changesApi.createChange(data);
      set({ isLoading: false });
      get().fetchChanges();
      return response.data!;
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to create change',
        isLoading: false,
      });
      throw error;
    }
  },

  updateChange: async (id: string, data: Partial<ChangeRequestFormData>) => {
    try {
      set({ isLoading: true, error: null });
      await changesApi.updateChange(id, data);
      set({ isLoading: false });
      get().fetchChanges();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to update change',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteChange: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      await changesApi.deleteChange(id);
      set({ isLoading: false });
      get().fetchChanges();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to delete change',
        isLoading: false,
      });
      throw error;
    }
  },

  approveChange: async (id: string, comments?: string) => {
    try {
      set({ isLoading: true, error: null });
      await changesApi.approveChange(id, comments);
      set({ isLoading: false });
      get().fetchChanges();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to approve change',
        isLoading: false,
      });
      throw error;
    }
  },

  rejectChange: async (id: string, comments: string) => {
    try {
      set({ isLoading: true, error: null });
      await changesApi.rejectChange(id, comments);
      set({ isLoading: false });
      get().fetchChanges();
    } catch (error: any) {
      set({
        error: error.response?.data?.error?.message || 'Failed to reject change',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: FilterParams) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
    get().fetchChanges();
  },

  setPage: (page: number) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchChanges();
  },
}));
