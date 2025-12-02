import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface EffortScoringConfig {
  id: number;
  effortType: string;
  displayName: string;
  valueFor100Points: number;
  valueUnit: string;
  timeDecayPerMonth: number;
  isActive: boolean;
  description: string | null;
  updatedAt: Date;
}

export interface CreateEffortConfigData {
  effortType: string;
  displayName: string;
  valueFor100Points: number;
  valueUnit: string;
  timeDecayPerMonth: number;
  description?: string;
}

export interface UpdateEffortConfigData {
  displayName?: string;
  valueFor100Points?: number;
  valueUnit?: string;
  timeDecayPerMonth?: number;
  description?: string;
  isActive?: boolean;
}

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token ? `Bearer ${token}` : '';
};

// Get all effort configs
export const getAllEffortConfigs = async (): Promise<EffortScoringConfig[]> => {
  const response = await axios.get(`${API_URL}/effort-config`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return response.data.data;
};

// Get effort config by ID
export const getEffortConfigById = async (id: number): Promise<EffortScoringConfig> => {
  const response = await axios.get(`${API_URL}/effort-config/${id}`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return response.data.data;
};

// Get effort config by type
export const getEffortConfigByType = async (type: string): Promise<EffortScoringConfig> => {
  const response = await axios.get(`${API_URL}/effort-config/type/${type}`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return response.data.data;
};

// Create new effort config
export const createEffortConfig = async (data: CreateEffortConfigData): Promise<EffortScoringConfig> => {
  const response = await axios.post(`${API_URL}/effort-config`, data, {
    headers: {
      Authorization: getAuthToken(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data;
};

// Update effort config
export const updateEffortConfig = async (
  id: number,
  data: UpdateEffortConfigData
): Promise<EffortScoringConfig> => {
  const response = await axios.put(`${API_URL}/effort-config/${id}`, data, {
    headers: {
      Authorization: getAuthToken(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data;
};

// Delete effort config
export const deleteEffortConfig = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/effort-config/${id}`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
};
