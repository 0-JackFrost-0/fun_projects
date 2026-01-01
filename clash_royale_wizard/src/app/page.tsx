'use client';

import { useState } from 'react';
import PlayerSearch from '@/components/PlayerSearch';
import CardGrid from '@/components/CardGrid';
import PlayerInfo from '@/components/PlayerInfo';
import DeckSuggestions from '@/components/DeckSuggestions';
import ThemeToggle from '@/components/ThemeToggle';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
  const [playerData, setPlayerData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cards' | 'decks'>('cards');
  const { isDark } = useTheme();

  const handleSearch = async (playerTag: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/player?tag=${encodeURIComponent(playerTag)}`);
      const result = await response.json();
      
      if (result.success) {
        setPlayerData(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to fetch player data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={`min-h-screen transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-black to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
    }`}>
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 relative">
          <img 
            src="/cr-icon.png" 
            alt="Clash Royale" 
            className="w-12 h-12 md:w-16 md:h-16 rounded-xl shadow-lg absolute top-0 left-0"
          />
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 transition-colors duration-500 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Clash Royale Wizard
          </h1>
          <p className={`text-xl mb-8 transition-colors duration-500 ${
            isDark ? 'text-blue-200' : 'text-gray-600'
          }`}>
            Discover your card collection and get AI-powered deck suggestions
          </p>
        </div>

        <PlayerSearch onSearch={handleSearch} loading={loading} />

        {error && (
          <div className={`max-w-md mx-auto mt-6 p-4 border rounded-lg text-center transition-colors duration-500 ${
            isDark 
              ? 'bg-red-500/20 border-red-500 text-red-200' 
              : 'bg-red-50 border-red-300 text-red-700'
          }`}>
            {error}
          </div>
        )}

        {playerData && (
          <div className="mt-8">
            <PlayerInfo player={playerData} />
            
            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className={`inline-flex rounded-lg p-1 transition-colors duration-500 ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-100'
              }`}>
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'cards'
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🃏 Card Collection
                </button>
                <button
                  onClick={() => setActiveTab('decks')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'decks'
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark
                        ? 'text-gray-300 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  🎯 Deck Suggestions
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'cards' ? (
              <CardGrid cards={playerData.cards || []} />
            ) : (
              <DeckSuggestions playerData={playerData} />
            )}
          </div>
        )}
      </div>
    </main>
  );
}