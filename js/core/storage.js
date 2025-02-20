class Storage {
    constructor() {
        this.initializeStorage();
    }
    
    // Initialize storage with default values if needed
    initializeStorage() {
        if (!this.getData(StorageKeys.USER_DATA)) {
            this.setData(StorageKeys.USER_DATA, {
                id: GameUtils.generateUniqueId(),
                name: 'Player',
                avatar: 'images/avatars/default.jpg',
                achievements: [],
                stats: {
                    gamesPlayed: 0,
                    gamesWon: 0,
                    gamesLost: 0,
                    gamesDraw: 0
                }
            });
        }
        
        if (!this.getData(StorageKeys.DECKS)) {
            this.setData(StorageKeys.DECKS, []);
        }
        
        if (!this.getData(StorageKeys.SETTINGS)) {
            this.setData(StorageKeys.SETTINGS, {
                activeDeckId: null,
                soundEnabled: true,
                musicEnabled: true,
                animationsEnabled: true
            });
        }
        
        if (!this.getData(StorageKeys.ACHIEVEMENTS)) {
            this.setData(StorageKeys.ACHIEVEMENTS, []);
        }
    }
    
    // Get data from storage
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error getting data for key ${key}:`, error);
            return null;
        }
    }
    
    // Set data in storage
    setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error setting data for key ${key}:`, error);
            return false;
        }
    }
    
    // Update user data
    updateUserData(updates) {
        const userData = this.getData(StorageKeys.USER_DATA);
        const updatedData = { ...userData, ...updates };
        return this.setData(StorageKeys.USER_DATA, updatedData);
    }
    
    // Get user data
    getUserData() {
        return this.getData(StorageKeys.USER_DATA);
    }
    
    // Save deck
    saveDeck(deck) {
        const decks = this.getAllDecks();
        const existingDeckIndex = decks.findIndex(d => d.id === deck.id);
        
        if (existingDeckIndex !== -1) {
            decks[existingDeckIndex] = deck.toJSON();
        } else {
            decks.push(deck.toJSON());
        }
        
        return this.setData(StorageKeys.DECKS, decks);
    }
    
    // Delete deck
    deleteDeck(deckId) {
        const decks = this.getData(StorageKeys.DECKS);
        const filteredDecks = decks.filter(deck => deck.id !== deckId);
        
        // If this was the active deck, clear it
        const settings = this.getData(StorageKeys.SETTINGS);
        if (settings.activeDeckId === deckId) {
            settings.activeDeckId = null;
            this.setData(StorageKeys.SETTINGS, settings);
        }
        
        return this.setData(StorageKeys.DECKS, filteredDecks);
    }
    
    // Get deck by ID
    getDeck(deckId) {
        const decks = this.getData(StorageKeys.DECKS);
        const deck = decks.find(deck => deck.id === deckId);
        return deck ? Deck.fromJSON(deck) : null;
    }
    
    // Get all decks
    getAllDecks() {
        const decks = this.getData(StorageKeys.DECKS) || [];
        return decks.map(deck => Deck.fromJSON(deck));
    }
    
    // Set active deck
    setActiveDeck(deckId) {
        const settings = this.getData(StorageKeys.SETTINGS);
        settings.activeDeckId = deckId;
        return this.setData(StorageKeys.SETTINGS, settings);
    }
    
    // Get active deck
    getActiveDeck() {
        const settings = this.getData(StorageKeys.SETTINGS);
        return settings.activeDeckId ? this.getDeck(settings.activeDeckId) : null;
    }
    
    // Update settings
    updateSettings(updates) {
        const settings = this.getData(StorageKeys.SETTINGS);
        const updatedSettings = { ...settings, ...updates };
        return this.setData(StorageKeys.SETTINGS, updatedSettings);
    }
    
    // Get settings
    getSettings() {
        return this.getData(StorageKeys.SETTINGS);
    }
    
    // Set game settings
    setGameSettings(settings) {
        const currentSettings = this.getData(StorageKeys.SETTINGS) || {};
        const gameSettings = currentSettings.gameSettings || {};
        const updatedGameSettings = { ...gameSettings, ...settings };
        return this.updateSettings({ gameSettings: updatedGameSettings });
    }
    
    // Get game settings
    getGameSettings() {
        const settings = this.getData(StorageKeys.SETTINGS);
        return settings?.gameSettings || {};
    }
    
    // Add achievement
    addAchievement(achievement) {
        const achievements = this.getData(StorageKeys.ACHIEVEMENTS);
        achievements.push({
            ...achievement,
            unlockedAt: Date.now()
        });
        return this.setData(StorageKeys.ACHIEVEMENTS, achievements);
    }
    
    // Get all achievements
    getAchievements() {
        return this.getData(StorageKeys.ACHIEVEMENTS);
    }
    
    // Update game stats
    updateGameStats(result) {
        const userData = this.getData(StorageKeys.USER_DATA);
        userData.stats.gamesPlayed++;
        
        switch (result) {
            case 'PLAYER_WIN':
                userData.stats.gamesWon++;
                break;
            case 'AI_WIN':
                userData.stats.gamesLost++;
                break;
            case 'DRAW':
                userData.stats.gamesDraw++;
                break;
        }
        
        return this.setData(StorageKeys.USER_DATA, userData);
    }
    
    // Clear all data (for account deletion)
    clearAllData() {
        localStorage.clear();
        this.initializeStorage();
    }
}

// Create global storage instance
window.gameStorage = new Storage(); 