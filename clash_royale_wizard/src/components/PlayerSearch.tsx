'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface PlayerSearchProps {
  onSearch: (playerTag: string) => void;
  loading: boolean;
}

export default function PlayerSearch({ onSearch, loading }: PlayerSearchProps) {
  const [playerTag, setPlayerTag] = useState('#VCQ2V0V9U');
  const { isDark } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerTag.trim()) {
      onSearch(playerTag.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={playerTag}
          onChange={(e) => setPlayerTag(e.target.value)}
          placeholder="Enter player tag (e.g., #VCQ2V0V9U)"
          className={`flex-1 px-4 py-3 rounded-lg border transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            isDark
              ? 'border-gray-600 bg-gray-800/50 text-white placeholder-gray-400'
              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
          }`}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading}
          className={`px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isDark
              ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white'
              : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white'
          }`}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Search'
          )}
        </button>
      </div>
    </form>
  );
}
