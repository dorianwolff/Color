class GameBoardComponent {
    constructor(game, options = {}) {
        this.game = game;
        this.options = {
            onCardPlay: null,
            onAttack: null,
            onPhaseEnd: null,
            ...options
        };
        
        this.element = this.render();
        this.setupEventListeners();
    }
    
    render() {
        const element = document.createElement('div');
        element.className = 'game-board';
        
        // AI info and zones
        const aiSection = this.createPlayerSection(this.game.ai, true);
        element.appendChild(aiSection);
        
        // Phase indicator and next phase button
        const phaseSection = this.createPhaseSection();
        element.appendChild(phaseSection);
        
        // Player info and zones
        const playerSection = this.createPlayerSection(this.game.player, false);
        element.appendChild(playerSection);
        
        return element;
    }
    
    createPlayerSection(player, isOpponent) {
        const section = document.createElement('div');
        section.className = `player-section${isOpponent ? ' opponent' : ''}`;
        
        // Player info
        const info = this.createPlayerInfo(player, isOpponent);
        section.appendChild(info);
        
        // Hand area
        const hand = this.createHandArea(player, isOpponent);
        section.appendChild(hand);
        
        // Game zones
        const zones = this.createGameZones(player, isOpponent);
        section.appendChild(zones);
        
        return section;
    }
    
    createPlayerInfo(player, isOpponent) {
        const info = document.createElement('div');
        info.className = 'player-info';
        
        const avatar = document.createElement('img');
        avatar.className = 'avatar';
        avatar.src = player.avatar;
        avatar.alt = player.name;
        
        const name = document.createElement('div');
        name.className = 'player-name';
        name.textContent = player.name;
        
        const life = document.createElement('div');
        life.className = 'life-total';
        life.textContent = player.life;
        life.style.color = CardColor.toCSS(player.life);
        
        info.appendChild(avatar);
        info.appendChild(name);
        info.appendChild(life);
        
        return info;
    }
    
    createHandArea(player, isOpponent) {
        const hand = document.createElement('div');
        hand.className = 'hand-area';
        
        player.hand.forEach(card => {
            const cardComponent = new CardComponent(card, {
                showBack: isOpponent,
                showEffects: !isOpponent,
                isPlayable: !isOpponent && this.isCardPlayable(card),
                onClick: !isOpponent ? (card) => this.handleCardPlay(card) : null
            });
            hand.appendChild(cardComponent.getElement());
        });
        
        return hand;
    }
    
    createGameZones(player, isOpponent) {
        const zones = document.createElement('div');
        zones.className = 'game-zones';
        
        // Deck zone
        const deckZone = document.createElement('div');
        deckZone.className = 'card-zone deck-zone';
        deckZone.setAttribute('data-count', player.getDeckSize());
        if (player.getDeckSize() > 0) {
            const backCard = document.createElement('img');
            backCard.src = 'images/back.png';
            backCard.alt = 'Deck';
            deckZone.appendChild(backCard);
        }
        zones.appendChild(deckZone);
        
        // Champion zone
        const championZone = document.createElement('div');
        championZone.className = 'card-zone champion-zone';
        if (player.championZone.length > 0) {
            const championCard = player.championZone[player.championZone.length - 1];
            const cardComponent = new CardComponent(championCard, {
                showBack: false,
                showEffects: true,
                isInChampionZone: true,
                onClick: !isOpponent ? (card) => this.handleAttack(card) : null
            });
            championZone.appendChild(cardComponent.getElement());
        }
        zones.appendChild(championZone);
        
        // Tomb zone
        const tombZone = document.createElement('div');
        tombZone.className = 'card-zone tomb-zone';
        tombZone.setAttribute('data-count', player.getTombSize());
        if (player.getTombSize() > 0) {
            const topCard = player.tombPile[player.tombPile.length - 1];
            const cardComponent = new CardComponent(topCard, {
                showEffects: true,
                isInTomb: true
            });
            tombZone.appendChild(cardComponent.getElement());
        }
        zones.appendChild(tombZone);
        
        return zones;
    }
    
    createPhaseSection() {
        const section = document.createElement('div');
        section.className = 'phase-section';
        
        const indicator = document.createElement('div');
        indicator.className = 'phase-indicator';
        indicator.textContent = `${this.game.currentPlayer.name}'s ${this.game.currentPhase} Phase`;
        section.appendChild(indicator);
        
        if (this.game.currentPlayer === this.game.player) {
            const nextButton = document.createElement('button');
            nextButton.className = 'btn btn-primary';
            nextButton.textContent = 'Next Phase';
            nextButton.addEventListener('click', () => this.handlePhaseEnd());
            section.appendChild(nextButton);
        }
        
        return section;
    }
    
    isCardPlayable(card) {
        return (
            this.game.currentPlayer === this.game.player &&
            this.game.currentPhase === GamePhase.PLAY
        );
    }
    
    handleCardPlay(card) {
        if (this.isCardPlayable(card)) {
            this.options.onCardPlay?.(card);
            this.update();
        }
    }
    
    handleAttack(card) {
        if (
            this.game.currentPlayer === this.game.player &&
            this.game.currentPhase === GamePhase.COMBAT
        ) {
            this.options.onAttack?.(card);
            this.update();
        }
    }
    
    handlePhaseEnd() {
        this.options.onPhaseEnd?.();
        this.update();
    }
    
    setupEventListeners() {
        // Listen for game events
        gameEvents.on(GameEvents.CARD_PLAYED, () => this.update());
        gameEvents.on(GameEvents.CARD_DRAWN, () => this.update());
        gameEvents.on(GameEvents.PHASE_CHANGED, () => this.update());
        gameEvents.on(GameEvents.LIFE_CHANGED, () => this.update());
    }
    
    update() {
        const newElement = this.render();
        this.element.replaceWith(newElement);
        this.element = newElement;
        this.setupEventListeners();
    }
    
    getElement() {
        return this.element;
    }
}

// Export the GameBoardComponent class
window.GameBoardComponent = GameBoardComponent; 