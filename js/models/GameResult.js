class GameResult {
    static PLAYER_WIN = 'PLAYER_WIN';
    static AI_WIN = 'AI_WIN';
    static DRAW = 'DRAW';
    static ONGOING = 'ONGOING';
    
    static getMessage(result) {
        switch (result) {
            case this.PLAYER_WIN:
                return 'Victory! You have won the game!';
            case this.AI_WIN:
                return 'Defeat! The AI has won the game.';
            case this.DRAW:
                return 'Draw! The game has ended in a tie.';
            case this.ONGOING:
                return 'The game is still ongoing.';
            default:
                return 'Unknown game result.';
        }
    }
    
    static getColor(result) {
        switch (result) {
            case this.PLAYER_WIN:
                return 'var(--success)';
            case this.AI_WIN:
                return 'var(--danger)';
            case this.DRAW:
                return 'var(--warning)';
            default:
                return 'var(--text-primary)';
        }
    }
}

// Make the GameResult class available globally
window.GameResult = GameResult; 