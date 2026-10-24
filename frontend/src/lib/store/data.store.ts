import { create } from 'zustand';
import { eventsApi, Event } from '../api/events';
import { alumniApi, Alumni } from '../api/alumni';
import { usersApi } from '../api/users';
import { apiClient } from '../api/client';

interface DataState {
  events: Event[];
  alumni: Alumni[];
  team: any[];
  isLoaded: boolean;
  isLoading: boolean;
  prefetchData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  events: [],
  alumni: [],
  team: [],
  isLoaded: false,
  isLoading: false,
  prefetchData: async () => {
    if (get().isLoaded || get().isLoading) return;
    set({ isLoading: true });
    try {
      const [events, alumni, team] = await Promise.all([
        eventsApi.getPublishedEvents().catch(() => []),
        alumniApi.getAllAlumni().catch(() => []),
        apiClient.get('/public/team').then(r => r.data).catch(() => [])
      ]);
      set({ events, alumni, team, isLoaded: true, isLoading: false });
    } catch (e) {
      console.error("Failed to prefetch data", e);
      set({ isLoading: false });
    }
  }
}));
