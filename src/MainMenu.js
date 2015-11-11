define([
    'phaser', 'Birdie'
], function(Phaser, Birdie) {
    'use strict';

    //
    // Setup a simple main menu showing a game logo, start button and animated flying 'birdie'
    //

    function MainMenu() {
      this.player = null;
        this.platformsGroup = null;
        this.barriersGroup = null;
        this.coinsGroup = null;
        this.groundFG = null;
        this.groundBG = null;
        this.canPlacePlatform = false;
        this.baddie = null;
        this.emitter = null;
        this.infoBoard = null;
        this.boardText = null;
        this.buttonClickSound = null;
        this.gameOverBoard = null;

        // Scrolling tilesprite parameters
        this.groundBGOffset = -80;
        this.groundFGOffset = -64;
        this.groundScrollSpeedBG = -100;
        this.groundScrollSpeedFG = -200;
    }

    MainMenu.prototype = {
        constructor: MainMenu,

        preload: function() {
        },

        create: function() {
            var sponsorTextStyle = {
                font: "20px Arial",
                fill: "#fff",
                align: "center"
            };

            // Setup stage
            this.game.stage.backgroundColor = '#71c5cf';
            this.game.renderer.renderSession.roundPixels = true;
            this.game.stage.smoothed = false;

            // background
            this.game.add.tileSprite(0, 0, 800, 600, 'bg');

            this.buttonClickSound = this.game.add.audio('button');

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

            // 
            // Setup Text
            //

            // Sponsor text at top right of the screen
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


            //
            // Setup Buttons
            //
            this.startButton = this.game.add.button(this.game.world.centerX, 400, 'play', this.restartGame, this);
            this.startButton.anchor.set(0.5, 0);
            this.startButton.angle = -5; // Kooky twist

            // Juicy button tween to make it see-saw on its axis
            var buttonTween = this.game.add.tween(this.startButton);
            buttonTween.to({
                angle: 5
            }, 2000, Phaser.Easing.Sinusoidal.InOut, true, 100, -1, true);

            // Setup the main logo
            var logo = this.game.add.sprite(this.game.world.centerX, 175, 'logo');
            logo.anchor.set(0.5, 0.5);

            var logoBounce = this.game.add.tween(logo.scale);
            logoBounce.to({
                'x': 0.8,
                'y': 1.2
            }, 1000, Phaser.Easing.Sinusoidal.InOut, true, 100, -1, true);


            // Add birdie to stage
            this.birdie = new Birdie(this.game, this.game.world.width / 2, (this.game.world.height / 2) + 40, null);
            this.game.add.existing(this.birdie);
        },


        restartGame: function() {
            this.buttonClickSound.play();
            this.state.start('Game');
        },
    };

    return MainMenu;
});