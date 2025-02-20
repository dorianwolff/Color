// Main application class
class App {
    constructor() {
        this.initializeRoutes();
        this.loadUserData();
        
        // Initialize router after everything is set up
        window.addEventListener('DOMContentLoaded', () => {
            window.router.init();
        });
    }
    
    // Initialize route handlers
    initializeRoutes() {
        // Register all routes
        router.register(Routes.HOME, HomePage);
        router.register(Routes.DECKS, DeckSelectorPage);
        router.register(Routes.DECK_BUILDER, DeckBuilderPage);
        router.register(Routes.AI_SELECTOR, AISelectorPage);
        router.register(Routes.GAME, GamePage);
        router.register(Routes.RESULTS, ResultsPage);
        router.register(Routes.PROFILE, ProfilePage);
    }
    
    // Load user data
    loadUserData() {
        if (!gameStorage.getUserData()) {
            gameStorage.initializeStorage();
        }
    }
    
    // Create a new deck
    createNewDeck() {
        router.navigate(Routes.DECK_BUILDER);
    }
    
    // Edit an existing deck
    editDeck(deck) {
        router.navigate(Routes.DECK_BUILDER, { deckId: deck.id });
    }
    
    // Delete a deck
    deleteDeck(deck) {
        if (confirm('Are you sure you want to delete this deck?')) {
            gameStorage.deleteDeck(deck.id);
            router.navigate(Routes.DECKS);
        }
    }
    
    // Set active deck
    setActiveDeck(deck) {
        gameStorage.setActiveDeck(deck.id);
        router.navigate(Routes.AI_SELECTOR);
    }
    
    // Initialize deck builder
    initializeDeckBuilder(deck) {
        // To be implemented
        // Will handle card selection and deck building UI
    }
    
    // Start a new game
    startGame(aiOpponent) {
        const playerDeck = gameStorage.getActiveDeck();
        const aiDeck = playerDeck.clone(); // For now, AI uses same deck
        
        const userData = gameStorage.getUserData();
        const player = new Player(userData.name, userData.avatar, playerDeck);
        
        const ai = new AI({
            ...aiOpponent,
            deck: aiDeck
        });
        
        this.currentGame = new Game(player, ai);
        this.currentGame.initialize();
        
        router.navigate(Routes.GAME, { aiId: aiOpponent.id });
    }
    
    // Initialize game
    initializeGame(aiId) {
        // To be implemented
        // Will handle game UI and interactions
    }
    
    // Delete account
    deleteAccount() {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            gameStorage.clearAllData();
            router.navigate(Routes.HOME);
        }
    }
}

// Create and initialize the app
window.app = new App(); 