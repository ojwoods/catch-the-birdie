define([
    'phaser'
], function(Phaser) {
    'use strict';

    var Birdie = function Birdie(game, x, y, frame) {
        Phaser.Sprite.call(this, game, x, y, 'spritesheet', 'frame-1-2.png');
        this.chaseTween = null;

        // Setup Physics
        this.anchor.setTo(0.5, 0.5);
        this.game.physics.arcade.enableBody(this);
        this.body.immovable = true;
        this.game = game;
        this.scale.x = -1;

        // Main flapping animation
        this.animations.add('flap', [
            'baddy1-1.png',
            'baddy1-2.png',
            'baddy1-3.png',
            'baddy1-4.png',
            'baddy1-5.png',
            'baddy1-6.png'

        ], 10, true, false);

        // Explosion animation
        this.animations.add('explode', [
            'explode-1.png',
            'explode-2.png',
            'explode-3.png',
            'explode-4.png',
            'explode-5.png'
        ], 10, true, false);

        // play animation
        this.animations.play('flap', 10, true);
    };

    Birdie.prototype = Object.create(Phaser.Sprite.prototype);
    Birdie.prototype.constructor = Birdie;


    Birdie.prototype.respawn = function() {
        this.reset(this.game.world.width - 50, this.game.world.height / 2);
        this.body.x = this.game.world.width - 50;
        this.body.y = this.game.rnd.integerInRange(100, this.game.height - 100);
        // this.body.velocity.x = -5;

        this.chaseTween = this.game.add.tween(this).to({
            angle: 30,
            x: "-35"
        }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    };

    Birdie.prototype.flyAway = function() {
        // Stop animation
        this.chaseTween.stop();

        // Teen to the edge of the screen
        this.game.add.tween(this).to({
            x: this.game.world.width + 50
        }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    };

    Birdie.prototype.update = function() {};

    return Birdie;
});