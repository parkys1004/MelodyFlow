import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Loader2, Radio } from 'lucide-react';
import { insertSongRequest } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile } from '../../services/api';
import { SpotifyTrack } from '../../types';

interface RequestButtonProps {
  track: SpotifyTrack;
  onSuccess?: () => void;
}

export const RequestButton = ({ track, onSuccess }: RequestButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUserProfile });

  const handleRequest = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      alert("신청곡을 보내려면 로그인이 필요합니다.");
      return;
    }

    setIsLoading(true);
    try {
      await insertSongRequest(track, user);
      alert(`${track.name} 곡이 신청되었습니다!`);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      alert("신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      size="sm" 
      onClick={handleRequest} 
      disabled={isLoading}
      className="bg-primary/90 hover:bg-primary text-black font-bold rounded-full transition-transform hover:scale-105 active:scale-95"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Radio className="h-4 w-4 mr-2" />
      )}
      DJ에게 신청하기
    </Button>
  );
};