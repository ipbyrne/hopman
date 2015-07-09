var MrHop = MrHop || {};

MrHop.GameState = {

    init: function() {
      
      // Create Group of Floor Sprites
      this.floorPool = this.add.group();
        
       // Create Group for Platforms
       this.platformPool = this.add.group();
        
        // Create Group for Coins
        this.coinsPool = this.add.group();
    
       //gravity
       this.game.physics.arcade.gravity.y = 1000;    
      
      // Set Max Jumping Distance
      this.maxJumpDistance = 120;
      
      // Enable Cursor Controls -- Gives us access to Arrow Keys
      this.cursors = this.game.input.keyboard.createCursorKeys();
      
      // Keep Track of the Coins Player Collects
      this.myCoins = 0;
        
        // Level Speed
        this.levelSpeed = 200;
  },
  create: function() {
      // Create the moving Background
      this.background = this.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'background');
      // Change the scale of background to fit on screen
      this.background.tileScale.y = 2;
      // Get the background to autoscroll
      this.background.autoScroll(-this.levelSpeed/5, 0);
      // Send the image to the back so it does not cover other assets
      this.game.world.sendToBack(this.background);
      
      // Create the Player
      this.player = this.add.sprite(50,150, 'player');
      this.player.anchor.setTo(0.5);
      // Create the running Animation
      this.player.animations.add('running', [0,1,2,3,2,1], 15, true);
      // Enable Player Physics
      this.game.physics.arcade.enable(this.player);
      // Change the Players Bounding Box
      this.player.body.setSize(38, 60, 0, 0);
      // Play the player Animation
      this.player.play('running');
      
      //hard-code first platform - give it the game, the group to pull from, number of tiles, x, y, velocity they should be moving
      this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, 12, 0, 200, -this.levelSpeed, this.coinsPool);
      // Add platform to Platform Group
      this.platformPool.add(this.currentPlatform);
      
      // Create Sound for coin collections
      this.coinSound = this.add.audio('coin');
      
      // Load Level method
      this.loadLevel();
      
      // Create Moving Water at the bottom
      this.water = this.add.tileSprite(0, this.game.world.height - 30, this.game.world.width, 30, 'water');
      // Cause the water to move
      this.water.autoScroll(-this.levelSpeed /2, 0);
      
      // Show UI For Coins
      // Styling for UI Text
      var style = {font: '30px Arial', fill: '#fff'};
      // Create the Coins label
      this.coinsCountLabel = this.add.text(10, 20, '0', style);
  },   
  update: function() {    
      
      
      // Only Check for all these things if the player is alive
      if(this.player.alive) {
          // Player Collisions
          // Collision of Spites with a Group of Groups Example
          // Iterate through each Alive group within the group and get the platform and its index
          this.platformPool.forEachAlive(function(platform, index) {
              // Cause Player to collide with Alive Platforms within the group platform
              this.game.physics.arcade.collide(this.player, platform);

             // Platform Checks In order to Kill platform once it has completely left the screen.
             // If the current platform length and the Platofrms childen length is entirely off the screen
              if(platform.length && platform.children[platform.length-1].right < 0) {
                  // Kill the platform
                  platform.kill();
              }
          }, this);

          // If the players body is touching down on the platform
          if(this.player.body.touching.down) {
            // Set the Velocity of the Player so he Does not Move with the Moving platforms
            this.player.body.velocity.x = this.levelSpeed;
          // Else if the players body is not touching down on the platform
          } else {
              // Set the player velocity to 0 so he does not travel when he jumps
             this.player.body.velocity.x = 0;
          }


          // Player Input to Jump
          // If the up key or screen is touched or clicked
          if(this.cursors.up.isDown || this.game.input.activePointer.isDown) {
              // Call player jump method.
            this.playerJump();
              // Else if the buttons are released
          } else if(this.cursors.up.isUp || this.game.input.activePointer.isUp){
              // Player Jumping is set to false.
            this.isJumping = false;
          }

          // Platform Check In order to Create new Ones once Current one is completely on the screen.
          // If the current platform length and the Platofrms childen length is entirely in the screen
          if(this.currentPlatform.length && this.currentPlatform.children[this.currentPlatform.length-1].right < this.game.world.width) {
              // Create a new platform
              this.createPlatform();
          }

          // Coins
          // Kill the coins that leave the screen
          // For each alive coin in the coinPool
          this.coinsPool.forEachAlive(function(coin) {
              // If the coins right edge has left the screen    
            if(coin.right <= 0) {
                // Kill the coin
                coin.kill();
            }
          }, this);

          // Check Overlap between Player and Coins and call collectCoin method if it occurs.
          this.game.physics.arcade.overlap(this.player, this.coinsPool, this.collectCoin, null, this);
          
          // Check if the player needs to die.
          // If the players top has left the screen or the players left has hit the left of screen
          if(this.player.top >= this.world.height || this.player.left <= 0) {
              // Call the game over method
              this.gameOver();
          }
      }
  },
  
  // Method to make the Player Jump
  playerJump: function() {
      
      // Player needs to be touching floor to jump
      if(this.player.body.touching.down) {
        // Starting point of the jump
          this.startJumpY = this.player.y;
          // Keep Track of the fact that it is jumping
          this.isJumping = true;
          // Jump Power has not reached the top
          this.jumpPeaked = false;
          // Set Jump Velocity
          this.player.body.velocity.y = -300;
     // Else if the player is already jumping(the input has not been released) & the jump power hasnt peaked.
      } else if(this.isJumping && !this.jumpPeaked) {
          // The distance jumped will equal where the input started minus where the player was when it released
          var distanceJumped = this.startJumpY - this.player.y;
          // If the distance jumped is less than or equal to the Max Jump Distance
          if(distanceJumped <= this.maxJumpDistance) {
              // Increase the velocity of the player
              this.player.body.velocity.y = -300;
          // Else if the Max Jump Distance is Reached.
          } else {
              // The Jump Has Peaked
              this.jumpPeaked =true;
          }
      }
  },
    
    // method to Load Levels
    loadLevel: function() {
        
        
        // Call method to Create Platform
        this.createPlatform();   
    },
    
    // Method to Create Platform
    createPlatform: function() {
        // Create variable that is eqaul this level data current platform index
        var nextPlatformData = this.generateRandomPlatform();
        
        // If there is a next platform
        if(nextPlatformData) {
            // Check to see if there is a dead one we can use.
            this.currentPlatform = this.platformPool.getFirstDead();
            // If there is not a dead platform to be used
            if(!this.currentPlatform) {
                // Create it.
                this.currentPlatform = new MrHop.Platform(this.game, this.floorPool, nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed, this.coinsPool);
            } else {
                // Prepare the next platform
                this.currentPlatform.prepare(nextPlatformData.numTiles, this.game.world.width + nextPlatformData.separation, nextPlatformData.y, -this.levelSpeed);
            }
            // Add Created Platform to the platform pool
            this.platformPool.add(this.currentPlatform);
        }
    },
    
    // Method to Generate Random Platforms
    generateRandomPlatform: function() {
        // Create an array to store the data required to enter into the create platoform function.
        // We will be generating numbers for the Speration of platforms, y value of platorms and the numTils value.
        var data = [];
        
        // Generate Random Separation Distance from previous platform
        // Set the min required seperation for the paltforms
        var minSeparation = 60;
        // Set the max required seperation for the platforms.
        var maxSeparation = 200;
        // Generate the random number for the serpation.
        // If the random value is 0 we get 60, if its 1 we get 200, or anything in between.
        data.separation = minSeparation + Math.random() * (maxSeparation - minSeparation);
        
        // Generate Random Value for y in regards to the previous platform
        // Min y Value down 120 pixels from previous platform
        var minDify = -120;
        // Max y Value up 120 pixels from previous platform
        var maxDify = 120;
        //Generate random number for the y Value
        // Take the base of the current platform*y* + min Diff + random value between -120 and postive 120.
        data.y = this.currentPlatform.children[0].y + minDify + Math.random() * (maxDify - minDify);
        // Set a max incase number would put the platform out of screen.
        // If its too high we will default to 150
        data.y = Math.max( 150, data.y);
        // Set a min incase number would put the platform out of screen.
        // If its too low we will push it to 50
        data.y = Math.min(this.game.world.height - 50, data.y);
        
        // Generate the Number of Tiles
        // Set the min number of tiles to be used
        var minTiles = 1;
        // Set the max number of tiles to be used
        var maxTiles = 5;
        // Generate the random number for the number of tiles to be used/.
        // If the random value is 0 we get 1, if its 1 we get 5, or anything in between.
        data.numTiles = minTiles + Math.random() * (maxTiles - minTiles);
        
        // Return the Data
        return data;
    },
    
    // Metod to Collect Coins
    collectCoin: function(player, coin) {
        // Kill the coin
        coin.kill();
        // Add to the cointing of coins-- myCoins
        this.myCoins++;
        // Play the Collect Coin Sound
        this.coinSound.play();
        
        //Set the Coint Count label Text to Equal the myCoins Var keeping track of the number of coins collects
        this.coinsCountLabel.text = this.myCoins;
    },
    
    // Method for Game Over
    gameOver: function() {
        // Kill the player
        this.player.kill();
        
        // Update the higher score with Method
        this.updateHighscore();
        
        // Gameover Overlay
        // Create the overlay
        this.overlay = this.add.bitmapData(this.game.width, this.game.height);
        // Color the overlay
        this.overlay.ctx.fillStyle = '#000';
        // Create the overlay shape
        this.overlay.ctx.fillRect(0,0, this.game.width, this.game.height);
        
        // Sprite for this Overlay
        this.panel = this.add.sprite(0, 0, this.overlay);
        // Set the Transpency
        this.panel.alpha = 0.5;
        
        // Create Overlay raising Tween Animation
        var gameOverPanel = this.add.tween(this.panel);
        // this.panel will stop at y; 0 and it will take half a second to get there.
        gameOverPanel.to({y:0}, 500);
        // Stop all movement once overlay reaches top
        gameOverPanel.onComplete.add(function() {
            // Stop the water from scrolling
            this.water.stopScroll();
            //Stop the background from scrolling
            this.background.stopScroll();
            
            // Game Over Text
            // Style for the Game over Text
            var style = {font: '30px Arial', fill: '#fff'};
            // Set the Game Over Text
            this.add.text(this.game.width/2, this.game.height/2, 'Game Over!', style).anchor.setTo(0.5);
            
            // Style for the High Score/Your Score Text
            style = {font: '20px Arial', fill: '#fff'};
            // Set the Highscore Text
            this.add.text(this.game.width/2, this.game.height/2 + 50, 'High Score: ' + this.highScore, style).anchor.setTo(0.5);
            // Set the Your Score Text
            this.add.text(this.game.width/2, this.game.height/2 + 80, 'Your Score: ' + this.myCoins, style).anchor.setTo(0.5);
            
            // Style for the Tap to restart Text
            style = {font: '10px Arial', fill: '#fff'};
            // Tap to restart Text
            this.add.text(this.game.width/2, this.game.height/2 + 120, 'Tap to Restart', style).anchor.setTo(0.5);
            
            // Restart the game in input is heard.
            this.game.input.onDown.addOnce(this.restart, this);
        }, this);
        
        // Initate transition  
        gameOverPanel.start();
    },
    
    // Method to restart the game
    restart: function() {
        // FIX FOR CURRENT TILE SPRITE BUG in PHASER 2.3.0
        // manually remove the tile sprites
        this.game.world.remove(this.background);
        this.game.world.remove(this.water);
        
        // Restart the game state
        this.game.state.start('Game');
    },
    
    // Method used to update high score
    updateHighscore: function() {
        // Get the highscore from the local storage and convert it to anumber with + sign
        this.highScore = +localStorage.getItem('highScore');
        // If the highscore is less than myCoins we have a new high score.
        if(this.highScore < this.myCoins) {
            // Set the highscore to be myCoins
            this.highScore = this.myCoins;
            // Save the high score in the local Storage(Name, Value)
            localStorage.setItem('highScore', this.highScore);
        }
    }
};
