// Card Colors Enum
const CardColor = {
    BLACK: { value: 0, name: 'Black', class: 'black' },
    RED: { value: 1, name: 'Red', class: 'red' },
    ORANGE: { value: 2, name: 'Orange', class: 'orange' },
    YELLOW: { value: 3, name: 'Yellow', class: 'yellow' },
    GREEN: { value: 4, name: 'Green', class: 'green' },
    BLUE: { value: 5, name: 'Blue', class: 'blue' },
    PURPLE: { value: 6, name: 'Purple', class: 'purple' },
    WHITE: { value: 7, name: 'White', class: 'white' },
    
    fromValue(value) {
        return Object.values(this).find(color => 
            color.value === Math.max(0, Math.min(7, Math.floor(value)))
        ) || this.BLACK;
    }
};

// Game Constants
const GAME_CONSTANTS = {
    STARTING_LIFE: 7,
    STARTING_HAND_SIZE: 3,
    DECK_SIZE: 10,
    MAX_HAND_SIZE: 10,
    MAX_CHAMPION_ZONE: 1,
    DRAW_PER_TURN: 1,
    MAX_PLAYS_PER_TURN: 2
};

// Game Phases
const GamePhase = {
    DRAW: 'DRAW',
    PLAY: 'PLAY',
    COMBAT: 'COMBAT',
    END: 'END',
    
    getNext: function(current) {
        const phases = [this.DRAW, this.PLAY, this.COMBAT, this.END];
        const currentIndex = phases.indexOf(current);
        return phases[(currentIndex + 1) % phases.length];
    }
};

// Game Results
const GameResult = {
    PLAYER_WIN: 'PLAYER_WIN',
    AI_WIN: 'AI_WIN',
    DRAW: 'DRAW'
};

// Card Effects
const CardEffect = {
    NONE: 'NONE',
    SHIELD: 'SHIELD',           // Prevents 1 damage when attacked
    DRAW: 'DRAW',              // Draw a card when played
    HEAL: 'HEAL',              // Heal 1 life point when played
    BOOST: 'BOOST',            // +1 to color value when attacking
    PEEK: 'PEEK',              // Look at top card of deck
    RAGE: 'RAGE',              // Double damage when attacking
    STEALTH: 'STEALTH',        // Cannot be blocked on first attack
    DIVINE_SHIELD: 'DIVINE_SHIELD', // Prevents all damage when first attacked
    SPELL_MASTER: 'SPELL_MASTER',   // Copy the effect of the last card played
    TSUNAMI: 'TSUNAMI',        // Return all other cards to their owners hands
    
    getDescription: function(effect) {
        const descriptions = {
            [this.NONE]: 'No effect',
            [this.SHIELD]: 'Prevents 1 damage when attacked',
            [this.DRAW]: 'Draw a card when played',
            [this.HEAL]: 'Heal 1 life point when played',
            [this.BOOST]: '+1 to color value when attacking',
            [this.PEEK]: 'Look at top card of deck when played',
            [this.RAGE]: 'Double damage when attacking',
            [this.STEALTH]: 'Cannot be blocked on first attack',
            [this.DIVINE_SHIELD]: 'Prevents all damage when first attacked',
            [this.SPELL_MASTER]: 'Copy the effect of the last card played',
            [this.TSUNAMI]: 'Return all other cards to their owners hands'
        };
        return descriptions[effect] || 'Unknown effect';
    }
};

// Local Storage Keys
const StorageKeys = {
    USER_DATA: 'cardGame_userData',
    DECKS: 'cardGame_decks',
    SETTINGS: 'cardGame_settings',
    ACHIEVEMENTS: 'cardGame_achievements',
    GAME_STATE: 'cardGame_gameState'
};

// Routes
const Routes = {
    HOME: 'home',
    DECKS: 'decks',
    DECK_BUILDER: 'deck-builder',
    AI_SELECTOR: 'ai-selector',
    GAME: 'game',
    RESULTS: 'results',
    PROFILE: 'profile',
    TUTORIAL: 'tutorial',
    CAMPAIGN: 'campaign'
};

// Events
const GameEvents = {
    CARD_PLAYED: 'cardPlayed',
    CARD_DRAWN: 'cardDrawn',
    PHASE_CHANGED: 'phaseChanged',
    LIFE_CHANGED: 'lifeChanged',
    GAME_OVER: 'gameOver',
    DECK_UPDATED: 'deckUpdated',
    EFFECT_TRIGGERED: 'effectTriggered',
    ATTACK_STARTED: 'attackStarted',
    ATTACK_RESOLVED: 'attackResolved',
    TURN_STARTED: 'turnStarted',
    TURN_ENDED: 'turnEnded'
};

// Error Messages
const ErrorMessages = {
    INVALID_DECK_SIZE: `Deck must contain exactly ${GAME_CONSTANTS.DECK_SIZE} cards`,
    INVALID_MOVE: 'Invalid move',
    GAME_OVER: 'Game is over',
    INVALID_PHASE: 'Invalid action for current phase',
    HAND_FULL: `Hand is full (max ${GAME_CONSTANTS.MAX_HAND_SIZE} cards)`,
    CHAMPION_ZONE_FULL: `Champion zone is full (max ${GAME_CONSTANTS.MAX_CHAMPION_ZONE} cards)`,
    NO_CARDS_LEFT: 'No cards left in deck',
    MAX_PLAYS_REACHED: `Maximum plays per turn reached (${GAME_CONSTANTS.MAX_PLAYS_PER_TURN})`
};

// Achievement Types
const AchievementType = {
    GAMES_PLAYED: 'GAMES_PLAYED',
    GAMES_WON: 'GAMES_WON',
    PERFECT_WINS: 'PERFECT_WINS',
    CARDS_PLAYED: 'CARDS_PLAYED',
    EFFECTS_TRIGGERED: 'EFFECTS_TRIGGERED',
    DAMAGE_DEALT: 'DAMAGE_DEALT',
    
    getDescription: function(type, value) {
        const descriptions = {
            [this.GAMES_PLAYED]: `Play ${value} games`,
            [this.GAMES_WON]: `Win ${value} games`,
            [this.PERFECT_WINS]: `Win ${value} games without losing life`,
            [this.CARDS_PLAYED]: `Play ${value} cards`,
            [this.EFFECTS_TRIGGERED]: `Trigger ${value} card effects`,
            [this.DAMAGE_DEALT]: `Deal ${value} total damage`
        };
        return descriptions[type] || 'Unknown achievement';
    }
}; 