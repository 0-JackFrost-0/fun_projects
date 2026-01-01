import { NextRequest, NextResponse } from "next/server";
import { DeckCreator, DeckStrategy } from "@/utils/deckCreator";
import { EnhancedDeckCreator } from "@/utils/enhancedDeckCreator";

export async function POST(request: NextRequest) {
  try {
    const {
      playerData,
      strategy,
      includeBattleAnalysis = false,
    } = await request.json();

    if (!playerData || !playerData.cards) {
      return NextResponse.json(
        { success: false, error: "Player data with cards is required" },
        { status: 400 }
      );
    }

    const deckCreator = includeBattleAnalysis
      ? new EnhancedDeckCreator()
      : new DeckCreator();
    const cards = deckCreator.parsePlayerCards(playerData);

    if (cards.length === 0) {
      return NextResponse.json(
        { success: false, error: "No valid cards found for this player" },
        { status: 400 }
      );
    }

    // If battle analysis is requested, fetch battle log and use enhanced creator
    if (includeBattleAnalysis) {
      try {
        const enhancedCreator = deckCreator as EnhancedDeckCreator;

        // Fetch battle log
        const battleLogResponse = await fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/battlelog/${encodeURIComponent(playerData.tag)}`,
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

        // If specific strategy is requested
        if (strategy && Object.values(DeckStrategy).includes(strategy)) {
          const result = await enhancedCreator.createDeckWithBattleAnalysis(
            cards,
            battleLog,
            strategy as DeckStrategy
          );
          return NextResponse.json({
            success: true,
            data: {
              strategy,
              ...result,
            },
          });
        }

        // Return all strategies with battle analysis
        const allStrategies: { [key: string]: any } = {};

        for (const strategyKey of Object.values(DeckStrategy)) {
          try {
            console.log(`Creating deck for strategy: ${strategyKey}`);
            const result = await enhancedCreator.createDeckWithBattleAnalysis(
              cards,
              battleLog,
              strategyKey as DeckStrategy
            );
            allStrategies[strategyKey] = result;
          } catch (error) {
            console.error(`Failed to create ${strategyKey} strategy:`, error);
            // Fallback to basic deck creation
            try {
              const basicResult = enhancedCreator.createDeck(
                cards,
                strategyKey as DeckStrategy
              );
              allStrategies[strategyKey] = {
                deck: basicResult.deck,
                analysis: basicResult.analysis,
                battleAnalysis: (
                  enhancedCreator as any
                ).getEmptyBattleAnalysis(),
                aiGuidance: null,
                upgrades: enhancedCreator.suggestUpgrades(basicResult.deck),
              };
            } catch (basicError) {
              console.error(
                `Even basic deck creation failed for ${strategyKey}:`,
                basicError
              );
              // Skip this strategy if everything fails
            }
          }
        }

        return NextResponse.json({
          success: true,
          data: {
            strategies: allStrategies,
            totalCards: cards.length,
            battleLogSize: battleLog.length,
          },
        });
      } catch (error) {
        console.error(
          "Enhanced deck creation failed, falling back to basic:",
          error
        );
        // Fall back to basic deck creation if battle analysis fails
      }
    }

    // Basic deck creation (original functionality)
    if (strategy && Object.values(DeckStrategy).includes(strategy)) {
      const result = deckCreator.createDeck(cards, strategy as DeckStrategy);
      return NextResponse.json({
        success: true,
        data: {
          strategy,
          deck: result.deck,
          analysis: result.analysis,
          upgrades: deckCreator.suggestUpgrades(result.deck),
        },
      });
    }

    // Return all strategies (basic)
    const allStrategies = deckCreator.getAllStrategies(cards);
    const strategiesWithUpgrades = Object.entries(allStrategies).reduce(
      (acc, [strategyName, result]) => {
        acc[strategyName] = {
          ...result,
          upgrades: deckCreator.suggestUpgrades(result.deck),
        };
        return acc;
      },
      {} as any
    );

    return NextResponse.json({
      success: true,
      data: {
        strategies: strategiesWithUpgrades,
        totalCards: cards.length,
      },
    });
  } catch (error) {
    console.error("Deck creation error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to create deck suggestions",
      },
      { status: 500 }
    );
  }
}
