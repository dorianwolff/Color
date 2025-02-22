const GamePhase = {
    DRAW: 'DRAW',
    CHAMPION: 'CHAMPION',
    COMBAT: 'COMBAT',
    END: 'END',
    
    getDescription(phase) {
        switch (phase) {
            case this.DRAW:
                return 'Draw Phase - Draw a card from your deck';
            case this.CHAMPION:
                return 'Champion Phase - Play a champion from your hand';
            case this.COMBAT:
                return 'Combat Phase - Attack with your champion';
            case this.END:
                return 'End Phase - End your turn';
            default:
                return 'Unknown Phase';
        }
    },
    
    getNextPhase(currentPhase) {
        switch (currentPhase) {
            case this.DRAW:
                return this.CHAMPION;
            case this.CHAMPION:
                return this.COMBAT;
            case this.COMBAT:
                return this.END;
            case this.END:
                return this.DRAW;
            default:
                return this.DRAW;
        }
    },
    
    getButtonText(phase, isPlayerTurn) {
        if (isPlayerTurn) {
            switch (phase) {
                case this.DRAW:
                    return "Draw Phase";
                case this.CHAMPION:
                    return "End Champion Phase";
                case this.COMBAT:
                    return "End Combat Phase";
                default:
                    return "End Turn";
            }
        } else {
            switch (phase) {
                case this.DRAW:
                    return "AI Draw Phase";
                case this.CHAMPION:
                    return "AI Champion Phase";
                case this.COMBAT:
                    return "AI Combat Phase";
                default:
                    return "AI Turn";
            }
        }
    }
};

// Make the GamePhase object available globally
window.GamePhase = GamePhase; 