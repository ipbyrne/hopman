// Game Object
var MrHop = MrHop || {};

// Create Game
MrHop.game = new Phaser.Game(480,320, Phaser.CANVAS);

// Load Game States
MrHop.game.state.add('Boot', MrHop.BootState);
MrHop.game.state.add('Preload', MrHop.PreloadState);
MrHop.game.state.add('Game', MrHop.GameState);

// Start the Boot State
MrHop.game.state.start('Boot');