class GamePhase {
    static DRAW = 'DRAW';
    static PLAY = 'PLAY';
    static COMBAT = 'COMBAT';
    static END = 'END';
    
    static getDescription(phase) {
        switch (phase) {
            case this.DRAW:
                return 'Draw Phase - Draw a card from your deck';
            case this.PLAY:
                return 'Play Phase - Play cards from your hand';
            case this.COMBAT:
                return 'Combat Phase - Attack with your champion';
            case this.END:
                return 'End Phase - End your turn';
            default:
                return 'Unknown Phase';
        }
    }
    
    static getNextPhase(currentPhase) {
        switch (currentPhase) {
            case this.DRAW:
                return this.PLAY;
            case this.PLAY:
                return this.COMBAT;
            case this.COMBAT:
                return this.END;
            case this.END:
                return this.DRAW;
            default:
                return this.DRAW;
        }
    }
}

// Make the GamePhase class available globally
window.GamePhase = GamePhase; 