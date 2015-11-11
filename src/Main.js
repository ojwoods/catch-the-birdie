(function() {
    'use strict';


    requirejs.config({
        baseUrl: "src/",

        paths: {
            phaser: 'lib/phaser',
        },

        shim: {
            'phaser': {
                exports: 'Phaser'
            }
        }
    });

    require(['phaser', 'Boot', 'Preloader', 'Game', 'MainMenu'], function(Phaser, Boot, Preloader, Game, MainMenu) {
        var game = new Phaser.Game(800, 600, Phaser.AUTO);
        var bootState = new Boot();

        game.state.add('Boot', bootState);
        game.state.add('Preloader', new Preloader());
        game.state.add('MainMenu', new MainMenu());
        game.state.add('Game', new Game());

        //  Now start the Boot state.
        game.state.start('Boot');
    });
}());