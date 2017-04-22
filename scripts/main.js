define(function(require) {
  var Game             = require("snake/game"),
      KeyboardDispatch = require("snake/keyboard_dispatch"),
      game             = null;

  function newGame() {
    if (game) { game.stop(); };
    game = new Game();
    KeyboardDispatch(game);
    game.start();
  };

  newGame();

  document.getElementById("new-game").onclick = newGame;

});
