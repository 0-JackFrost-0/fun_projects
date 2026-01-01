'use client';

import { useEffect } from 'react';

interface Card {
  name: string;
  id: number;
  level: number;
  maxLevel: number;
  count: number;
  iconUrls?: {
    medium?: string;
  };
  elixirCost?: number;
  rarity?: string; // API returns string directly
}

interface CardModalProps {
  card: Card;
  onClose: () => void;
}

export default function CardModal({ card, onClose }: CardModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'text-gray-300 border-gray-400';
      case 'rare': return 'text-orange-300 border-orange-400';
      case 'epic': return 'text-purple-300 border-purple-400';
      case 'legendary': return 'text-yellow-300 border-yellow-400';
      case 'champion': return 'text-red-300 border-red-400';
      default: return 'text-gray-300 border-gray-400';
    }
  };

  const getCardImage = (card: Card) => {
    if (card.iconUrls?.medium) {
      return card.iconUrls.medium;
    }
    return `https://cdn.royaleapi.com/static/img/cards-150/${card.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
  };

  const progressPercentage = ((card.level / card.maxLevel) * 100).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative max-w-md w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden shadow-2xl border border-gray-600">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
        >
          ✕
        </button>

        {/* Card Header */}
        <div className="relative p-6 text-center">
          <div className="flex justify-center mb-4">
            <img
              src={getCardImage(card)}
              alt={card.name}
              className="w-32 h-32 object-contain"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
              }}
            />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-2">{card.name}</h3>
          
          {card.rarity && (
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getRarityColor(card.rarity)}`}>
              {card.rarity}
            </span>
          )}
        </div>

        {/* Card Stats */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 gap-4 mb-6">
            {card.elixirCost && (
              <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-purple-300">{card.elixirCost}</p>
                <p className="text-xs text-gray-400">Elixir Cost</p>
              </div>
            )}
            
            <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-300">{card.level}</p>
              <p className="text-xs text-gray-400">Current Level</p>
            </div>
            
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-300">{card.maxLevel}</p>
              <p className="text-xs text-gray-400">Max Level</p>
            </div>
            
            {card.count > 0 && (
              <div className="bg-yellow-600/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-yellow-300">{card.count}</p>
                <p className="text-xs text-gray-400">Cards Owned</p>
              </div>
            )}
          </div>

          {/* Level Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-300">Level Progress</span>
              <span className="text-sm text-gray-300">{progressPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Card ID: {card.id}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
