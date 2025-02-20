class EventEmitter {
    constructor() {
        this.events = new Map();
    }
    
    // Subscribe to an event
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        
        this.events.get(event).push(callback);
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    // Unsubscribe from an event
    off(event, callback) {
        if (!this.events.has(event)) return;
        
        const callbacks = this.events.get(event);
        const index = callbacks.indexOf(callback);
        
        if (index !== -1) {
            callbacks.splice(index, 1);
            
            if (callbacks.length === 0) {
                this.events.delete(event);
            }
        }
    }
    
    // Emit an event
    emit(event, data) {
        if (!this.events.has(event)) return;
        
        this.events.get(event).forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
    
    // Subscribe to an event once
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        
        return this.on(event, wrapper);
    }
    
    // Clear all event listeners
    clear() {
        this.events.clear();
    }
    
    // Clear specific event listeners
    clearEvent(event) {
        this.events.delete(event);
    }
}

// Create global event emitter instance
window.gameEvents = new EventEmitter();

// Example usage:
/*
gameEvents.on(GameEvents.CARD_PLAYED, (data) => {
    console.log('Card played:', data);
});

gameEvents.emit(GameEvents.CARD_PLAYED, {
    card: cardInstance,
    player: 'player1'
});
*/ 