import { useQuery } from '@tanstack/react-query';
import { searchTracks, getRecommendations, fetchPlayerState } from '../services/api';
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

export const usePlayerState = () => {
  const { token } = useStore();

  return useQuery({
    queryKey: ['playerState'],
    queryFn: fetchPlayerState,
    enabled: !!token,
    refetchInterval: 3000, // Poll every 3 seconds
    retry: false,
  });
};