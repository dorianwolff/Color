class Game {
    constructor(player, ai) {
        this.player = player;
        this.ai = ai;
        this.currentPhase = null;
        this.currentPlayer = null;
        this.turnCount = 0;
        this.gameState = 'INITIALIZING';
        this.startingPlayer = null;
    }
    
    // Initialize a new game
    initialize() {
        // Reset players
        this.player.initialize();
        this.ai.initialize();
        
        // Draw starting hands
        this.player.drawCards(GAME_CONSTANTS.STARTING_HAND_SIZE);
        this.ai.drawCards(GAME_CONSTANTS.STARTING_HAND_SIZE);
        
        // Randomly determine starting player
        this.startingPlayer = Math.random() < 0.5 ? this.player : this.ai;
        this.currentPlayer = this.startingPlayer;
        
        // Set initial phase
        this.currentPhase = GamePhase.DRAW;
        this.turnCount = 1;
        this.gameState = 'PLAYING';
        
        // Emit game start event
        gameEvents.emit(GameEvents.PHASE_CHANGED, {
            phase: this.currentPhase,
            player: this.currentPlayer.name
        });
    }
    
    // Process the current phase
    processPhase() {
        switch (this.currentPhase) {
            case GamePhase.DRAW:
                this.processDraw();
                break;
            case GamePhase.PLAY:
                this.processPlay();
                break;
            case GamePhase.COMBAT:
                this.processCombat();
                break;
            case GamePhase.END:
                this.processEnd();
                break;
        }
    }
    
    // Process draw phase
    processDraw() {
        if (this.currentPlayer.getDeckSize() > 0) {
            this.currentPlayer.drawCard();
        }
        this.currentPhase = GamePhase.PLAY;
        
        gameEvents.emit(GameEvents.PHASE_CHANGED, {
            phase: this.currentPhase,
            player: this.currentPlayer.name
        });
    }
    
    // Process play phase
    processPlay() {
        if (this.currentPlayer === this.ai) {
            const cardToPlay = this.ai.decideCardToPlay();
            if (cardToPlay) {
                this.playCard(cardToPlay);
            }
            this.currentPhase = GamePhase.COMBAT;
            
            gameEvents.emit(GameEvents.PHASE_CHANGED, {
                phase: this.currentPhase,
                player: this.currentPlayer.name
            });
        }
        // Player's play phase is handled by user input
    }
    
    // Process combat phase
    processCombat() {
        if (this.currentPlayer === this.ai) {
            const opponent = this.player;
            const action = this.ai.decideCombatAction(
                opponent.championZone,
                opponent.life
            );
            
            if (action) {
                if (action.type === 'DIRECT_ATTACK') {
                    this.directAttack(action.card);
                } else {
                    this.cardAttack(action.attacker, action.defender);
                }
            }
            
            this.endTurn();
        }
        // Player's combat phase is handled by user input
    }
    
    // Process end phase
    processEnd() {
        this.currentPlayer = this.currentPlayer === this.player ? this.ai : this.player;
        this.currentPhase = GamePhase.DRAW;
        this.turnCount++;
        
        gameEvents.emit(GameEvents.PHASE_CHANGED, {
            phase: this.currentPhase,
            player: this.currentPlayer.name
        });
        
        // If it's AI's turn, process their phases
        if (this.currentPlayer === this.ai) {
            this.processPhase();
        }
    }
    
    // Play a card
    playCard(cardId) {
        if (!GameUtils.isValidMove(this, { type: 'PLAY_CARD', player: this.currentPlayer })) {
            throw new Error(ErrorMessages.INVALID_MOVE);
        }
        
        return this.currentPlayer.playCard(cardId);
    }
    
    // Perform a direct attack
    directAttack(card) {
        const opponent = this.currentPlayer === this.player ? this.ai : this.player;
        opponent.changeLife(-card.currentColor);
        
        if (opponent.hasLost()) {
            this.endGame();
        }
    }
    
    // Perform a card attack
    cardAttack(attacker, defender) {
        const opponent = this.currentPlayer === this.player ? this.ai : this.player;
        
        const result = GameUtils.calculateCombatResult(attacker, defender);
        
        if (result.attackerDefeated) {
            this.currentPlayer.moveToTomb(attacker);
        }
        
        if (result.defenderDefeated) {
            opponent.moveToTomb(defender);
        } else {
            defender.updateColor(result.newDefenderColor);
        }
    }
    
    // End the current turn
    endTurn() {
        this.currentPhase = GamePhase.END;
        
        gameEvents.emit(GameEvents.PHASE_CHANGED, {
            phase: this.currentPhase,
            player: this.currentPlayer.name
        });
        
        this.processEnd();
    }
    
    // End the game
    endGame() {
        this.gameState = 'ENDED';
        const result = GameUtils.getGameResult(this);
        
        // Update stats
        gameStorage.updateGameStats(result);
        
        gameEvents.emit(GameEvents.GAME_OVER, {
            result: result,
            player: {
                name: this.player.name,
                life: this.player.life
            },
            ai: {
                name: this.ai.name,
                life: this.ai.life
            }
        });
    }
    
    // Check if a move is valid
    isValidMove(action) {
        return GameUtils.isValidMove(this, action);
    }
    
    // Get current game state
    getState() {
        return {
            currentPhase: this.currentPhase,
            currentPlayer: this.currentPlayer.name,
            turnCount: this.turnCount,
            gameState: this.gameState,
            player: {
                life: this.player.life,
                handSize: this.player.getHandSize(),
                deckSize: this.player.getDeckSize(),
                tombSize: this.player.getTombSize(),
                hasChampion: this.player.championZone.length > 0
            },
            ai: {
                life: this.ai.life,
                handSize: this.ai.getHandSize(),
                deckSize: this.ai.getDeckSize(),
                tombSize: this.ai.getTombSize(),
                hasChampion: this.ai.championZone.length > 0
            }
        };
    }
}

// Export the Game class
window.Game = Game; 