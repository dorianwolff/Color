// Card Database
const CardDatabase = {
    // Basic Cards
    cards: [
        {
            id: 'slive',
            name: 'Slive',
            color: CardColor.RED,
            imageNumber: 0,
            effects: ['TAMER'],
            effectDescriptions: ['Prevents 1 damage when attacked'],
            rarity: 'common'
        },
        {
            id: 'friggs_flying_cats',
            name: 'Frigg\'s Flying Cats',
            color: CardColor.RED,
            imageNumber: 1,
            effects: ['UNDYING'],
            effectDescriptions: ['Draw a card when played'],
            rarity: 'common'
        },
        {
            id: 'master_of_mountains',
            name: 'Master of Mountains',
            color: CardColor.RED,
            imageNumber: 2,
            effects: ['CALL'],
            effectDescriptions: ['+1 to color value when attacking'],
            rarity: 'common'
        },
        {
            id: 'darek',
            name: 'Darek',
            color: CardColor.ORANGE,
            imageNumber: 3,
            effects: ['SORROW'],
            effectDescriptions: ['Heal 1 life point when played'],
            rarity: 'common'
        },
        {
            id: 'thorgal',
            name: 'Thorgal',
            color: CardColor.YELLOW,
            imageNumber: 4,
            effects: ['RUTHLESS'],
            effectDescriptions: ['+1 to color value when attacking'],
            rarity: 'common'
        },
        {
            id: 'aaricia',
            name: 'Aaricia',
            color: CardColor.YELLOW,
            imageNumber: 5,
            effects: ['GUTS'],
            effectDescriptions: ['Look at top card of deck when played'],
            rarity: 'common'
        },
        {
            id: 'kriss_de_valnor',
            name: 'Kriss de Valnor',
            color: CardColor.GREEN,
            imageNumber: 6,
            effects: ['CATSEYE'],
            effectDescriptions: ['Double damage when attacking'],
            rarity: 'common'
        },
        {
            id: 'louve',
            name: 'Louve',
            color: CardColor.BLUE,
            imageNumber: 7,
            effects: ['BOND'],
            effectDescriptions: ['Cannot be blocked on first attack'],
            rarity: 'common'
        },
        {
            id: 'thorgal',
            name: 'Thorgal',
            color: CardColor.BLUE,
            imageNumber: 8,
            effects: ['RUTHLESS'],
            effectDescriptions: [
                'Double damage when attacking'
            ],
            rarity: 'rare'
        },
        {
            id: 'johan',
            name: 'Johan',
            color: CardColor.PURPLE,
            imageNumber: 9,
            effects: ['DESTINED'],
            effectDescriptions: [
                'Draw a card when played'
            ],
            rarity: 'rare'
        },
        {
            id: 'jolan',
            name: 'Jolan',
            color: CardColor.PURPLE,
            imageNumber: 10,
            effects: ['STARLIGHT'],
            effectDescriptions: [
                'Draw a card when played'
            ],
            rarity: 'rare'
        },
        {
            id: 'nixies',
            name: 'Nixies',
            color: CardColor.PURPLE,
            imageNumber: 11,
            effects: ['SOULTAKER'],
            effectDescriptions: [
                'Draw a card when played'
            ],
            rarity: 'rare'
        },
        {
            id: 'thorgal',
            name: 'Thorgal',
            color: CardColor.ORANGE,
            imageNumber: 12,
            effects: ['RUTHLESS'],
            effectDescriptions: [
                'Double damage when attacking'
            ],
            rarity: 'rare'
        },
        {
            id: 'kriss_de_valnor',
            name: 'Kriss de Valnor',
            color: CardColor.YELLOW,
            imageNumber: 13,
            effects: ['CATSEYE'],
            effectDescriptions: [
                'Double damage when attacking'
            ],
            rarity: 'rare'
        },
        {
            id: 'thorgal',
            name: 'Thorgal',
            color: CardColor.GREEN,
            imageNumber: 14,
            effects: ['RUTHLESS'],
            effectDescriptions: [
                'Double damage when attacking'
            ],
            rarity: 'rare'
        },
        {
            id: 'butterfly',
            name: 'Butterfly',
            color: CardColor.GREEN,
            imageNumber: 15,
            effects: ['ILLUSIONS'],
            effectDescriptions: [
                'Takes 1 damage when attacked'
            ],
            rarity: 'rare'
        },
        {
            id: 'thorgal',
            name: 'Thorgal',
            color: CardColor.PURPLE,
            imageNumber: 16,
            effects: ['RUTHLESS'],
            effectDescriptions: [
                'Double damage when attacking'
            ],
            rarity: 'rare'
        }
    ],

    // Get a card by ID
    getCard(id) {
        const cardData = this.cards.find(card => card.id === id);
        if (!cardData) return null;
        
        return new Card(
            cardData.name,
            cardData.color,
            cardData.imageNumber,
            cardData.effects,
            cardData.effectDescriptions
        );
    },

    // Get all cards
    getAllCards() {
        const cards = this.cards.map(cardData => 
            new Card(
                cardData.name,
                cardData.color,
                cardData.imageNumber,
                cardData.effects,
                cardData.effectDescriptions
            )
        );
        return cards;
    },

    // Get cards by color
    getCardsByColor(color) {
        return this.getAllCards().filter(card => card.baseColor === color);
    },

    // Get cards by rarity
    getCardsByRarity(rarity) {
        return this.getAllCards().filter(card => 
            this.cards.find(c => c.id === card.id).rarity === rarity
        );
    }
};

// Export the CardDatabase
window.CardDatabase = CardDatabase; 