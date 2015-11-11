define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Coin = function Coin(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'a1.png');

        var isCollected = false;

        // Setup physics
        this.game = game;
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);

        // Auto-kill this sprite if it is outside of the world boundary
        this.checkWorldBounds = true;
        this.outOfBoundsKill = true;

        // add animation phases
        this.animations.add('spin', [
            'a1.png',
            'a2.png',
            'a3.png',
            'a4.png',
            'a5.png',
            'a6.png',
            'a7.png',
            'a8.png'
        ], 10, true, false);

        // play animation
        this.animations.play('spin', 10, true);
    };

    Coin.prototype = Object.create(Phaser.Sprite.prototype);
    Coin.prototype.constructor = Coin;

    Coin.prototype.regenerate = function(x, y, velocity) {
        this.reset(x, y);
        this.revive();
        this.alpha = 1;
        this.isCollected = false;
        this.body.velocity.x = velocity;
        this.scale.x = 0.2;
        this.scale.y = 0.2;
    };
    return Coin;
});