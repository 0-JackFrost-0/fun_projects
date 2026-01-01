'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/utils/deckCreator';

interface DeckSuggestionsProps {
  playerData: any;
}

interface DeckResult {
  deck: Card[];
  analysis: {
    averageElixir: number;
    averageLevel: number;
    deckScore: number;
    winConditionNames: string[];
    spellCount: number;
    buildingCount: number;
    troopCount: number;
  };
  battleAnalysis?: {
    bestPerformingCard: string;
    worstPerformingCard: string;
    unusedCards: string[];
    bestDefendedAgainst: string;
    worstDefendedAgainst: string;
    undefendedAgainst: string[];
    totalBattles: number;
    winRate: number;
    battleLogSample?: Array<{
      battleTime: string;
      type: string;
      isWin: boolean;
      playerCrowns: number;
      opponentCrowns: number;
      trophyChange: number;
      playerCards: string[];
      opponentCards: string[];
      gameMode: string;
    }>;
  };
  aiGuidance?: {
    strategy: string;
    strengths: string[];
    gameplayTips: string[];
    cardReasons: { [cardName: string]: string };
  };
  upgrades?: Array<{
    cardName: string;
    currentLevel: number;
    maxLevel: number;
    priority: number;
    reason: string;
  }>;
}

export default function DeckSuggestions({ playerData }: DeckSuggestionsProps) {
  const [deckResult, setDeckResult] = useState<DeckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isDark } = useTheme();

  const generateDeck = async () => {
    if (!playerData) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/decks/smart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          playerData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeckResult(result.data);
      } else {
        setError(result.error || 'Failed to generate deck suggestion');
      }
    } catch (err) {
      setError('Network error while generating deck');
    } finally {
      setLoading(false);
    }
  };

  const getCardImage = (card: Card) => {
    if (card.iconUrls?.medium) {
      return card.iconUrls.medium;
    }
    return `https://cdn.royaleapi.com/static/img/cards-150/${card.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'common': return 'bg-gradient-to-b from-gray-500 to-gray-700';
      case 'rare': return 'bg-gradient-to-b from-orange-400 to-orange-600';
      case 'epic': return 'bg-gradient-to-b from-purple-400 to-purple-600';
      case 'legendary': return 'bg-gradient-to-b from-yellow-400 to-orange-500';
      case 'champion': return 'bg-gradient-to-b from-red-400 to-red-600';
      default: return 'bg-gradient-to-b from-gray-500 to-gray-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className={`text-3xl font-bold mb-2 transition-colors duration-500 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          🎯 Smart Deck Recommendation
        </h2>
        <p className={`text-lg transition-colors duration-500 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          AI-powered deck recommendation based on your battle performance
        </p>
        
        {!deckResult && (
          <button
            onClick={generateDeck}
            disabled={loading}
            className={`mt-4 px-6 py-3 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isDark
                ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white'
                : 'bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white'
            }`}
          >
            {loading ? 'Analyzing Your Battles & Creating Deck...' : 'Generate Smart Deck Recommendation'}
          </button>
        )}
      </div>

      {error && (
        <div className={`max-w-md mx-auto mb-6 p-4 border rounded-lg text-center transition-colors duration-500 ${
          isDark 
            ? 'bg-red-500/20 border-red-500 text-red-200' 
            : 'bg-red-50 border-red-300 text-red-700'
        }`}>
          {error}
        </div>
      )}

      {deckResult && (
        <div className="space-y-6">
          {/* Battle Log Sample */}
          {deckResult.battleAnalysis?.battleLogSample && (
            <div className={`p-6 rounded-xl transition-colors duration-500 ${
              isDark
                ? 'bg-gradient-to-r from-indigo-800/30 to-cyan-800/30 border border-indigo-500/20'
                : 'bg-gradient-to-r from-indigo-100/80 to-cyan-100/80 border border-indigo-200/50'
            }`}>
              <h3 className={`text-xl font-bold mb-4 transition-colors duration-500 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                📋 Recent Battles Analyzed ({deckResult.battleAnalysis.totalBattles} total)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {deckResult.battleAnalysis.battleLogSample.map((battle, index) => (
                  <div key={index} className={`p-3 rounded-lg border transition-colors duration-500 ${
                    battle.isWin 
                      ? isDark 
                        ? 'bg-green-800/20 border-green-500/30' 
                        : 'bg-green-50 border-green-200'
                      : isDark
                        ? 'bg-red-800/20 border-red-500/30'
                        : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className={`text-sm font-bold ${
                          battle.isWin 
                            ? isDark ? 'text-green-300' : 'text-green-700'
                            : isDark ? 'text-red-300' : 'text-red-700'
                        }`}>
                          {battle.isWin ? '✅' : '❌'} {battle.playerCrowns}-{battle.opponentCrowns}
                        </span>
                        <span className={`ml-2 text-xs ${
                          battle.trophyChange > 0 
                            ? isDark ? 'text-green-300' : 'text-green-600'
                            : isDark ? 'text-red-300' : 'text-red-600'
                        }`}>
                          {battle.trophyChange > 0 ? '+' : ''}{battle.trophyChange}
                        </span>
                      </div>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {battle.gameMode}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-8 gap-1">
                      {battle.playerCards.map((cardName, cardIndex) => (
                        <div key={cardIndex} className={`text-xs p-1 rounded text-center ${
                          isDark ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {cardName.split(' ')[0]} {/* Show first word of card name */}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Battle Analysis */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-xl transition-colors duration-500 ${
              isDark
                ? 'bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-gray-600/30'
                : 'bg-gradient-to-b from-gray-50/80 to-white/80 border border-gray-200/50'
            }`}>
              <h3 className={`text-lg font-bold mb-4 transition-colors duration-500 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                📊 Battle Analysis
              </h3>
              
              {deckResult.battleAnalysis && (
                <div className="space-y-3">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-700/20' : 'bg-green-100/50'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                      Best Card: {deckResult.battleAnalysis.bestPerformingCard}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-red-700/20' : 'bg-red-100/50'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                      Struggling With: {deckResult.battleAnalysis.worstDefendedAgainst}
                    </p>
                  </div>
                  
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-700/20' : 'bg-blue-100/50'}`}>
                    <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      Win Rate: {deckResult.battleAnalysis.winRate.toFixed(1)}%
                    </p>
                  </div>

                  {deckResult.battleAnalysis.unusedCards.length > 0 && (
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-700/20' : 'bg-yellow-100/50'}`}>
                      <p className={`text-xs font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                        Unused Cards: {deckResult.battleAnalysis.unusedCards.slice(0, 3).join(', ')}
                        {deckResult.battleAnalysis.unusedCards.length > 3 && `... +${deckResult.battleAnalysis.unusedCards.length - 3} more`}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Deck */}
          <div className="lg:col-span-2">
            <div className={`p-6 rounded-xl transition-colors duration-500 ${
              isDark
                ? 'bg-gradient-to-r from-purple-800/30 to-blue-800/30 border border-purple-500/20'
                : 'bg-gradient-to-r from-purple-100/80 to-blue-100/80 border border-purple-200/50'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold transition-colors duration-500 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  🤖 AI-Generated Deck
                </h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  isDark ? 'bg-green-600/20 text-green-300' : 'bg-green-100 text-green-700'
                }`}>
                  Score: {deckResult.analysis.deckScore}/100
                </div>
              </div>
              
              {/* Cards Grid */}
              <div className="grid grid-cols-4 gap-3 mb-4">
                {deckResult.deck.map((card, index) => (
                  <div key={`${card.id}-${index}`} className="relative">
                    {/* Elixir Cost */}
                    {card.elixirCost && (
                      <div className="absolute top-1 left-1 w-6 h-7 flex items-center justify-center z-10">
                        <img 
                          src="/elixir-drop.png" 
                          alt="Elixir" 
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute text-white text-xs font-bold drop-shadow-md">
                          {card.elixirCost}
                        </span>
                      </div>
                    )}

                    <div className="aspect-[3/4] relative overflow-hidden">
                      <img
                        src={getCardImage(card)}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={`absolute bottom-0 left-0 right-0 h-5 ${getRarityColor(card.rarity)} opacity-80 flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">Lv {card.level}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Deck Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm mb-4">
                <div className={`p-2 rounded transition-colors duration-500 ${
                  isDark ? 'bg-black/20' : 'bg-white/60'
                }`}>
                  <p className="font-bold text-purple-400">{deckResult.analysis.averageElixir}</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg Elixir</p>
                </div>
                <div className={`p-2 rounded transition-colors duration-500 ${
                  isDark ? 'bg-black/20' : 'bg-white/60'
                }`}>
                  <p className="font-bold text-blue-400">{deckResult.analysis.averageLevel}</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Avg Level</p>
                </div>
                <div className={`p-2 rounded transition-colors duration-500 ${
                  isDark ? 'bg-black/20' : 'bg-white/60'
                }`}>
                  <p className="font-bold text-green-400">{deckResult.analysis.winConditionNames.length}</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Win Cons</p>
                </div>
                <div className={`p-2 rounded transition-colors duration-500 ${
                  isDark ? 'bg-black/20' : 'bg-white/60'
                }`}>
                  <p className="font-bold text-orange-400">{deckResult.analysis.spellCount}</p>
                  <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Spells</p>
                </div>
              </div>

              {/* AI Strategy & Tips */}
              {deckResult.aiGuidance && (
                <div className="space-y-4">
                  <div>
                    <h4 className={`text-md font-bold mb-2 ${isDark ? 'text-yellow-300' : 'text-yellow-600'}`}>
                      🎯 Strategy
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {deckResult.aiGuidance.strategy}
                    </p>
                  </div>
                  
                  {deckResult.aiGuidance.gameplayTips && deckResult.aiGuidance.gameplayTips.length > 0 && (
                    <div>
                      <h4 className={`text-md font-bold mb-2 ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                        ⚡ Gameplay Tips
                      </h4>
                      {deckResult.aiGuidance.gameplayTips.slice(0, 3).map((tip: string, i: number) => (
                        <p key={i} className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          • {tip}
                        </p>
                      ))}
                    </div>
                  )}

                  {deckResult.aiGuidance.strengths && deckResult.aiGuidance.strengths.length > 0 && (
                    <div>
                      <h4 className={`text-md font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-600'}`}>
                        💪 Deck Strengths
                      </h4>
                      {deckResult.aiGuidance.strengths.slice(0, 2).map((strength: string, i: number) => (
                        <p key={i} className={`text-sm mb-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          • {strength}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Upgrade Suggestions */}
              {deckResult.upgrades && deckResult.upgrades.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-600/30">
                  <h4 className={`text-md font-bold mb-3 ${isDark ? 'text-orange-300' : 'text-orange-600'}`}>
                    🔧 Upgrade Priority
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {deckResult.upgrades.slice(0, 3).map((upgrade, index) => (
                      <div key={upgrade.cardName} className={`p-2 rounded-lg transition-colors duration-500 ${
                        isDark ? 'bg-gray-700/30' : 'bg-gray-100/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {upgrade.priority}. {upgrade.cardName}
                          </span>
                          <span className="text-xs text-blue-400">
                            {upgrade.currentLevel}/{upgrade.maxLevel}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}