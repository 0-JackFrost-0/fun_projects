// Enhanced Battle Analysis and LLM Integration
import { DeckCreator, Card, DeckStrategy, DeckAnalysis } from './deckCreator';

export interface BattleResult {
  battleTime: string;
  type: string;
  isLadderTournament?: boolean;
  arena?: {
    id: number;
    name: string;
  };
  gameMode?: {
    id: number;
    name: string;
  };
  deckSelection?: string;
  team: Array<{
    tag: string;
    name: string;
    startingTrophies?: number;
    trophyChange?: number;
    crowns: number;
    kingTowerHitPoints?: number;
    princessTowersHitPoints?: number[];
    cards: Array<{
      name: string;
      id: number;
      level: number;
      maxLevel: number;
      elixirCost?: number;
      rarity: string;
    }>;
  }>;
  opponent: Array<{
    tag: string;
    name: string;
    startingTrophies?: number;
    trophyChange?: number;
    crowns: number;
    kingTowerHitPoints?: number;
    princessTowersHitPoints?: number[];
    cards: Array<{
      name: string;
      id: number;
      level: number;
      maxLevel: number;
      elixirCost?: number;
      rarity: string;
    }>;
  }>;
}

export interface BattleAnalysis {
  totalBattles: number;
  wins: number;
  losses: number;
  winRate: number;
  avgTrophyChange: number;
  
  // Performance metrics
  avgCrownsWon: number;
  avgCrownsLost: number;
  threeStarWins: number;
  closeGames: number; // 1-crown games
  
  // Card analysis
  mostUsedCards: Array<{
    name: string;
    usage: number;
    winRate: number;
    avgLevel: number;
  }>;
  
  bestPerformingCards: Array<{
    name: string;
    winRate: number;
    usage: number;
  }>;
  
  strugglingAgainst: Array<{
    cardName: string;
    lossRate: number;
    encounters: number;
  }>;
  
  // Deck patterns
  deckArchetypes: Array<{
    type: string;
    usage: number;
    winRate: number;
    avgElixir: number;
  }>;
  
  // Time and mode analysis
  bestGameModes: Array<{
    mode: string;
    winRate: number;
    battles: number;
  }>;
  
  trophyTrends: Array<{
    range: string;
    winRate: number;
    battles: number;
  }>;
  
  // Weaknesses and strengths
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface AIGuidance {
  summary: string;
  deckRecommendation: {
    strategy: string;
    explanation: string;
    keyCards: string[];
    playStyle: string;
  };
  gameplayTips: {
    general: string[];
    specific: string[];
    counters: Array<{
      enemy: string;
      strategy: string;
    }>;
  };
  upgradeAdvice: {
    priority: string[];
    reasoning: string;
  };
  practiceAdvice: string[];
}

export class EnhancedDeckCreator extends DeckCreator {
  
  async createDeckWithBattleAnalysis(
    cards: Card[], 
    battleLog: BattleResult[], 
    strategy: DeckStrategy = DeckStrategy.BALANCED
  ): Promise<{ 
    deck: Card[]; 
    analysis: DeckAnalysis; 
    battleAnalysis: BattleAnalysis;
    aiGuidance: AIGuidance;
  }> {
    
    // Analyze battle history
    const battleAnalysis = this.analyzeBattleHistory(battleLog);
    
    // Create deck based on battle insights
    const deckResult = this.createDeckWithInsights(cards, battleAnalysis, strategy);
    
    // Generate AI guidance
    const aiGuidance = await this.generateAIGuidance(
      deckResult.deck, 
      deckResult.analysis, 
      battleAnalysis
    );
    
    return {
      ...deckResult,
      battleAnalysis,
      aiGuidance
    };
  }

  private analyzeBattleHistory(battleLog: BattleResult[]): BattleAnalysis {
    if (!battleLog || battleLog.length === 0) {
      return this.getEmptyBattleAnalysis();
    }

    const totalBattles = battleLog.length;
    const playerBattles = battleLog.map(battle => ({
      ...battle,
      player: battle.team[0], // Assume first team member is the player
      opponent: battle.opponent[0]
    }));

    // Calculate basic stats
    const wins = playerBattles.filter(b => b.player.crowns > b.opponent.crowns).length;
    const losses = totalBattles - wins;
    const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0;

    // Trophy analysis
    const trophyChanges = playerBattles
      .filter(b => b.player.trophyChange !== undefined)
      .map(b => b.player.trophyChange || 0);
    const avgTrophyChange = trophyChanges.length > 0 
      ? trophyChanges.reduce((sum, change) => sum + change, 0) / trophyChanges.length 
      : 0;

    // Crown analysis
    const avgCrownsWon = playerBattles.reduce((sum, b) => sum + b.player.crowns, 0) / totalBattles;
    const avgCrownsLost = playerBattles.reduce((sum, b) => sum + b.opponent.crowns, 0) / totalBattles;
    const threeStarWins = playerBattles.filter(b => b.player.crowns === 3).length;
    const closeGames = playerBattles.filter(b => Math.abs(b.player.crowns - b.opponent.crowns) <= 1).length;

    // Card usage analysis
    const cardUsage = new Map<string, { uses: number; wins: number; totalLevel: number; count: number }>();
    
    playerBattles.forEach(battle => {
      const isWin = battle.player.crowns > battle.opponent.crowns;
      
      battle.player.cards.forEach(card => {
        const existing = cardUsage.get(card.name) || { uses: 0, wins: 0, totalLevel: 0, count: 0 };
        existing.uses++;
        if (isWin) existing.wins++;
        existing.totalLevel += card.level;
        existing.count++;
        cardUsage.set(card.name, existing);
      });
    });

    const mostUsedCards = Array.from(cardUsage.entries())
      .map(([name, stats]) => ({
        name,
        usage: stats.uses,
        winRate: stats.uses > 0 ? (stats.wins / stats.uses) * 100 : 0,
        avgLevel: stats.totalLevel / stats.count
      }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10);

    const bestPerformingCards = Array.from(cardUsage.entries())
      .filter(([_, stats]) => stats.uses >= 3) // At least 3 uses for statistical relevance
      .map(([name, stats]) => ({
        name,
        winRate: (stats.wins / stats.uses) * 100,
        usage: stats.uses
      }))
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10);

    // Opponent card analysis (what player struggles against)
    const opponentCards = new Map<string, { encounters: number; losses: number }>();
    
    playerBattles.forEach(battle => {
      const isLoss = battle.player.crowns < battle.opponent.crowns;
      
      if (isLoss) {
        battle.opponent.cards.forEach(card => {
          const existing = opponentCards.get(card.name) || { encounters: 0, losses: 0 };
          existing.encounters++;
          existing.losses++;
          opponentCards.set(card.name, existing);
        });
      } else {
        battle.opponent.cards.forEach(card => {
          const existing = opponentCards.get(card.name) || { encounters: 0, losses: 0 };
          existing.encounters++;
          opponentCards.set(card.name, existing);
        });
      }
    });

    const strugglingAgainst = Array.from(opponentCards.entries())
      .filter(([_, stats]) => stats.encounters >= 3)
      .map(([cardName, stats]) => ({
        cardName,
        lossRate: (stats.losses / stats.encounters) * 100,
        encounters: stats.encounters
      }))
      .sort((a, b) => b.lossRate - a.lossRate)
      .slice(0, 8);

    // Game mode analysis
    const gameModes = new Map<string, { battles: number; wins: number }>();
    playerBattles.forEach(battle => {
      const mode = battle.gameMode?.name || 'Unknown';
      const isWin = battle.player.crowns > battle.opponent.crowns;
      const existing = gameModes.get(mode) || { battles: 0, wins: 0 };
      existing.battles++;
      if (isWin) existing.wins++;
      gameModes.set(mode, existing);
    });

    const bestGameModes = Array.from(gameModes.entries())
      .map(([mode, stats]) => ({
        mode,
        winRate: stats.battles > 0 ? (stats.wins / stats.battles) * 100 : 0,
        battles: stats.battles
      }))
      .sort((a, b) => b.winRate - a.winRate);

    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    if (winRate > 60) strengths.push("Strong overall performance");
    if (avgCrownsWon > 1.5) strengths.push("Good offensive pressure");
    if (threeStarWins / totalBattles > 0.3) strengths.push("Excellent at decisive victories");
    if (avgTrophyChange > 10) strengths.push("Consistently gaining trophies");

    if (winRate < 40) weaknesses.push("Below average win rate");
    if (avgCrownsLost > 1.5) weaknesses.push("Struggling with defense");
    if (closeGames / totalBattles > 0.6) weaknesses.push("Too many close games - need more decisive wins");
    if (avgTrophyChange < -5) weaknesses.push("Losing trophies consistently");

    // Generate recommendations
    if (winRate < 50) {
      recommendations.push("Focus on improving card levels and deck synergy");
    }
    if (avgCrownsLost > 1.5) {
      recommendations.push("Add more defensive cards to your deck");
    }
    if (mostUsedCards.length > 0 && mostUsedCards[0].winRate < 50) {
      recommendations.push(`Consider replacing ${mostUsedCards[0].name} - low win rate despite high usage`);
    }

    return {
      totalBattles,
      wins,
      losses,
      winRate,
      avgTrophyChange,
      avgCrownsWon,
      avgCrownsLost,
      threeStarWins,
      closeGames,
      mostUsedCards,
      bestPerformingCards,
      strugglingAgainst,
      deckArchetypes: [], // Would need more complex analysis
      bestGameModes,
      trophyTrends: [], // Would need trophy history over time
      strengths,
      weaknesses,
      recommendations
    };
  }

  private createDeckWithInsights(
    cards: Card[], 
    battleAnalysis: BattleAnalysis, 
    strategy: DeckStrategy
  ): { deck: Card[]; analysis: DeckAnalysis } {
    
    // Prioritize cards that have high win rates
    const cardPriorities = new Map<string, number>();
    
    // Boost priority for well-performing cards
    battleAnalysis.bestPerformingCards.forEach((cardStat, index) => {
      const card = cards.find(c => c.name === cardStat.name);
      if (card) {
        cardPriorities.set(card.name, 100 - index * 5); // Higher priority for better performing cards
      }
    });

    // Reduce priority for cards player struggles against (likely overused without success)
    battleAnalysis.mostUsedCards
      .filter(cardStat => cardStat.winRate < 45)
      .forEach(cardStat => {
        cardPriorities.set(cardStat.name, -50); // Negative priority
      });

    // Create deck with enhanced logic
    const result = this.createDeck(cards, strategy);
    
    // Apply battle insights to deck selection
    const enhancedDeck = this.optimizeDeckWithBattleData(result.deck, cards, battleAnalysis, cardPriorities);
    const enhancedAnalysis = this.analyzeDeck(enhancedDeck);

    return {
      deck: enhancedDeck,
      analysis: enhancedAnalysis
    };
  }

  private optimizeDeckWithBattleData(
    originalDeck: Card[], 
    allCards: Card[], 
    battleAnalysis: BattleAnalysis,
    cardPriorities: Map<string, number>
  ): Card[] {
    
    const optimizedDeck = [...originalDeck];
    
    // Try to replace underperforming cards
    for (let i = 0; i < optimizedDeck.length; i++) {
      const currentCard = optimizedDeck[i];
      const priority = cardPriorities.get(currentCard.name) || 0;
      
      if (priority < 0) { // This card has poor performance
        // Find a better replacement of similar role/cost
        const replacement = this.findBetterReplacement(currentCard, allCards, cardPriorities, optimizedDeck);
        if (replacement) {
          optimizedDeck[i] = replacement;
        }
      }
    }
    
    return optimizedDeck;
  }

  private findBetterReplacement(
    currentCard: Card, 
    allCards: Card[], 
    cardPriorities: Map<string, number>,
    currentDeck: Card[]
  ): Card | null {
    
    // Find cards of similar elixir cost and type
    const candidates = allCards.filter(card => 
      !currentDeck.includes(card) && // Not already in deck
      Math.abs(card.elixirCost - currentCard.elixirCost) <= 1 && // Similar cost
      card.cardType === currentCard.cardType && // Same type
      (cardPriorities.get(card.name) || 0) > (cardPriorities.get(currentCard.name) || 0) // Better priority
    );

    if (candidates.length === 0) return null;

    // Return the candidate with highest priority
    return candidates.reduce((best, candidate) => {
      const bestPriority = cardPriorities.get(best.name) || 0;
      const candidatePriority = cardPriorities.get(candidate.name) || 0;
      return candidatePriority > bestPriority ? candidate : best;
    });
  }

  private async generateAIGuidance(
    deck: Card[], 
    deckAnalysis: DeckAnalysis, 
    battleAnalysis: BattleAnalysis
  ): Promise<AIGuidance> {
    
    try {
      const prompt = this.buildGuidancePrompt(deck, deckAnalysis, battleAnalysis);
      const response = await this.callGroqAPI(prompt);
      return this.parseAIResponse(response);
    } catch (error) {
      console.error('AI Guidance generation failed:', error);
      return this.getFallbackGuidance(deck, deckAnalysis, battleAnalysis);
    }
  }

  private buildGuidancePrompt(deck: Card[], deckAnalysis: DeckAnalysis, battleAnalysis: BattleAnalysis): string {
    return `You are an expert Clash Royale coach analyzing a player's performance and deck. Provide detailed guidance based on their battle history and current deck.

PLAYER STATISTICS:
- Win Rate: ${battleAnalysis.winRate.toFixed(1)}%
- Average Crowns Won: ${battleAnalysis.avgCrownsWon.toFixed(1)}
- Average Crowns Lost: ${battleAnalysis.avgCrownsLost.toFixed(1)}
- Trophy Change: ${battleAnalysis.avgTrophyChange > 0 ? '+' : ''}${battleAnalysis.avgTrophyChange.toFixed(0)}

CURRENT DECK:
${deck.map(card => `- ${card.name} (Level ${card.level}, ${card.elixirCost} elixir)`).join('\n')}

DECK STATS:
- Average Elixir: ${deckAnalysis.averageElixir}
- Win Conditions: ${deckAnalysis.winConditionNames.join(', ') || 'None detected'}
- Spells: ${deckAnalysis.spellCount}

BEST PERFORMING CARDS:
${battleAnalysis.bestPerformingCards.slice(0, 5).map(card => `- ${card.name}: ${card.winRate.toFixed(1)}% win rate`).join('\n')}

STRUGGLING AGAINST:
${battleAnalysis.strugglingAgainst.slice(0, 5).map(card => `- ${card.cardName}: ${card.lossRate.toFixed(1)}% loss rate`).join('\n')}

IDENTIFIED WEAKNESSES:
${battleAnalysis.weaknesses.map(weakness => `- ${weakness}`).join('\n')}

Please provide a comprehensive analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence overview of the player's performance and main areas for improvement",
  "deckRecommendation": {
    "strategy": "Overall strategy this deck should follow (aggro/control/beatdown/cycle)",
    "explanation": "Why this deck works and how it addresses the player's weaknesses",
    "keyCards": ["card1", "card2", "card3"],
    "playStyle": "How to play this deck effectively"
  },
  "gameplayTips": {
    "general": ["tip1", "tip2", "tip3"],
    "specific": ["specific tip for this deck", "another specific tip"],
    "counters": [
      {"enemy": "enemy card name", "strategy": "how to counter it"},
      {"enemy": "enemy card name 2", "strategy": "how to counter it"}
    ]
  },
  "upgradeAdvice": {
    "priority": ["card to upgrade first", "card to upgrade second"],
    "reasoning": "Why these upgrades will have the biggest impact"
  },
  "practiceAdvice": ["advice1", "advice2", "advice3"]
}

Focus on actionable advice that will immediately improve their performance. Be specific about timing, placement, and strategic decisions.`;
  }

  private async callGroqAPI(prompt: string): Promise<string> {
    // Check if Groq API key is available
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Updated to current available model
        messages: [
          {
            role: 'system',
            content: 'You are an expert Clash Royale coach and strategist. Provide detailed, actionable gameplay advice based on player statistics and battle history. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private parseAIResponse(response: string): AIGuidance {
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in response');
      
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AIGuidance;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw error;
    }
  }

  private getFallbackGuidance(deck: Card[], deckAnalysis: DeckAnalysis, battleAnalysis: BattleAnalysis): AIGuidance {
    return {
      summary: `Based on your ${battleAnalysis.winRate.toFixed(1)}% win rate, focus on improving deck synergy and card levels.`,
      deckRecommendation: {
        strategy: "balanced",
        explanation: "This deck provides a good mix of offense and defense suitable for your current performance level.",
        keyCards: deck.slice(0, 3).map(c => c.name),
        playStyle: "Focus on positive elixir trades and counter-attacks."
      },
      gameplayTips: {
        general: [
          "Always count elixir and track opponent's cards",
          "Don't overcommit on offense",
          "Practice proper card placement timing"
        ],
        specific: [
          "Use your win conditions when you have an elixir advantage",
          "Save spells for maximum value targets"
        ],
        counters: [
          { enemy: "Hog Rider", strategy: "Place building in center to pull, then counter-push" },
          { enemy: "Balloon", strategy: "Use air-targeting troops immediately" }
        ]
      },
      upgradeAdvice: {
        priority: deck.slice(0, 2).map(c => c.name),
        reasoning: "Focus on upgrading your main win conditions first for maximum impact."
      },
      practiceAdvice: [
        "Watch replays of your losses to identify mistakes",
        "Practice specific matchups in friendly battles",
        "Learn optimal card placement positions"
      ]
    };
  }

  public getEmptyBattleAnalysis(): BattleAnalysis {
    return {
      totalBattles: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgTrophyChange: 0,
      avgCrownsWon: 0,
      avgCrownsLost: 0,
      threeStarWins: 0,
      closeGames: 0,
      mostUsedCards: [],
      bestPerformingCards: [],
      strugglingAgainst: [],
      deckArchetypes: [],
      bestGameModes: [],
      trophyTrends: [],
      strengths: [],
      weaknesses: [],
      recommendations: []
    };
  }
}
