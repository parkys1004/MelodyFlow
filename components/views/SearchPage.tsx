import React, { useState } from 'react';
import { useSearch } from '../../hooks/useSpotify';
import { SearchBar } from '../common/SearchBar';
import { MusicCard } from '../common/MusicCard';
import { Music4 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

export const SearchPage = () => {
  const [query, setQuery] = useState('');
  
  const { data: searchResults, isLoading, isError } = useSearch(query);
  const tracks = searchResults?.tracks?.items || [];

  return (
    <div className="p-4 md:p-6 pb-36 md:pb-24 min-h-full bg-gradient-to-b from-zinc-900 to-black text-white">
      <div className="max-w-2xl mx-auto mb-8 md:mb-10 text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          음악 검색
        </h1>
        <p className="text-sm md:text-base text-zinc-400">듣고 싶은 노래를 찾아 DJ에게 신청해보세요.</p>
        <SearchBar 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="shadow-2xl"
        />
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array(10).fill(null).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && tracks.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {tracks.map((track) => (
            <MusicCard key={track.id} track={track} />
          ))}
        </div>
      )}

      {!isLoading && query && tracks.length === 0 && !isError && (
        <div className="text-center py-20 text-zinc-500">
          <Music4 className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">검색 결과가 없습니다.</p>
        </div>
      )}

      {!query && (
         <div className="text-center py-24 md:py-32 text-zinc-600">
            <p className="text-sm md:text-base">좋아하는 아티스트나 곡 제목을 입력해보세요.</p>
         </div>
      )}
    </div>
  );
};