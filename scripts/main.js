define(function(require) {
  var Game             = require("snake/game"),
      KeyboardDispatch = require("snake/keyboard_dispatch");

  var game = new Game();
  KeyboardDispatch(game);
  game.start();

});
