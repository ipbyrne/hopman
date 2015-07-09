// Game Object
var MrHop = MrHop || {};

// Method/ Function to Create Platforms
MrHop.Platform = function(game, floorPool, numTiles, x, y, speed, coinsPool) {
    // Turn the Platforms into a Group
    Phaser.Group.call(this, game);
    
    // Set the Tile Size
    this.tileSize = 40;
    // Create Access for the prepare function to use game
    this.game = game;
    // Enable Group Physics
    this.enableBody = true;
    
    // Allow floor group to be accessed
    this.floorPool = floorPool;
    
    // Allow coins group to be access
    this.coinsPool = coinsPool
    // Enable physics for the coins pool
    this.coinsPool.enableBody = true;
    
    // Call Method to prepare new tiles
    this.prepare(numTiles,x, y, speed);   
};

// Cause Function to behave as if it were a Group
MrHop.Platform.prototype = Object.create(Phaser.Group.prototype);
// Sets the method to be called with the Platform prototype is used.
MrHop.Platform.prototype.constructor = MrHop.Platform;

// Method to prepare new tiles to be created
MrHop.Platform.prototype.prepare =  function(numTiles, x, y, speed) {
    // Make sure Platforms are Alive
    this.alive = true;
    // Loop For Tile Creation
    // Var for tiles creadted
    var i = 0;
    // While number of tiles is less than specified numTiles
    while(i < numTiles) {
        // Grab 1st Dead Platform from Pool
        var floorTile = this.floorPool.getFirstExists(false);
        // If there are no Dead Ones
        if(!floorTile) {
            // Create Tile
            floorTile = new Phaser.Sprite(this.game, x + i * this.tileSize, y, 'floor');
        } else {
            // Reset the Recycle Dead Tiles
            floorTile.reset(x + i * this.tileSize, y)
        }
        // Add the Tile to the Group
        this.add(floorTile);
        // Increment the Var for Tiles Created
        i++;
    }  
    // Disable platforms from moving when landed on
    this.setAll('body.immovable', true);
    // Disable Gravity of Platforms so they Do not Fall
    this.setAll('body.allowGravity', false);
    // Set the Velocity for the Group of Platform Sprites using Level Speed
    this.setAll('body.velocity.x', speed);
    
    // Add the coins to the tiles
    this.addCoins(speed);
};

// Implement custom Platform kill method since there is not one by default for groups
MrHop.Platform.prototype.kill = function() {
    // Set the Alive property to false to mark it is dead
    this.alive = false;
    // Kill all the sprites in the group by using the sprite kill method
    this.callAll('kill');
    
    // Adding Killed Tiles to the floorPool Group
    // Create Sprites to store killed tiles in as keeping them in the group deletes objects from the array when its not suppsoed to
    var sprites = [];
    // Iteration through each of the tiles in the platform
    this.forEach(function(tile){
        // And push them to the array we just created.
        sprites.push(tile);
    }, this);
    // Iterate throught Araray with the tiles pushed into them
    sprites.forEach(function(tile){
        // And add the tiles to the floorPool group to be reused.
        this.floorPool.add(tile);
    }, this);
};

// Implement Method to add Coins
MrHop.Platform.prototype.addCoins = function(speed) {
    // Get the height of the coin in regards to height of the platform
    var coinsY = 45 + Math.random() * 150;
    // Create variable to track is tile has a coin
    var hasCoin;
    // For each tile there is
    this.forEach(function(tile) {
        // a 40% chance of a coin appearing.
        hasCoin = Math.random() <= 0.4;
        // If the tile has a coing
        if(hasCoin) {
            // Get the first dead coin if one exists
            var coin = this.coinsPool.getFirstExists(false);
            // If no coin exists
            if(!coin) {
                // Create a new coin
                coin = new Phaser.Sprite(this.game, tile.x, tile.y - coinsY, 'coin');
                // Load the new coin into the coinsPool
                this.coinsPool.add(coin);
            } else {
                // Reset the dead Coin
                coin.reset(tile.x, tile.y - coinsY);
            }
            
            // Set the Velocity of the coins so that they move with the platforms.
            coin.body.velocity.x = speed;
            // Disable gravity so the coins stay in there place
            coin.body.allowGravity = false;
        }
    }, this);
};