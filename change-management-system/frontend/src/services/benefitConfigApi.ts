import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface BenefitScoringConfig {
  id: number;
  benefitType: string;
  displayName: string;
  valueFor100Points: number;
  valueUnit: string;
  timeDecayPerMonth: number;
  isActive: boolean;
  description: string | null;
  updatedAt: Date;
}

export interface CreateBenefitConfigData {
  benefitType: string;
  displayName: string;
  valueFor100Points: number;
  valueUnit: string;
  timeDecayPerMonth: number;
  description?: string;
}

export interface UpdateBenefitConfigData {
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

// Get all benefit configs
export const getAllBenefitConfigs = async (): Promise<BenefitScoringConfig[]> => {
  const response = await axios.get(`${API_URL}/benefit-config`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return response.data.data;
};

// Get benefit config by ID
export const getBenefitConfigById = async (id: number): Promise<BenefitScoringConfig> => {
  const response = await axios.get(`${API_URL}/benefit-config/${id}`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return response.data.data;
};

// Get benefit config by type
export const getBenefitConfigByType = async (type: string): Promise<BenefitScoringConfig> => {
  const response = await axios.get(`${API_URL}/benefit-config/type/${type}`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
  return response.data.data;
};

// Create new benefit config
export const createBenefitConfig = async (data: CreateBenefitConfigData): Promise<BenefitScoringConfig> => {
  const response = await axios.post(`${API_URL}/benefit-config`, data, {
    headers: {
      Authorization: getAuthToken(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data;
};

// Update benefit config
export const updateBenefitConfig = async (
  id: number,
  data: UpdateBenefitConfigData
): Promise<BenefitScoringConfig> => {
  const response = await axios.put(`${API_URL}/benefit-config/${id}`, data, {
    headers: {
      Authorization: getAuthToken(),
      'Content-Type': 'application/json',
    },
  });
  return response.data.data;
};

// Delete benefit config
export const deleteBenefitConfig = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/benefit-config/${id}`, {
    headers: {
      Authorization: getAuthToken(),
    },
  });
};
