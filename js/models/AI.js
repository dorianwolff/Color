class AI extends Player {
    constructor(config) {
        super(config.name, config.avatar, config.deck);
        this.difficulty = config.difficulty || 'NORMAL';
        this.description = config.description || 'A basic AI opponent';
        this.strategy = config.strategy || 'RANDOM';
    }
    
    // Make a decision for playing a card
    decideCardToPlay() {
        if (this.hand.length === 0) {
            return null;
        }
        
        // For now, just play a random card as per requirements
        const randomIndex = Math.floor(Math.random() * this.hand.length);
        return this.hand[randomIndex].id;
    }
    
    // Make a decision for combat
    decideCombatAction(opponentChampionZone, opponentLife) {
        if (this.championZone.length === 0) {
            return null;
        }
        
        const attackingCard = this.championZone[this.championZone.length - 1];
        
        // If opponent has no cards, attack directly
        if (opponentChampionZone.length === 0) {
            return {
                type: 'DIRECT_ATTACK',
                card: attackingCard
            };
        }
        
        // Otherwise, attack the opponent's card
        const defendingCard = opponentChampionZone[opponentChampionZone.length - 1];
        return {
            type: 'CARD_ATTACK',
            attacker: attackingCard,
            defender: defendingCard
        };
    }
    
    // Create HTML element for AI selection
    static createSelectionCard(config) {
        const aiCard = document.createElement('div');
        aiCard.className = 'ai-card';
        
        const avatar = document.createElement('img');
        avatar.src = config.avatar;
        avatar.alt = config.name;
        avatar.className = 'ai-avatar';
        
        const name = document.createElement('h3');
        name.textContent = config.name;
        
        const difficulty = document.createElement('div');
        difficulty.className = `difficulty ${config.difficulty.toLowerCase()}`;
        difficulty.textContent = config.difficulty;
        
        const description = document.createElement('p');
        description.textContent = config.description;
        
        const selectButton = document.createElement('button');
        selectButton.className = 'btn btn-primary';
        selectButton.textContent = 'Select';
        
        aiCard.appendChild(avatar);
        aiCard.appendChild(name);
        aiCard.appendChild(difficulty);
        aiCard.appendChild(description);
        aiCard.appendChild(selectButton);
        
        return aiCard;
    }
}

// Define available AI opponents
AI.opponents = [
    {
        id: 'basic_ai',
        name: 'Basic Bot',
        avatar: 'images/ai/basic.jpg',
        difficulty: 'EASY',
        description: 'A simple AI that plays cards randomly.',
        strategy: 'RANDOM'
    },
    // More AI opponents can be added here
];

// Export the AI class
window.AI = AI; 