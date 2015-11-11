define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Baddie = function Baddie(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'baddy1-1.png');
        this.game = game;
        this.maxSpawns = 10; // Don't increase difficulty past this number;
        this.spawnCount = 0; // Count the amount of times spawned so difficulty can be increased
        this.startVelocityX = -85;

        // Setup physics
        this.game.physics.arcade.enableBody(this);
        this.anchor.setTo(0.5, 0.5);
        this.body.immovable = true;
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        // Setup animation frames
        this.animations.add('flap', [
            'frame-1-2.png',
            'frame-2-2.png',
            'frame-3-2.png',
            'frame-4-2.png',
            'frame-5-2.png',
            'frame-6-2.png',
            'frame-7-2.png',
            'frame-8-2.png'
        ], 10, true, false);

        // play animation
        this.animations.play('flap', 10, true);
    };

    Baddie.prototype = Object.create(Phaser.Sprite.prototype);

    Baddie.prototype.constructor = Baddie;

    Baddie.prototype.respawn = function(level) {
        // Count the amount of times spawned so difficulty can be increased
        if (this.spawnCount < this.maxSpawns) {
            this.spawnCount++;
        }

        // Reset position to right edge of the screen
        this.reset(this.game.world.width, this.game.world.height);
        this.body.x = this.game.world.width;

        // Set Y start position to a random value
        this.body.y = this.game.rnd.integerInRange(100, this.game.height - 100);
        this.body.velocity.x = this.velocity;

        // Setup Tween, moves up and down vertically
        // Baddie movement is made wider and faster each time it spawns
        var yTweenRange = (this.game.world.height / 2) + (this.spawnCount * 10);
        var tweenDuration = 2000 - (this.spawnCount * 10);

        this.game.add.tween(this).to({
            y: yTweenRange
        }, tweenDuration, Phaser.Easing.Linear.None, true, 0, 1000, true);
    };

    Baddie.prototype.update = function() {
        // Respawn once reached the end of the screen
        if (this.body.x < 0) {
            this.respawn();
        }
    };

    return Baddie;
});