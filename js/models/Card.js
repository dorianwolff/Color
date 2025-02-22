class Card {
    constructor(name, color, imageNumber, effects = ['NONE'], effectDescriptions = ['No effect']) {
        this.id = GameUtils.generateUniqueId();
        this.name = name;
        this.baseColor = color;
        this.currentColor = color;
        this.imageNumber = imageNumber;
        this.baseEffects = [...effects];
        this.currentEffects = [...effects];
        this.baseEffectDescriptions = [...effectDescriptions];
        this.currentEffectDescriptions = [...effectDescriptions];
        this.imagePath = `images/cards/${imageNumber}.png`;
        
        // Preload the image to check if it exists
        const img = new Image();
        img.onerror = () => {
            console.warn(`Image not found for card ${this.name}:`, this.imagePath);
            this.imagePath = 'images/cards/placeholder.png';
        };
        img.src = this.imagePath;
    }
    
    // Reset card to its base state
    reset() {
        this.currentColor = this.baseColor;
        this.currentEffects = [...this.baseEffects];
        this.currentEffectDescriptions = [...this.baseEffectDescriptions];
    }
    
    // Clone the card
    clone() {
        const clonedCard = new Card(
            this.name,
            this.baseColor,
            this.imageNumber,
            this.baseEffects,
            this.baseEffectDescriptions
        );
        
        clonedCard.currentColor = this.currentColor;
        clonedCard.currentEffects = [...this.currentEffects];
        clonedCard.currentEffectDescriptions = [...this.currentEffectDescriptions];
        
        return clonedCard;
    }
    
    // Add an effect to the card
    addEffect(effect, description) {
        this.currentEffects.push(effect);
        this.currentEffectDescriptions.push(description);
    }
    
    // Remove an effect from the card
    removeEffect(effect) {
        const index = this.currentEffects.indexOf(effect);
        if (index !== -1) {
            this.currentEffects.splice(index, 1);
            this.currentEffectDescriptions.splice(index, 1);
        }
    }
    
    // Update the card's color
    updateColor(newColor) {
        this.currentColor = newColor;
    }
    
    // Get the card's current color name
    getColorName() {
        return this.currentColor.name;
    }
    
    // Get the card's base color name
    getBaseColorName() {
        return this.baseColor.name;
    }
    
    // Check if the card is defeated (out of bounds)
    isDefeated() {
        return GameUtils.isColorOutOfBounds(this.currentColor);
    }
    
    // Get card data for storage
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            baseColor: typeof this.baseColor === 'object' ? this.baseColor.value : this.baseColor,
            currentColor: typeof this.currentColor === 'object' ? this.currentColor.value : this.currentColor,
            imageNumber: this.imageNumber,
            baseEffects: this.baseEffects,
            currentEffects: this.currentEffects,
            baseEffectDescriptions: this.baseEffectDescriptions,
            currentEffectDescriptions: this.currentEffectDescriptions
        };
    }
    
    // Create a card from stored data
    static fromJSON(data) {
        // Map numeric color value to CardColor enum
        const colorMap = [
            CardColor.BLACK,   // 0
            CardColor.RED,     // 1
            CardColor.ORANGE,  // 2
            CardColor.YELLOW,  // 3
            CardColor.GREEN,   // 4
            CardColor.BLUE,    // 5
            CardColor.PURPLE,  // 6
            CardColor.WHITE    // 7
        ];
        
        // Ensure we have numeric values for colors
        const baseColorValue = typeof data.baseColor === 'object' ? data.baseColor.value : Number(data.baseColor || 0);
        const currentColorValue = typeof data.currentColor === 'object' ? data.currentColor.value : Number(data.currentColor || baseColorValue);
        
        // Ensure values are within bounds
        const safeBaseColorValue = Math.max(0, Math.min(7, baseColorValue));
        const safeCurrentColorValue = Math.max(0, Math.min(7, currentColorValue));
        
        // Create the card with base color
        const card = new Card(
            data.name,
            colorMap[safeBaseColorValue],
            data.imageNumber,
            data.baseEffects || [],
            data.baseEffectDescriptions || []
        );
        
        // Set current color if different from base
        if (safeCurrentColorValue !== safeBaseColorValue) {
            card.currentColor = colorMap[safeCurrentColorValue];
        }
        
        // Set current effects if provided
        if (data.currentEffects) {
            card.currentEffects = data.currentEffects;
        }
        if (data.currentEffectDescriptions) {
            card.currentEffectDescriptions = data.currentEffectDescriptions;
        }
        
        return card;
    }
    
    // Create HTML element for the card
    toHTML(options = {}) {
        const {
            showBack = false,
            showEffects = true,
            isPlayable = false,
            onClick = null
        } = options;
        
        const cardElement = document.createElement('div');
        cardElement.className = `game-card${isPlayable ? ' playable' : ''}`;
        if (onClick) {
            cardElement.addEventListener('click', () => onClick(this));
        }
        
        const cardInner = document.createElement('div');
        cardInner.className = 'game-card-inner';
        
        const cardImage = document.createElement('img');
        cardImage.className = 'game-card-image';
        cardImage.src = showBack ? 'images/cards/back.png' : `images/cards/${this.imageNumber}.png`;
        cardImage.alt = showBack ? 'Card Back' : this.name;
        cardImage.onerror = () => {
            cardImage.src = 'images/cards/back.png';
        };
        
        const cardGlow = document.createElement('div');
        cardGlow.className = `game-card-glow glow-${this.getColorName().toLowerCase()}`;
        
        cardInner.appendChild(cardImage);
        cardInner.appendChild(cardGlow);
        
        if (showEffects && !showBack) {
            const tooltip = document.createElement('div');
            tooltip.className = 'card-effect-tooltip';
            
            const nameElement = document.createElement('div');
            nameElement.className = 'card-name';
            nameElement.textContent = this.name;
            tooltip.appendChild(nameElement);
            
            const colorInfo = document.createElement('div');
            colorInfo.className = 'card-color';
            colorInfo.textContent = `Color: ${this.getColorName()} (${this.currentColor.value})`;
            tooltip.appendChild(colorInfo);
            
            if (this.currentEffects.length > 0) {
                const effectsList = document.createElement('ul');
                effectsList.className = 'effects-list';
                this.currentEffectDescriptions.forEach(desc => {
                    const li = document.createElement('li');
                    li.textContent = desc;
                    effectsList.appendChild(li);
                });
                tooltip.appendChild(effectsList);
            }
            
            cardInner.appendChild(tooltip);
        }
        
        cardElement.appendChild(cardInner);
        return cardElement;
    }
}

// Export the Card class
window.Card = Card; 