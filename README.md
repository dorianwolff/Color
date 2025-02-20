# Card Game

A browser-based card game where players battle against AI opponents using decks of cards with different colors and effects.

## Features

- Single-player gameplay against AI opponents
- Deck building with 10-card decks
- Color-based combat system
- Card effects (to be implemented)
- User profiles and statistics
- Dark theme UI
- Local storage for game data

## Game Rules

### Colors
Cards have colors represented by numbers:
- Black (0) - Defeated
- Red (1)
- Orange (2)
- Yellow (3)
- Green (4)
- Blue (5)
- Purple (6)
- White (7) - Defeated

### Combat
When cards battle:
- If both cards have the same color, both are defeated
- If attacking card has a higher color value, defending card loses the difference
- If attacking card has a lower color value, defending card gains the difference
- Cards that reach Black (0) or White (7) are defeated

### Game Flow
1. Players start with 7 life points and draw 3 cards
2. Each turn:
   - Draw Phase: Draw a card
   - Play Phase: Play cards to champion zone
   - Combat Phase: Attack opponent's card or directly
   - End Phase: Pass turn

### Victory Conditions
- Reduce opponent's life to 0
- Game is drawn if both players run out of cards

## Project Structure

```
├── css/
│   ├── style.css        # Global styles
│   └── components.css   # Component-specific styles
├── js/
│   ├── core/           # Core game functionality
│   ├── models/         # Game data models
│   ├── components/     # UI components
│   ├── pages/          # Page-specific code
│   └── app.js          # Main application
├── images/
│   ├── cards/          # Card images
│   ├── ai/             # AI opponent avatars
│   ├── avatars/        # User avatars
│   └── back.png        # Card back image
└── index.html          # Main HTML file
```

## Setup

1. Clone the repository
2. Open `index.html` in a web browser
3. Start playing!

## Development

### Adding New Cards
1. Add card image to `images/cards/` as `XX.png`
2. Add card data to the game's card database
3. Update card effects if needed

### Adding New AI Opponents
1. Add AI avatar to `images/ai/`
2. Add opponent configuration to `AI.opponents`
3. Implement AI strategy if different from basic

## Future Features

- Tutorial system
- Campaign mode
- More card effects
- Advanced AI strategies
- Animations
- Online multiplayer

## Contributing

Feel free to submit issues and pull requests for:
- Bug fixes
- New features
- UI improvements
- Card balance suggestions
- AI improvements 