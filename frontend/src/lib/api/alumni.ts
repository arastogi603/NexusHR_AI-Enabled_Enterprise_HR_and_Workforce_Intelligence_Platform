import { apiClient } from './client';

export interface Alumni {
  id: string;
  name: string;
  batchYear: number;
  company: string;
  role: string;
  linkedInUrl?: string;
  imageUrl?: string;
  createdAt?: string;
}

export const alumniApi = {
  getAllAlumni: async () => {
    try {
      const response = await apiClient.get('/alumni');
      return response.data;
    } catch (e) {
      console.warn("Could not fetch alumni, using fallback");
      return [];
    }
  },
  createAlumni: async (data: Partial<Alumni>) => {
    const response = await apiClient.post('/alumni', data);
    return response.data;
  },
  updateAlumni: async (id: string, data: Partial<Alumni>) => {
    const response = await apiClient.put(`/alumni/${id}`, data);
    return response.data;
  },
  deleteAlumni: async (id: string) => {
    const response = await apiClient.delete(`/alumni/${id}`);
    return response.data;
  }
};
