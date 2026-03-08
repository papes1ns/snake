define(function(require) {
  var Game             = require("snake/game"),
      KeyboardDispatch = require("snake/keyboard_dispatch"),
      AIPlayer         = require("ai/ai_player"),
      game             = null,
      aiPlayer         = null,
      aiStatusNode     = document.getElementById("ai-status");

  function newGame() {
    if (aiPlayer) { aiPlayer.stop(); aiPlayer = null; };
    if (game) { game.stop(); };
    aiStatusNode.textContent = "";
    game = new Game();
    KeyboardDispatch(game);
    game.start();
  };

  function aiPlay() {
    if (aiPlayer) { aiPlayer.stop(); };
    if (game) { game.stop(); };
    aiStatusNode.textContent = "Loading model...";

    fetch("/models/best.json")
      .then(function(r) { return r.json(); })
      .then(function(modelData) {
        game     = new Game();
        aiPlayer = new AIPlayer(game, modelData);
        aiPlayer.start();
        game.start();
        aiStatusNode.textContent = "AI playing";
      })
      .catch(function() {
        aiStatusNode.textContent = "No model found. Run bin/train first.";
      });
  };

  newGame();

  document.getElementById("new-game").onclick = newGame;
  document.getElementById("ai-play").onclick  = aiPlay;

});
