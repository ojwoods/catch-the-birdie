define([
    'phaser', 'Player', 'Platform', 'Barrier', 'Coin', 'Baddie', 'Birdie'
], function(Phaser, Player, Platform, Barrier, Coin, Baddie, Birdie) {
    'use strict';

    function Game() {
        this.player = null;
        this.platformsGroup = null;
        this.barriersGroup = null;
        this.coinsGroup = null;
        this.groundFG = null;
        this.groundBG = null;
        this.canPlacePlatform = false;
        this.baddie = null;
        this.birdie = null;
        this.emitter = null;
        this.arrow = null;
        this.helpplatform = null;

        this.scoreText = null;
        this.finalScoreText = null;
        this.boardText = null;
        this.helpText = null;
        this.sponsorText = null;

        this.gameOverBoard = null;

        this.score = 0;
        this.difficulty = 1;
        this.scrollVelocity = -200;

        this.bounce = null;
        this.coin = null;
        this.splat = null;
        this.buttonClick = null;

        // Scrolling tilesprite parameters
        this.groundBGOffset = -80;
        this.groundFGOffset = -64;
        this.groundScrollSpeedBG = -100;
        this.groundScrollSpeedFG = -200;

        this.barrierGeneratorEvent = null;
        this.coinGeneratorEvent = null;
        this.difficultyIncrementEvent = null;
    }

    Game.prototype = {
        constructor: Game,

        preload: function() {},

        create: function() {
            var sponsorTextStyle = {
                font: "20px Arial",
                fill: "#fff",
                align: "center"
            };

            this.game.stage.backgroundColor = '#71c5cf';

            // Turn smotthing of image, makes it look more pixelated
            this.game.renderer.renderSession.roundPixels = true;
            this.game.stage.smoothed = false;

            // Set the physics system
            this.game.physics.startSystem(Phaser.Physics.ARCADE);
            this.game.physics.arcade.enableBody(this);

            // Background image
            this.game.add.tileSprite(0, 0, 800, 600, 'bg');

            //
            // Setup Ground Graphics
            //

            // Background TileSprite
            this.groundBG = this.game.add.tileSprite(0, this.game.world.height + this.groundBGOffset, this.game.world.width, 64, 'spritesheet', 'ground2.png');
            
            // Foreground TileSprite
            this.groundFG = this.game.add.tileSprite(0, this.game.world.height + this.groundFGOffset, this.game.world.width, 64, 'spritesheet', 'ground.png');
            this.game.physics.arcade.enable(this.groundFG);
            this.groundFG.body.immovable = true;
            this.groundFG.body.allowGravity = false;

            // Scroll ground graphics at different speeds to create a parallax effect
            this.groundBG.autoScroll(this.groundScrollSpeedBG, 0);
            this.groundFG.autoScroll(this.groundScrollSpeedFG, 0); 


            // Setup Emitters
            this.emitter = this.game.add.emitter(0, 0, 4);
            this.emitter.makeParticles('platform-particle');
            this.emitter.gravity = 200;

            // Add gravity to the player to make it fall
            this.game.physics.arcade.enable(this.groundFG);

            // Add player controls
            this.input.onUp.add(this.addPlatform, this);

            // Platforms and Barriers are grouped for reusablility
            this.platformsGroup = this.game.add.group();
            this.barriersGroup = this.game.add.group();
            this.coinsGroup = this.game.add.group();

            this.createGameObjects();

            // Display the bird on the screen
            this.player = new Player(this.game, 100, 50, null);
            this.player.kill();
            this.game.add.existing(this.player);
            this.game.physics.enable(this.player, Phaser.Physics.ARCADE);

            // Add baddie to the stage
            this.baddie = new Baddie(this.game, this.game.width + 100, this.game.world.height / 2, null);
            this.game.add.existing(this.baddie);

            // Add birdie to the stage
            this.birdie = new Birdie(this.game, -50, this.game.world.height / 2, null);
            this.game.add.existing(this.birdie);

            //
            // Setup User interface
            //

            // Game over/ Intro panel
            this.gameOverBoard = this.game.add.group();

            var finalStyle = {
                font: "50px Arial",
                fill: "#fff",
                align: "center"
            };

            this.finalScoreText = this.game.add.text(this.game.world.centerX, this.game.world.centerY - 20, "Score: " + this.score, finalStyle);
            this.finalScoreText.anchor.set(0.5, 0);
            this.finalScoreText.visible = false;
            this.gameOverBoard.add(this.finalScoreText);

            this.boardText = this.gameOverBoard.create(this.game.world.centerX, this.game.world.centerY - 100, 'spritesheet', 'Get-Ready.png');
            this.boardText.anchor.set(0.5, 0);

            this.helpText = this.game.add.text(this.game.world.centerX, this.game.world.centerY, "Add Platform", finalStyle);
            this.helpText.anchor.set(0.5, 0);
            this.helpText.visible = false;

            // Sponsor message text
            this.sponsorText = this.game.add.text(this.game.width - 15, 10, "symmetrical-cow.com", sponsorTextStyle);
            this.sponsorText.anchor.set(1, 0.5);
            var grd = this.sponsorText.context.createLinearGradient(0, 0, 0, this.sponsorText.height);

            //  Add in 2 color gradient
            grd.addColorStop(0, '#000000');
            grd.addColorStop(1, '#6b9e04');

            //  And apply to the Text
            this.sponsorText.fill = grd;

            this.sponsorText.inputEnabled = true;
            this.sponsorText.events.onInputDown.add(function() {
                window.open("http://www.symmetrical-cow.com");
            }, this);

            this.startButton = this.game.add.button(this.game.world.centerX, 350, 'play', this.startButtonEvent, this);
            this.startButton.anchor.set(0.5, 0);

            this.gameOverBoard.add(this.startButton);
            this.gameOverBoard.visible = true;

            // When the panel appears, it bounces from the top of the screen
            var boardBounce = this.game.add.tween(this.gameOverBoard);
            this.gameOverBoard.alpha = 1;
            boardBounce.from({
                y: -this.game.world.height,

            }, 1000, Phaser.Easing.Bounce.Out);
            boardBounce.start();


            //
            // Setup sound effects
            // 
            this.bounce = this.game.add.audio('bounce'); //sound
            this.coin = this.game.add.audio('coin');
            this.splat = this.game.add.audio('splat');
            this.buttonClick = this.game.add.audio('button');


            // Add coins sprite
            var coinsGraphic = this.game.add.sprite(this.game.width / 2 - 5, 5, 'spritesheet', 'Coin-Collection.png');
            coinsGraphic.anchor.set(1, 0);

            // Add score text sprite
            this.scoreText = this.game.add.text(this.game.world.centerX + 5, 5, this.score, sponsorTextStyle);
            this.scoreText.anchor.set(0, 0);

            //Add platform sprite
            this.helpplatform = this.game.add.sprite(this.player.x, this.game.world.centerY + 100, 'spritesheet', 'helpplatform.png');
            this.helpplatform.anchor.set(0.5, 0.5);
            this.helpplatform.visible = false;

            // Add help arrow sprite
            this.arrow = this.game.add.sprite(100, 40, 'spritesheet', 'Up-Green.png');
            this.arrow.anchor.set(0.5, 0.5);
            this.arrow.kill();
        },

        // Function for when the start button is pressed
        startButtonEvent: function() {
            this.buttonClick.play();
            this.restartGame();
        },

        restartGame: function() {
            // Reset score
            this.score = 0;
            this.scoreText.text = (this.score);

            // Reset Animations
            this.player.animations.play('fly', 10, true);
            this.birdie.animations.play('flap', 10, true);

            this.canPlacePlatform = true;
            this.difficulty = 1;
            this.gameStartedTime = this.game.time;

            // Notify all groups to kill their members 
            this.barriersGroup.callAll('kill');
            this.coinsGroup.callAll('kill');
            this.platformsGroup.callAll('kill');

            // Create barrier creation timer
            this.barrierGeneratorEvent = this.game.time.create(false);
            this.barrierGeneratorEvent.loop(Phaser.Timer.SECOND * 2, this.addOneBarrier, this);

            //  Create coin generation timer
            this.coinGeneratorEvent = this.game.time.create(false);
            this.coinGeneratorEvent.loop(Phaser.Timer.SECOND * 0.75, this.generateCoins, this);

            //  Create difficulty level increment timer
            this.difficultyIncrementEvent = this.game.time.create(false);
            this.difficultyIncrementEvent.loop(Phaser.Timer.SECOND * 7, this.increaseDifficulty, this);

            this.coinGeneratorEvent.start();
            this.difficultyIncrementEvent.start();

            this.groundBG.autoScroll(this.groundScrollSpeedBG, 0);
            this.groundFG.autoScroll(this.groundScrollSpeedFG, 0); 

            // Tween the game over panel into view
            var boardBounce = this.game.add.tween(this.gameOverBoard);

            boardBounce.to({
                alpha: 0
            }, 200, Phaser.Easing.Linear.None);
            boardBounce.onComplete.addOnce(function() {
                this.gameOverBoard.visible = false;
            }, this);

            boardBounce.start();

            // Set start positions
            this.playerXPos = 100;
            this.birdie.x = -50;


            //
            // At start of the level, the birdie flys from left to right
            //
            var openingTween = this.game.add.tween(this.birdie).to({
                x: this.game.width - 50
            }, 2000, Phaser.Easing.Cubic.Out, true);

            openingTween.onComplete.addOnce(function() {
                this.player.restartGame(100, 0);
                this.chaseTween = this.game.add.tween(this.birdie).to({

                    x: "-20",
                    y: "-30"
                }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
            }, this);

            //
            // Show and flash the help icon at the start of each level
            //
            this.arrow.reset(this.player.x, 40);
            this.helpplatform.visible = true;

            this.game.add.tween(this.helpplatform).to({

                alpha: 0
            }, 150, Phaser.Easing.Cubic.InOut, true, 0, 10, true).onComplete.addOnce(function() {
                this.arrow.kill();
                this.helpplatform.visible = false;
            }, this);

            openingTween = this.game.add.tween(this.arrow).to({

                alpha: 0
            }, 300, Phaser.Easing.Cubic.InOut, true, 0, 5, true).onComplete.addOnce(function() {
                this.arrow.kill();
                this.helpText.visible = false;
            }, this);

        },

        // GAME OVER!
        playerGameOver: function() {
            this.player.kill();
            this.baddie.kill();

            //
            // Show and animate game over panel
            //
            this.finalScoreText.visible = true;
            this.gameOverBoard.visible = true;

            this.boardText.frameName = 'Game-Over.png';

            var boardBounce = this.game.add.tween(this.gameOverBoard);
            this.gameOverBoard.alpha = 1;
            boardBounce.from({
                y: -this.game.world.height,

            }, 1000, Phaser.Easing.Bounce.Out);
            boardBounce.start();

            //
            // Save high score into local storage
            //
            if (localStorage) {
                var highScore = localStorage['highscore'];
                if (!highScore) {
                    localStorage['highscore'] = this.score;
                } else if (this.score > parseInt(highScore)) {
                    localStorage['highscore'] = this.score;
                }
            }

            this.finalScoreText.visible = true;
            this.finalScoreText.text = " High: " + localStorage['highscore'];

            // Reset to start first level
            this.currentLevel = 1;
        },

        // Setup the next level
        playerNextLevel: function() {
            this.player.kill();
            this.baddie.kill();

            //
            // Show and animate the next level panel
            //
            this.finalScoreText.visible = true;
            this.gameOverBoard.visible = true;

            this.boardText.frameName = 'Stage-Clear.png';
            this.finalScoreText.visible = false;

            var boardBounce = this.game.add.tween(this.gameOverBoard);
            this.gameOverBoard.alpha = 1;
            boardBounce.from({
                y: -this.game.world.height,

            }, 1000, Phaser.Easing.Bounce.Out);
            boardBounce.start();

            // Increment level number, increase scroll speed
            this.currentLevel++;
            this.scrollVelocity = -200 - (this.currentLevel * 10);


            this.groundBG.autoScroll(this.scrollVelocity / 2, 0);
            this.groundFG.autoScroll(this.scrollVelocity, 0);
        },

        // Player animation at game over
        playerDeath: function(winner) {
            // Do not create anymore stuff, event off
            this.stopGame();

            // Death tween, should be like Super Mario
            var deathTween = this.game.add.tween(this.player.body);
            deathTween.to({
                y: "-250"
            }, 1000, Phaser.Easing.Cubic.Out, false, 500);

            deathTween.to({
                y: this.game.height + 30
            }, 1000, Phaser.Easing.Cubic.In, true);
            deathTween.onComplete.addOnce(this.playerGameOver, this);

            this.player.animations.play('killed', 10, false);

            this.chaseTween.stop();
            var openingTween = this.game.add.tween(this.birdie).to({

                x: this.game.width + 50
            }, 2000, Phaser.Easing.Cubic.Out, true);

            this.splat.play();
        },

        // Pause objects in the game when player death animation is playing
        stopGame: function() {
            // Stop events
            this.barrierGeneratorEvent.destroy();
            this.coinGeneratorEvent.destroy();
            this.difficultyIncrementEvent.destroy();

            this.player.alive = false;
            this.player.body.allowGravity = false;

            this.canPlacePlatform = false;

            this.groundBG.autoScroll(0, 0);
            this.groundFG.autoScroll(0, 0);

            // stop everything from moving
            this.coinsGroup.setAll('body.velocity.x', 0);
            this.barriersGroup.setAll('body.velocity.x', 0);
            this.platformsGroup.setAll('body.velocity.x', 0);
            if (this.playerTween) {
                this.playerTween.pause();
            }
        },
        createGameObjects: function() {
            // Coins group
            for (var coinsNdx = 0; coinsNdx < 15; coinsNdx++) {
                var coin = new Coin(this.game, -100, -100);
                this.coinsGroup.add(coin);
            }
            // Barriers group
            for (var barrierNdx = 0; barrierNdx < 5; barrierNdx++) {
                var barrier = new Barrier(this.game, -100, -100);
                this.barriersGroup.add(barrier);
            }
            // Platforms group
            for (var platformNdx = 0; platformNdx < 3; platformNdx++) {
                var platform = new Platform(this.game, -100, -100);
                this.platformsGroup.add(platform);
            }
        },

        quitGame: function(pointer) {
        },

        // Generate a new barrier at the right of the screen
        addOneBarrier: function() {
            var barrier = this.barriersGroup.getFirstExists(false);
            if (barrier) {
                var position = this.game.rnd.pick([1, 2]);
                var yOffest = 0;
                var barrierY = 0;
                var tweenYOffset = null;

                // Remove any existing tween on the object
                this.game.tweens.removeFrom(barrier.body);

                // 
                // Change up-down tween depending on difficulty level
                //
                if (this.difficulty > 3) {
                    tweenYOffset = this.game.rnd.integerInRange(10, 150 + this.difficulty).toString();
                    yOffest = 0;
                } else {
                    yOffest = this.game.rnd.integerInRange(0, 80);
                }

                // Determine if barrier should appear at the top or bottom of the screen
                if (position === 1) //TOP
                {
                    barrierY = 128 - yOffest;
                    tweenYOffset = "-" + tweenYOffset;
                    barrier.scale.y = 1;
                } else if (this.difficulty > 3) {
                    barrierY = this.game.height - 128 + yOffest;
                    tweenYOffset = "+" + tweenYOffset;
                    barrier.scale.y = -1;
                }

                barrier.reset(this.game.width, barrierY);
                barrier.revive();

                if (this.difficulty > 3) {
                    this.game.add.tween(barrier.body).to({
                        y: tweenYOffset
                    }, this.game.rnd.integerInRange(1000, 2000), "Cubic.easeInOut", true, 0, -1, true);
                }


                // Set barrier physics and position
                barrier.body.velocity.x = this.scrollVelocity;
                barrier.checkWorldBounds = true;
                barrier.outOfBoundsKill = true;
                barrier.body.width = 32;
            }
        },

        generateCoins: function() {
            var coin = this.coinsGroup.getFirstDead();

            if (coin) {
                // Randomly position coin in vertical plane
                var yOffest = this.game.rnd.integerInRange(this.game.height / 2 - 100, this.game.height / 2 + 100);

                coin.regenerate(this.birdie.x, this.birdie.y, this.scrollVelocity);

                if (!coin.tween2) {
                    coin.tween2 = this.game.add.tween(coin.scale).to({
                        x: 1,
                        y: 1
                    }, 1500, "Cubic.easeOut");
                }

                coin.tween2.start();
            }
        },

        addPlatform: function() {
            // Can only place a new platform  if player has jumped on previous one
            if (!this.canPlacePlatform) {
                return;
            }
            var platform = this.platformsGroup.getFirstExists(false);
            if (platform) {
                platform.reset(this.game.input.x, this.game.input.y);
                platform.body.velocity.x = this.scrollVelocity;
                platform.alpha = 1.0;

                this.canPlacePlatform = false;
            }
        },

        collectCoin: function(obj1, obj2) {
            //
            // If player collects a coin, animate it and increment score
            //
            if (!obj2.isCollected) {
                // Tween the coin towards the score text and fade out
                var coinTween = this.game.add.tween(obj2);
                coinTween.to({
                    y: 5,
                    x: this.game.width / 2,
                    alpha: 0
                }, 1500, Phaser.Easing.Linear.None);
                coinTween.onComplete.addOnce(function() {
                    obj2.kill;
                    this.score++;
                    this.scoreText.text = this.score;
                }, this);
                coinTween.start();

                obj2.isCollected = true;

                //
                // Collecting a coin move the player forwards towards the bird
                //
                var playerAccelerate = this.game.add.tween(this);
                playerAccelerate.to({
                    playerXPos: "10",
                }, 500, Phaser.Easing.Linear.None);
                playerAccelerate.start();

                this.coin.play();
            }

            return false;
        },


        platformPlayerCollideHandler: function(player, platform) {
            //
            // Handle player colldiding with a platform
            //
            if (platform.alive) {
                // Bounce player and angle it slighly to look like movement
                this.player.bounce();

                this.playerTween = this.game.add.tween(this.player).to({
                    angle: 360
                }, 4000).start();

                // Once platform is bounced upon, we can remove it
                this.canPlacePlatform = true;
                platform.alive = false;
                platform.kill();

                //  Position the emitter where the platform is
                this.emitter.x = platform.body.x + 32;
                this.emitter.y = platform.body.y;
                this.emitter.setAlpha(1, 0);

                this.emitter.start(true, 1000, null, 10);

                // Sound effects
                this.bounce.play();
            }
        },

        addBaddie: function() {
            this.baddie.respawn(this.currentLevel);
        },

        increaseDifficulty: function() {
            this.difficulty++;
            switch (this.difficulty) {
                case 2:
                    this.barrierGeneratorEvent.start();
                    break;
                case 3:
                    this.addBaddie();
                    break;
                default:
            }
        },

        gameWin: function() {
            // Define what happens when the bird is caught
            this.stopGame();
            this.player.animations.play('explode', 10, false);
            this.birdie.animations.play('explode', 10, false);
            this.playerNextLevel();
        },

        update: function() {
            this.player.body.x = this.playerXPos;

            if (this.player.alive) {
                this.game.physics.arcade.collide(this.player, this.platformsGroup, this.platformPlayerCollideHandler, null, this);
                this.game.physics.arcade.collide(this.player, this.barriersGroup, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.baddie, this.playerDeath, null, this);
                this.game.physics.arcade.collide(this.player, this.birdie, this.gameWin, null, this);
                this.game.physics.arcade.collide(this.player, this.coinsGroup, null, this.collectCoin, this);

                if (!this.player.inWorld) {
                    this.playerDeath();
                }
            }

        },
        render: function() {
        }
    };

    return Game;
});