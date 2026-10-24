import { apiClient } from './client';

export const usersApi = {
  createUser: async (userData: any) => {
    const response = await apiClient.post('/admin/users', userData);
    return response.data;
  },
  getAllUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },
  updateUser: async (userId: string, userData: any) => {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  updateUserRole: async (userId: string, role: string) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },
  
  deleteUser: async (userId: string) => {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  requestRemoval: async (userId: string) => {
    const response = await apiClient.post(`/admin/users/${userId}/removal-request`);
    return response.data;
  },

  getRemovalRequests: async () => {
    const response = await apiClient.get('/admin/users/removal-requests');
    return response.data;
  },

  approveRemoval: async (requestId: string) => {
    const response = await apiClient.put(`/admin/users/removal-requests/${requestId}/approve`);
    return response.data;
  },

  rejectRemoval: async (requestId: string) => {
    const response = await apiClient.put(`/admin/users/removal-requests/${requestId}/reject`);
    return response.data;
  }
};
