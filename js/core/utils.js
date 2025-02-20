// Utility functions for the card game

// Shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Calculate new color value after combat
function calculateNewColor(attackingColor, defendingColor) {
    const difference = Math.abs(attackingColor - defendingColor);
    if (attackingColor === defendingColor) {
        return null; // Both cards are defeated
    } else if (attackingColor > defendingColor) {
        return Math.max(0, defendingColor - difference);
    } else {
        return Math.min(7, defendingColor + difference);
    }
}

// Check if a color value is out of bounds (defeated)
function isColorOutOfBounds(colorValue) {
    return colorValue <= CardColor.BLACK || colorValue >= CardColor.WHITE;
}

// Deep clone an object
function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Format a timestamp
function formatTimestamp(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Generate a unique ID
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save data to local storage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Error saving to storage:', error);
        return false;
    }
}

// Load data from local storage
function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error loading from storage:', error);
        return null;
    }
}

// Validate deck size
function validateDeck(deck) {
    return deck.length === GAME_CONSTANTS.DECK_SIZE;
}

// Check if it's a valid move
function isValidMove(gameState, action) {
    const { currentPhase, currentPlayer, turnCount } = gameState;
    
    switch (action.type) {
        case 'PLAY_CARD':
            return currentPhase === GamePhase.PLAY && 
                   action.player === currentPlayer;
        
        case 'ATTACK':
            return currentPhase === GamePhase.COMBAT && 
                   action.player === currentPlayer &&
                   !(turnCount === 1 && gameState.startingPlayer === currentPlayer);
        
        default:
            return false;
    }
}

// Calculate combat result
function calculateCombatResult(attacker, defender) {
    const newColor = calculateNewColor(attacker.color, defender.color);
    
    if (newColor === null) {
        return {
            attackerDefeated: true,
            defenderDefeated: true,
            newDefenderColor: null
        };
    }
    
    return {
        attackerDefeated: false,
        defenderDefeated: isColorOutOfBounds(newColor),
        newDefenderColor: newColor
    };
}

// Check if game is over
function isGameOver(gameState) {
    const { player, ai } = gameState;
    
    // Check life points
    if (player.life <= CardColor.BLACK || ai.life <= CardColor.BLACK) {
        return true;
    }
    
    // Check if both players have no cards left
    const playerHasCards = player.deck.length > 0 || player.hand.length > 0 || player.championZone.length > 0;
    const aiHasCards = ai.deck.length > 0 || ai.hand.length > 0 || ai.championZone.length > 0;
    
    return !playerHasCards && !aiHasCards;
}

// Get game result
function getGameResult(gameState) {
    const { player, ai } = gameState;
    
    if (player.life <= CardColor.BLACK) return 'AI_WIN';
    if (ai.life <= CardColor.BLACK) return 'PLAYER_WIN';
    if (!isGameOver(gameState)) return 'ONGOING';
    return 'DRAW';
}

// Format card effect description
function formatEffectDescription(effect, params = {}) {
    // To be implemented when effects are added
    return effect;
}

// Export utilities
window.GameUtils = {
    shuffleArray,
    calculateNewColor,
    isColorOutOfBounds,
    deepClone,
    formatTimestamp,
    generateUniqueId,
    saveToStorage,
    loadFromStorage,
    validateDeck,
    isValidMove,
    calculateCombatResult,
    isGameOver,
    getGameResult,
    formatEffectDescription
}; 