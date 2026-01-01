'use client';

import { useState } from 'react';
import CardModal from './CardModal';

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
  rarity?: {
    name: string;
  };
}

interface CardGridProps {
  cards: Card[];
}

export default function CardGrid({ cards }: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gradient-to-b from-gray-500 to-gray-700 border-gray-400';
      case 'rare': return 'bg-gradient-to-b from-orange-400 to-orange-600 border-orange-300';
      case 'epic': return 'bg-gradient-to-b from-purple-400 to-purple-600 border-purple-300';
      case 'legendary': return 'bg-gradient-to-b from-yellow-400 to-orange-500 border-yellow-300';
      case 'champion': return 'bg-gradient-to-b from-red-400 to-red-600 border-red-300';
      default: return 'bg-gradient-to-b from-gray-500 to-gray-700 border-gray-400';
    }
  };

  const getCardImage = (card: Card) => {
    // Use the API provided image URL if available
    if (card.iconUrls?.medium) {
      return card.iconUrls.medium;
    }
    
    // Fallback to a placeholder or default image
    return `https://cdn.royaleapi.com/static/img/cards-150/${card.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
  };

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center text-gray-400 mt-8">
        <p>No cards found</p>
      </div>
    );
  }

  // Debug: Log the first card to see its structure
  if (cards.length > 0) {
    console.log('First card data:', cards[0]);
  }

  return (
    <>
      <div className="max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Card Collection ({cards.length} cards)
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {cards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              onClick={() => setSelectedCard(card)}
              className="relative cursor-pointer transform hover:scale-105 transition-all duration-200"
            >
              {/* Elixir Cost with authentic icon */}
              {card.elixirCost && (
                <div className="absolute top-2 left-2 w-10 h-12 flex items-center justify-center z-10">
                  {/* Elixir Drop Image */}
                  <img 
                    src="/elixir-drop.png" 
                    alt="Elixir" 
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Elixir Cost Number */}
                  <span className="absolute text-white text-lg font-black drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
                    {card.elixirCost}
                  </span>
                </div>
              )}

              {/* Card Image - This IS the card */}
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={getCardImage(card)}
                  alt={card.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300" fill="%23374151"><rect width="200" height="300" fill="%23374151"/><path d="M100 80C80.118 80 64 96.118 64 116s16.118 36 36 36 36-16.118 36-36-16.118-36-36-36zm-20 60l-30-30 8.485-8.485L75 118.03l42.426-42.425L126 84.243L80 140z" fill="white"/></svg>';
                  }}
                />
                
                {/* Level Border - Bottom translucent bar */}
                <div className={`absolute bottom-0 left-0 right-0 h-7 ${getRarityColor(card.rarity)} opacity-80 flex items-center justify-center`}>
                  <span className="text-white text-sm font-bold drop-shadow-md">
                    Level {card.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedCard && (
        <CardModal 
          card={selectedCard} 
          onClose={() => setSelectedCard(null)} 
        />
      )}
    </>
  );
}
