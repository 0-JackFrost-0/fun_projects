import { NextRequest, NextResponse } from "next/server";

interface DetailedBattleStats {
  bestPerformingCard: string;
  worstPerformingCard: string; 
  unusedCards: string[];
  bestDefendedAgainst: string;
  worstDefendedAgainst: string;
  undefendedAgainst: string[];
  totalBattles: number;
  winRate: number;
  cardPerformance: { [cardName: string]: { wins: number; losses: number; usage: number } };
  opponentCardStats: { [cardName: string]: { encounters: number; wins: number; losses: number } };
}

export async function POST(request: NextRequest) {
  try {
    const { playerData } = await request.json();

    if (!playerData || !playerData.cards) {
      return NextResponse.json(
        { success: false, error: "Player data with cards is required" },
        { status: 400 }
      );
    }

    // Step 1: Fetch battle log
    const battleLogResponse = await fetch(
      `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/battlelog/${encodeURIComponent(playerData.tag)}`,
      {
        headers: {
          Authorization: request.headers.get("Authorization") || "",
        },
      }
    );

    let battleLog = [];
    if (battleLogResponse.ok) {
      const battleData = await battleLogResponse.json();
      battleLog = battleData.success ? battleData.data : [];
    }

    // Step 2: Analyze battle performance in detail
    const battleStats = analyzeBattlePerformance(battleLog, playerData.cards);

    // Step 3: Generate AI deck with detailed analysis
    const aiDeck = await generateAIDeck(playerData.cards, battleStats);

    return NextResponse.json({
      success: true,
      data: {
        deck: aiDeck.deck,
        analysis: aiDeck.analysis,
        battleAnalysis: {
          ...battleStats,
          battleLogSample: battleLog.slice(0, 10).map((battle: any) => ({
            battleTime: battle.battleTime,
            type: battle.type,
            isWin: battle.team[0].crowns > battle.opponent[0].crowns,
            playerCrowns: battle.team[0].crowns,
            opponentCrowns: battle.opponent[0].crowns,
            trophyChange: battle.team[0].trophyChange || 0,
            playerCards: battle.team[0].cards.map((card: any) => card.name),
            opponentCards: battle.opponent[0].cards.map((card: any) => card.name),
            gameMode: battle.gameMode?.name || 'Unknown'
          }))
        },
        aiGuidance: aiDeck.guidance,
        upgrades: aiDeck.upgrades
      }
    });

  } catch (error) {
    console.error("Smart deck creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create smart deck suggestion",
      },
      { status: 500 }
    );
  }
}

function analyzeBattlePerformance(battleLog: any[], playerCards: any[]): DetailedBattleStats {
  if (!battleLog || battleLog.length === 0) {
    return {
      bestPerformingCard: "No data",
      worstPerformingCard: "No data", 
      unusedCards: playerCards.map(c => c.name),
      bestDefendedAgainst: "No data",
      worstDefendedAgainst: "No data",
      undefendedAgainst: [],
      totalBattles: 0,
      winRate: 0,
      cardPerformance: {},
      opponentCardStats: {}
    };
  }

  const playerBattles = battleLog.map(battle => ({
    ...battle,
    player: battle.team[0],
    opponent: battle.opponent[0]
  }));

  // Track card performance (wins/losses when using each card)
  const cardPerformance: { [cardName: string]: { wins: number; losses: number; usage: number } } = {};
  
  // Track opponent card encounters (how well we defend against them)
  const opponentCardStats: { [cardName: string]: { encounters: number; wins: number; losses: number } } = {};

  playerBattles.forEach(battle => {
    const isWin = battle.player.crowns > battle.opponent.crowns;
    
    // Analyze player's card performance
    battle.player.cards.forEach((card: any) => {
      if (!cardPerformance[card.name]) {
        cardPerformance[card.name] = { wins: 0, losses: 0, usage: 0 };
      }
      cardPerformance[card.name].usage++;
      if (isWin) {
        cardPerformance[card.name].wins++;
      } else {
        cardPerformance[card.name].losses++;
      }
    });

    // Analyze opponent's cards (what we defend against)
    battle.opponent.cards.forEach((card: any) => {
      if (!opponentCardStats[card.name]) {
        opponentCardStats[card.name] = { encounters: 0, wins: 0, losses: 0 };
      }
      opponentCardStats[card.name].encounters++;
      if (isWin) {
        opponentCardStats[card.name].wins++; // We won against this card
      } else {
        opponentCardStats[card.name].losses++; // We lost against this card
      }
    });
  });

  // Calculate statistics
  const usedCards = Object.keys(cardPerformance);
  const allCardNames = playerCards.map(c => c.name);
  const unusedCards = allCardNames.filter(name => !usedCards.includes(name));

  // Find best/worst performing cards
  const cardWinRates = Object.entries(cardPerformance)
    .filter(([_, stats]) => stats.usage >= 3) // At least 3 uses for reliability
    .map(([name, stats]) => ({
      name,
      winRate: stats.wins / (stats.wins + stats.losses),
      usage: stats.usage
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const bestPerformingCard = cardWinRates.length > 0 ? cardWinRates[0].name : "No reliable data";
  const worstPerformingCard = cardWinRates.length > 0 ? cardWinRates[cardWinRates.length - 1].name : "No reliable data";

  // Find best/worst defended against cards
  const opponentWinRates = Object.entries(opponentCardStats)
    .filter(([_, stats]) => stats.encounters >= 3) // At least 3 encounters
    .map(([name, stats]) => ({
      name,
      defenseRate: stats.wins / stats.encounters, // How often we win against this card
      encounters: stats.encounters
    }))
    .sort((a, b) => b.defenseRate - a.defenseRate);

  const bestDefendedAgainst = opponentWinRates.length > 0 ? opponentWinRates[0].name : "No data";
  const worstDefendedAgainst = opponentWinRates.length > 0 ? opponentWinRates[opponentWinRates.length - 1].name : "No data";

  // Find cards we never defended against (that exist in meta but not encountered)
  const commonMetaCards = ["Hog Rider", "Balloon", "Mega Knight", "P.E.K.K.A", "Wizard", "Fireball"];
  const undefendedAgainst = commonMetaCards.filter(card => !opponentCardStats[card]);

  const totalBattles = playerBattles.length;
  const wins = playerBattles.filter(b => b.player.crowns > b.opponent.crowns).length;
  const winRate = totalBattles > 0 ? (wins / totalBattles) * 100 : 0;

  return {
    bestPerformingCard,
    worstPerformingCard,
    unusedCards: unusedCards.slice(0, 10), // Limit to prevent overwhelming LLM
    bestDefendedAgainst,
    worstDefendedAgainst, 
    undefendedAgainst,
    totalBattles,
    winRate,
    cardPerformance,
    opponentCardStats
  };
}

async function generateAIDeck(playerCards: any[], battleStats: DetailedBattleStats) {
  // Check if Groq API key is available
  if (!process.env.GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const prompt = `You are an expert Clash Royale deck builder and coach. Based on the player's battle statistics and card collection, create the optimal 8-card deck.

PLAYER BATTLE ANALYSIS:
- Total Battles: ${battleStats.totalBattles}
- Win Rate: ${battleStats.winRate.toFixed(1)}%
- Best Performing Card: ${battleStats.bestPerformingCard}
- Worst Performing Card: ${battleStats.worstPerformingCard}
- Best Defended Against: ${battleStats.bestDefendedAgainst}
- Worst Defended Against: ${battleStats.worstDefendedAgainst}
- Unused Cards: ${battleStats.unusedCards.join(', ')}
- Undefended Against: ${battleStats.undefendedAgainst.join(', ')}

AVAILABLE CARDS:
${playerCards.map(card => `- ${card.name} (Level ${card.level}/${card.maxLevel}, ${card.elixirCost} elixir, ${card.rarity})`).join('\n')}

TASK:
Create the perfect 8-card deck considering:
1. Use high-performing cards from battle history
2. Avoid/replace poor-performing cards
3. Include counters for cards they struggle against
4. Prioritize higher-level cards for power
5. Ensure balanced elixir curve (target 3.8 average)
6. Include win condition, spells, air defense

Respond in this exact JSON format:
{
  "deck": [
    {"name": "Card Name 1", "reason": "Why this card"},
    {"name": "Card Name 2", "reason": "Why this card"},
    {"name": "Card Name 3", "reason": "Why this card"},
    {"name": "Card Name 4", "reason": "Why this card"},
    {"name": "Card Name 5", "reason": "Why this card"},
    {"name": "Card Name 6", "reason": "Why this card"},
    {"name": "Card Name 7", "reason": "Why this card"},
    {"name": "Card Name 8", "reason": "Why this card"}
  ],
  "strategy": "Overall deck strategy and how to play it",
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "gameplayTips": ["Tip 1", "Tip 2", "Tip 3"],
  "upgradePriority": ["Card to upgrade first", "Card to upgrade second", "Card to upgrade third"]
}

IMPORTANT: Only use cards that exist in the available cards list. Ensure exactly 8 cards.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Clash Royale strategist. Always respond with valid JSON only.'
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
    throw new Error(`Groq API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const aiResponse = JSON.parse(data.choices[0].message.content);

  // Convert AI response to our format
  const selectedCards = aiResponse.deck.map((cardChoice: any) => {
    const card = playerCards.find(c => c.name === cardChoice.name);
    return card || null;
  }).filter(Boolean);

  // Calculate deck analysis
  const totalElixir = selectedCards.reduce((sum: number, card: any) => sum + card.elixirCost, 0);
  const avgElixir = selectedCards.length > 0 ? totalElixir / selectedCards.length : 0;
  const avgLevel = selectedCards.reduce((sum: number, card: any) => sum + card.level, 0) / selectedCards.length;

  return {
    deck: selectedCards,
    analysis: {
      averageElixir: Math.round(avgElixir * 10) / 10,
      averageLevel: Math.round(avgLevel * 10) / 10,
      deckScore: 85, // AI-generated decks get a good score
      winConditionNames: aiResponse.deck.filter((c: any) => 
        ["Hog Rider", "Giant", "Balloon", "P.E.K.K.A"].includes(c.name)
      ).map((c: any) => c.name),
      spellCount: aiResponse.deck.filter((c: any) => 
        ["Fireball", "Zap", "Arrows", "Lightning"].includes(c.name)
      ).length,
      buildingCount: 1,
      troopCount: selectedCards.length - 2
    },
    guidance: {
      strategy: aiResponse.strategy,
      strengths: aiResponse.strengths,
      gameplayTips: aiResponse.gameplayTips,
      cardReasons: aiResponse.deck.reduce((acc: any, card: any) => {
        acc[card.name] = card.reason;
        return acc;
      }, {})
    },
    upgrades: aiResponse.upgradePriority.map((cardName: string, index: number) => {
      const card = selectedCards.find((c: any) => c.name === cardName);
      return card ? {
        cardName: card.name,
        currentLevel: card.level,
        maxLevel: card.maxLevel,
        priority: index + 1,
        reason: `AI recommends upgrading for better performance`
      } : null;
    }).filter(Boolean)
  };
}
