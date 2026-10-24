import { apiClient } from './client';

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: string;
  status: string;
  isTeamEvent: boolean;
  teamSizeMin: number;
  teamSizeMax: number;
  seatsTaken: number;
  capacity?: number;
  posterUrl?: string;
}

export const eventsApi = {
  getPublishedEvents: async (): Promise<Event[]> => {
    try {
      const response = await apiClient.get('/events');
      return response.data;
    } catch (e) {
      console.warn("Could not fetch events, using fallback");
      return [];
    }
  },
  getEventBySlug: async (slug: string): Promise<Event> => {
    const response = await apiClient.get(`/events/${slug}`);
    return response.data;
  },
  getAllEvents: async (): Promise<Event[]> => {
    const response = await apiClient.get('/events/all');
    return response.data;
  },
  createEvent: async (data: any) => {
    const response = await apiClient.post('/events', data);
    return response.data;
  },
  updateEvent: async (slug: string, data: any) => {
    const response = await apiClient.put(`/events/${slug}`, data);
    return response.data;
  },
  publishEvent: async (slug: string) => {
    const response = await apiClient.post(`/events/${slug}/publish`);
    return response.data;
  },
  unpublishEvent: async (slug: string) => {
    const response = await apiClient.post(`/events/${slug}/unpublish`);
    return response.data;
  },
  deleteEvent: async (slug: string) => {
    const response = await apiClient.delete(`/events/${slug}`);
    return response.data;
  },
  createTeam: async (slug: string, data: any) => {
    const response = await apiClient.post(`/events/${slug}/teams`, data);
    return response.data;
  },
  joinTeam: async (slug: string, data: any) => {
    const response = await apiClient.post(`/events/${slug}/teams/join`, data);
    return response.data;
  },
  registerIndividual: async (slug: string, data: any) => {
    const response = await apiClient.post(`/events/${slug}/register`, data);
    return response.data;
  },
  sendOtp: async (email: string) => {
    const response = await apiClient.post(`/otp/send`, { email });
    return response.data;
  }
};
