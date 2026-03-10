define(function(require) {
  var Game             = require("snake/game"),
      Constants        = require("snake/constants"),
      KeyboardDispatch = require("snake/keyboard_dispatch"),
      AIPlayer         = require("ai/ai_player"),
      game             = null,
      aiPlayer         = null,
      modelData        = null,
      aiStatusNode     = document.getElementById("ai-status"),
      aiToggleBtn      = document.getElementById("ai-toggle");

  function setToggleOn() {
    aiToggleBtn.textContent = 'AI: ON';
    aiToggleBtn.classList.add('active');
  }

  function setToggleOff() {
    aiToggleBtn.textContent = 'AI: OFF';
    aiToggleBtn.classList.remove('active');
  }

  function newGame() {
    if (aiPlayer) { aiPlayer.stop(); aiPlayer = null; };
    if (game) { game.stop(); };
    aiStatusNode.textContent = "";
    setToggleOff();
    game = new Game();
    KeyboardDispatch(game);
    game.start();
  };

  function enableAI(data) {
    if (!game || game.state === Constants.GAME_STATE_DONE) {
      if (game) game.stop();
      game = new Game();
      KeyboardDispatch(game);
      game.start();
    }
    aiPlayer = new AIPlayer(game, data);
    aiPlayer.start();
    aiStatusNode.textContent = "AI playing";
    setToggleOn();
  }

  function toggleAI() {
    if (aiPlayer && aiPlayer.active) {
      aiPlayer.stop();
      aiPlayer = null;
      aiStatusNode.textContent = "";
      setToggleOff();
    } else {
      if (modelData) {
        enableAI(modelData);
      } else {
        aiStatusNode.textContent = "Loading model...";
        fetch("/models/best.json")
          .then(function(r) { return r.json(); })
          .then(function(data) {
            modelData = data;
            enableAI(data);
          })
          .catch(function() {
            aiStatusNode.textContent = "No model found. Run bin/train first.";
            setToggleOff();
          });
      }
    }
  };

  newGame();

  document.getElementById("new-game").onclick = newGame;
  aiToggleBtn.onclick = toggleAI;
});
