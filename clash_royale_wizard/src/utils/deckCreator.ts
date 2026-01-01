// Deck Creator - TypeScript version for Next.js frontend

export enum CardType {
  TROOP = "troop",
  SPELL = "spell",
  BUILDING = "building",
}

export enum DeckStrategy {
  BALANCED = "balanced",
  AGGRO = "aggro",
  CONTROL = "control",
  SPELL_HEAVY = "spell_heavy",
  HIGH_LEVEL = "high_level",
  CYCLE = "cycle",
  BEATDOWN = "beatdown",
}

export interface Card {
  id: number;
  name: string;
  level: number;
  maxLevel: number;
  elixirCost: number;
  rarity: string;
  count: number;
  cardType: CardType;
  iconUrls?: {
    medium?: string;
  };
}

export interface DeckAnalysis {
  deckSize: number;
  totalElixir: number;
  averageElixir: number;
  averageLevel: number;
  spellCount: number;
  buildingCount: number;
  troopCount: number;
  winConditions: number;
  winConditionNames: string[];
  costDistribution: { [key: number]: number };
  deckScore: number;
  cards: Array<{
    name: string;
    level: number;
    elixir: number;
    rarity: string;
  }>;
}

export interface UpgradeSuggestion {
  cardName: string;
  currentLevel: number;
  maxLevel: number;
  priority: number;
  reason: string;
}

export class DeckCreator {
  private deckSize = 8;
  private idealAvgElixir = 3.8;

  private winConditions = [
    "Hog Rider",
    "Royal Giant",
    "Giant",
    "Golem",
    "P.E.K.K.A",
    "Lava Hound",
    "Balloon",
    "X-Bow",
    "Mortar",
    "Miner",
    "Graveyard",
    "Three Musketeers",
    "Royal Recruits",
    "Ram Rider",
  ];

  private spells = [
    "Fireball",
    "Lightning",
    "Rocket",
    "Arrows",
    "Zap",
    "The Log",
    "Tornado",
    "Freeze",
    "Rage",
    "Clone",
    "Heal",
    "Mirror",
    "Poison",
    "Snowball",
    "Barbarian Barrel",
    "Earthquake",
  ];

  private buildings = [
    "Cannon",
    "Tesla",
    "Inferno Tower",
    "Bomb Tower",
    "X-Bow",
    "Mortar",
    "Elixir Collector",
    "Goblin Hut",
    "Barbarian Hut",
    "Tombstone",
    "Furnace",
    "Goblin Drill",
  ];

  private cycleCards = [
    "Ice Spirit",
    "Skeletons",
    "Fire Spirit",
    "Heal Spirit",
    "Bats",
    "Spear Goblins",
    "Goblins",
  ];

  private tanks = [
    "Giant",
    "Royal Giant",
    "Golem",
    "Lava Hound",
    "P.E.K.K.A",
    "Mega Knight",
    "Electro Giant",
    "Goblin Giant",
  ];

  private antiAir = [
    "Musketeer",
    "Archers",
    "Minions",
    "Minion Horde",
    "Baby Dragon",
    "Wizard",
    "Electro Wizard",
    "Ice Wizard",
    "Tesla",
    "Inferno Tower",
  ];

  parsePlayerCards(playerData: any): Card[] {
    const cards: Card[] = [];

    for (const cardData of playerData.cards || []) {
      let cardType = CardType.TROOP; // Default
      if (this.spells.includes(cardData.name)) {
        cardType = CardType.SPELL;
      } else if (this.buildings.includes(cardData.name)) {
        cardType = CardType.BUILDING;
      }

      const card: Card = {
        id: cardData.id,
        name: cardData.name,
        level: cardData.level,
        maxLevel: cardData.maxLevel,
        elixirCost: cardData.elixirCost || 3,
        rarity: cardData.rarity,
        count: cardData.count || 0,
        cardType,
        iconUrls: cardData.iconUrls,
      };
      cards.push(card);
    }

    return cards;
  }

  createDeck(
    cards: Card[],
    strategy: DeckStrategy = DeckStrategy.BALANCED
  ): { deck: Card[]; analysis: DeckAnalysis } {
    let selectedCards: Card[] = [];

    switch (strategy) {
      case DeckStrategy.BALANCED:
        selectedCards = this.createBalancedDeck(cards);
        break;
      case DeckStrategy.AGGRO:
        selectedCards = this.createAggroDeck(cards);
        break;
      case DeckStrategy.CONTROL:
        selectedCards = this.createControlDeck(cards);
        break;
      case DeckStrategy.SPELL_HEAVY:
        selectedCards = this.createSpellHeavyDeck(cards);
        break;
      case DeckStrategy.HIGH_LEVEL:
        selectedCards = this.createHighLevelDeck(cards);
        break;
      case DeckStrategy.CYCLE:
        selectedCards = this.createCycleDeck(cards);
        break;
      case DeckStrategy.BEATDOWN:
        selectedCards = this.createBeatdownDeck(cards);
        break;
      default:
        selectedCards = this.createBalancedDeck(cards);
    }

    const analysis = this.analyzeDeck(selectedCards);
    return { deck: selectedCards, analysis };
  }

  private createBalancedDeck(cards: Card[]): Card[] {
    const selectedCards: Card[] = [];

    // 1. Add a win condition
    const winConditionCards = cards.filter((c) =>
      this.winConditions.includes(c.name)
    );
    if (winConditionCards.length > 0) {
      const winCondition = winConditionCards.reduce((prev, curr) =>
        curr.level > prev.level ? curr : prev
      );
      selectedCards.push(winCondition);
    }

    // 2. Add spells
    const spellCards = cards.filter(
      (c) => this.spells.includes(c.name) && !selectedCards.includes(c)
    );
    spellCards.sort((a, b) => b.level - a.level);
    selectedCards.push(...spellCards.slice(0, 2));

    // 3. Add anti-air unit
    const antiAirCards = cards.filter(
      (c) => this.antiAir.includes(c.name) && !selectedCards.includes(c)
    );
    if (antiAirCards.length > 0) {
      const antiAir = antiAirCards.reduce((prev, curr) =>
        curr.level > prev.level ? curr : prev
      );
      selectedCards.push(antiAir);
    }

    // 4. Add a building
    const buildingCards = cards.filter(
      (c) => this.buildings.includes(c.name) && !selectedCards.includes(c)
    );
    if (buildingCards.length > 0) {
      const building = buildingCards.reduce((prev, curr) =>
        curr.level > prev.level ? curr : prev
      );
      selectedCards.push(building);
    }

    // 5. Fill remaining slots
    const remainingCards = cards.filter((c) => !selectedCards.includes(c));
    remainingCards.sort((a, b) => b.level - a.level);

    while (selectedCards.length < this.deckSize && remainingCards.length > 0) {
      const currentAvg =
        selectedCards.reduce((sum, c) => sum + c.elixirCost, 0) /
        selectedCards.length;

      let candidate: Card;
      if (currentAvg > this.idealAvgElixir) {
        candidate = remainingCards.reduce((prev, curr) =>
          curr.elixirCost < prev.elixirCost ||
          (curr.elixirCost === prev.elixirCost && curr.level > prev.level)
            ? curr
            : prev
        );
      } else {
        candidate = remainingCards.reduce((prev, curr) =>
          curr.level > prev.level ||
          (curr.level === prev.level && curr.elixirCost > prev.elixirCost)
            ? curr
            : prev
        );
      }

      selectedCards.push(candidate);
      remainingCards.splice(remainingCards.indexOf(candidate), 1);
    }

    return selectedCards.slice(0, this.deckSize);
  }

  private createAggroDeck(cards: Card[]): Card[] {
    const selectedCards: Card[] = [];
    const availableCards = [...cards].sort(
      (a, b) => a.elixirCost - b.elixirCost || b.level - a.level
    );

    // Add cycle cards
    const cycleAvailable = availableCards.filter((c) =>
      this.cycleCards.includes(c.name)
    );
    selectedCards.push(...cycleAvailable.slice(0, 3));

    // Add fast win condition
    const fastWins = availableCards.filter(
      (c) =>
        ["Hog Rider", "Miner", "Balloon", "Ram Rider"].includes(c.name) &&
        !selectedCards.includes(c)
    );
    if (fastWins.length > 0) {
      selectedCards.push(fastWins[0]);
    }

    // Add spells
    const spellCards = availableCards.filter(
      (c) => this.spells.includes(c.name) && !selectedCards.includes(c)
    );
    selectedCards.push(...spellCards.slice(0, 2));

    // Fill with low-cost troops
    const remaining = availableCards.filter(
      (c) => !selectedCards.includes(c) && c.elixirCost <= 4
    );
    selectedCards.push(
      ...remaining.slice(0, this.deckSize - selectedCards.length)
    );

    // Fill any remaining slots
    if (selectedCards.length < this.deckSize) {
      const remainingAll = availableCards.filter(
        (c) => !selectedCards.includes(c)
      );
      selectedCards.push(
        ...remainingAll.slice(0, this.deckSize - selectedCards.length)
      );
    }

    return selectedCards.slice(0, this.deckSize);
  }

  private createControlDeck(cards: Card[]): Card[] {
    const selectedCards: Card[] = [];

    // Add defensive buildings
    const defensiveBuildings = cards.filter((c) =>
      ["Tesla", "Inferno Tower", "Cannon"].includes(c.name)
    );
    if (defensiveBuildings.length > 0) {
      selectedCards.push(
        defensiveBuildings.reduce((prev, curr) =>
          curr.level > prev.level ? curr : prev
        )
      );
    }

    // Add multiple spells
    const spellCards = cards.filter((c) => this.spells.includes(c.name));
    spellCards.sort((a, b) => b.level - a.level);
    selectedCards.push(...spellCards.slice(0, 3));

    // Add heavy win condition
    const heavyWins = cards.filter(
      (c) =>
        ["P.E.K.K.A", "Mega Knight", "Golem"].includes(c.name) &&
        !selectedCards.includes(c)
    );
    if (heavyWins.length > 0) {
      selectedCards.push(
        heavyWins.reduce((prev, curr) =>
          curr.level > prev.level ? curr : prev
        )
      );
    }

    // Fill remaining
    const remaining = cards.filter((c) => !selectedCards.includes(c));
    remaining.sort((a, b) => b.level - a.level);
    selectedCards.push(
      ...remaining.slice(0, this.deckSize - selectedCards.length)
    );

    return selectedCards.slice(0, this.deckSize);
  }

  private createSpellHeavyDeck(cards: Card[]): Card[] {
    const selectedCards: Card[] = [];

    // Add spells
    const spellCards = cards.filter((c) => this.spells.includes(c.name));
    spellCards.sort((a, b) => b.level - a.level);
    selectedCards.push(...spellCards.slice(0, 4));

    // Fill remaining
    const remaining = cards.filter((c) => !selectedCards.includes(c));
    remaining.sort((a, b) => b.level - a.level);
    selectedCards.push(
      ...remaining.slice(0, this.deckSize - selectedCards.length)
    );

    return selectedCards.slice(0, this.deckSize);
  }

  private createHighLevelDeck(cards: Card[]): Card[] {
    const sortedCards = [...cards].sort(
      (a, b) => b.level - a.level || b.level / b.maxLevel - a.level / a.maxLevel
    );
    return sortedCards.slice(0, this.deckSize);
  }

  private createCycleDeck(cards: Card[]): Card[] {
    const selectedCards: Card[] = [];

    // Add cycle cards
    const cycleAvailable = cards.filter((c) =>
      this.cycleCards.includes(c.name)
    );
    selectedCards.push(...cycleAvailable.slice(0, 4));

    // Fill with low-cost cards
    const remaining = cards.filter(
      (c) => !selectedCards.includes(c) && c.elixirCost <= 3
    );
    remaining.sort((a, b) => a.elixirCost - b.elixirCost || b.level - a.level);
    selectedCards.push(
      ...remaining.slice(0, this.deckSize - selectedCards.length)
    );

    // Fill remaining if needed
    if (selectedCards.length < this.deckSize) {
      const remainingAll = cards.filter((c) => !selectedCards.includes(c));
      remainingAll.sort((a, b) => a.elixirCost - b.elixirCost);
      selectedCards.push(
        ...remainingAll.slice(0, this.deckSize - selectedCards.length)
      );
    }

    return selectedCards.slice(0, this.deckSize);
  }

  private createBeatdownDeck(cards: Card[]): Card[] {
    const selectedCards: Card[] = [];

    // Add tank
    const tankCards = cards.filter((c) => this.tanks.includes(c.name));
    if (tankCards.length > 0) {
      selectedCards.push(
        tankCards.reduce((prev, curr) =>
          curr.level > prev.level ? curr : prev
        )
      );
    }

    // Add support troops
    const supportTroops = cards.filter(
      (c) =>
        ["Wizard", "Baby Dragon", "Musketeer", "Archers"].includes(c.name) &&
        !selectedCards.includes(c)
    );
    selectedCards.push(...supportTroops.slice(0, 2));

    // Add spells
    const spellCards = cards.filter(
      (c) => this.spells.includes(c.name) && !selectedCards.includes(c)
    );
    selectedCards.push(...spellCards.slice(0, 2));

    // Fill remaining
    const remaining = cards.filter((c) => !selectedCards.includes(c));
    remaining.sort((a, b) => b.level - a.level);
    selectedCards.push(
      ...remaining.slice(0, this.deckSize - selectedCards.length)
    );

    return selectedCards.slice(0, this.deckSize);
  }

  protected analyzeDeck(deck: Card[]): DeckAnalysis {
    if (deck.length === 0) {
      return {
        deckSize: 0,
        totalElixir: 0,
        averageElixir: 0,
        averageLevel: 0,
        spellCount: 0,
        buildingCount: 0,
        troopCount: 0,
        winConditions: 0,
        winConditionNames: [],
        costDistribution: {},
        deckScore: 0,
        cards: [],
      };
    }

    const totalElixir = deck.reduce((sum, card) => sum + card.elixirCost, 0);
    const avgElixir = totalElixir / deck.length;
    const avgLevel =
      deck.reduce((sum, card) => sum + card.level, 0) / deck.length;

    const spellCount = deck.filter((c) => c.cardType === CardType.SPELL).length;
    const buildingCount = deck.filter(
      (c) => c.cardType === CardType.BUILDING
    ).length;
    const troopCount = deck.filter((c) => c.cardType === CardType.TROOP).length;

    const winConditionsInDeck = deck.filter((c) =>
      this.winConditions.includes(c.name)
    );

    const costDistribution: { [key: number]: number } = {};
    deck.forEach((card) => {
      costDistribution[card.elixirCost] =
        (costDistribution[card.elixirCost] || 0) + 1;
    });

    // Calculate deck score
    let score = 0;
    score += Math.min(winConditionsInDeck.length, 2) * 20;
    score += Math.min(spellCount, 3) * 15;
    score += avgLevel * 5;
    score += Math.max(0, 20 - Math.abs(avgElixir - this.idealAvgElixir) * 10);

    return {
      deckSize: deck.length,
      totalElixir,
      averageElixir: Math.round(avgElixir * 10) / 10,
      averageLevel: Math.round(avgLevel * 10) / 10,
      spellCount,
      buildingCount,
      troopCount,
      winConditions: winConditionsInDeck.length,
      winConditionNames: winConditionsInDeck.map((c) => c.name),
      costDistribution,
      deckScore: Math.round(score * 10) / 10,
      cards: deck.map((c) => ({
        name: c.name,
        level: c.level,
        elixir: c.elixirCost,
        rarity: c.rarity,
      })),
    };
  }

  getAllStrategies(cards: Card[]): {
    [key: string]: { deck: Card[]; analysis: DeckAnalysis };
  } {
    const strategies: {
      [key: string]: { deck: Card[]; analysis: DeckAnalysis };
    } = {};

    Object.values(DeckStrategy).forEach((strategy) => {
      try {
        const result = this.createDeck(cards, strategy as DeckStrategy);
        strategies[strategy] = result;
      } catch (error) {
        strategies[strategy] = {
          deck: [],
          analysis: {
            deckSize: 0,
            totalElixir: 0,
            averageElixir: 0,
            averageLevel: 0,
            spellCount: 0,
            buildingCount: 0,
            troopCount: 0,
            winConditions: 0,
            winConditionNames: [],
            costDistribution: {},
            deckScore: 0,
            cards: [],
          },
        };
      }
    });

    return strategies;
  }

  suggestUpgrades(deck: Card[]): UpgradeSuggestion[] {
    const suggestions: UpgradeSuggestion[] = [];
    const sortedDeck = [...deck].sort(
      (a, b) => a.level - b.level || a.level / a.maxLevel - b.level / b.maxLevel
    );

    for (let i = 0; i < Math.min(3, sortedDeck.length); i++) {
      const card = sortedDeck[i];
      suggestions.push({
        cardName: card.name,
        currentLevel: card.level,
        maxLevel: card.maxLevel,
        priority: i + 1,
        reason: this.getUpgradeReason(card, deck),
      });
    }

    return suggestions;
  }

  private getUpgradeReason(card: Card, deck: Card[]): string {
    if (this.winConditions.includes(card.name)) {
      return `Win condition - ${card.name} is crucial for your deck's success`;
    } else if (card.cardType === CardType.SPELL) {
      return `Spell upgrade - Higher level ${card.name} deals more damage`;
    } else if (this.tanks.includes(card.name)) {
      return `Tank upgrade - More HP for ${card.name} means better push survival`;
    } else {
      return `Support upgrade - Higher level ${card.name} improves overall deck strength`;
    }
  }
}
