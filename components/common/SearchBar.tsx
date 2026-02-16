import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface SearchBarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "어떤 곡을 찾고 계신가요?", className }: SearchBarProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-full focus-visible:ring-primary/50 transition-all hover:bg-white/10"
      />
    </div>
  );
};