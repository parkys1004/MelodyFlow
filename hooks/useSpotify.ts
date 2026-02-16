import { useQuery } from '@tanstack/react-query';
import { searchTracks, getRecommendations } from '../services/api';
import { useStore } from '../lib/store';

export const useSearch = (query: string) => {
  const { token } = useStore();
  
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchTracks(query),
    enabled: !!token && query.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useRecommendations = (seedTrackIds: string[]) => {
  const { token } = useStore();

  return useQuery({
    queryKey: ['recommendations', seedTrackIds],
    queryFn: () => getRecommendations(seedTrackIds),
    enabled: !!token && seedTrackIds.length > 0,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};