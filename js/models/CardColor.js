class CardColor {
    static BLACK = 0;
    static RED = 1;
    static ORANGE = 2;
    static YELLOW = 3;
    static GREEN = 4;
    static BLUE = 5;
    static PURPLE = 6;
    static WHITE = 7;
    
    static fromValue(value) {
        if (value <= this.BLACK) return { value: this.BLACK, class: 'black', name: 'Black' };
        if (value === this.RED) return { value: this.RED, class: 'red', name: 'Red' };
        if (value === this.ORANGE) return { value: this.ORANGE, class: 'orange', name: 'Orange' };
        if (value === this.YELLOW) return { value: this.YELLOW, class: 'yellow', name: 'Yellow' };
        if (value === this.GREEN) return { value: this.GREEN, class: 'green', name: 'Green' };
        if (value === this.BLUE) return { value: this.BLUE, class: 'blue', name: 'Blue' };
        if (value === this.PURPLE) return { value: this.PURPLE, class: 'purple', name: 'Purple' };
        if (value >= this.WHITE) return { value: this.WHITE, class: 'white', name: 'White' };
    }
    
    static toCSS(value) {
        switch (value) {
            case this.BLACK: return 'var(--card-black)';
            case this.RED: return 'var(--card-red)';
            case this.ORANGE: return 'var(--card-orange)';
            case this.YELLOW: return 'var(--card-yellow)';
            case this.GREEN: return 'var(--card-green)';
            case this.BLUE: return 'var(--card-blue)';
            case this.PURPLE: return 'var(--card-purple)';
            case this.WHITE: return 'var(--card-white)';
            default: return value <= this.BLACK ? 'var(--card-black)' : 'var(--card-white)';
        }
    }
    
    static getColorName(value) {
        return this.fromValue(value).name;
    }
    
    static getColorClass(value) {
        return this.fromValue(value).class;
    }
}

// Make the CardColor class available globally
window.CardColor = CardColor; 