import Game from './snake/game.js';
import Constants from './snake/constants.js';
import KeyboardDispatch from './snake/keyboard_dispatch.js';
import AIPlayer from './ai/ai_player.js';
import NNPanel from './ai/nn_panel.js';
import NeuralNet from '../src/neural_net.js';

var game, aiPlayer, modelData, viewNet;
var statusEl  = document.getElementById("ai-status");
var toggleBtn = document.getElementById("ai-toggle");
var pauseBtn  = document.getElementById("pause-toggle");
var nnPanel   = new NNPanel(document.getElementById("nn-panel"));

function newGame() {
  if (aiPlayer) { aiPlayer.stop(); aiPlayer = null; }
  if (game) game.stop();
  game = new Game();
  game.onAfterMove = function(g) {
    nnPanel.update(g.engine, aiPlayer ? aiPlayer.net : viewNet);
    syncButtons();
  };
  KeyboardDispatch(game);
  game.start();
  if (modelData) startAI();
  syncButtons();
}

function startAI() {
  if (!game || game.state === Constants.GAME_STATE_DONE) return;
  if (game.state === Constants.GAME_STATE_PAUSED)
    game.state = Constants.GAME_STATE_PLAYING;
  aiPlayer = new AIPlayer(game, modelData);
  aiPlayer.start();
  statusEl.textContent = "AI playing";
  toggleBtn.textContent = "AI: ON";
}

function stopAI() {
  if (aiPlayer) { aiPlayer.stop(); aiPlayer = null; }
  statusEl.textContent = "";
  toggleBtn.textContent = "AI: OFF";
}

function toggleAI() {
  if (aiPlayer) {
    stopAI();
  } else {
    loadModel().then(startAI).catch(function() {
      statusEl.textContent = "No model. Run bin/train first.";
    });
  }
}

function togglePause() {
  if (!game || game.state === Constants.GAME_STATE_DONE) return;
  if (aiPlayer && aiPlayer.active) {
    aiPlayer.stop();
    statusEl.textContent = "Paused";
  } else if (aiPlayer) {
    game.state = Constants.GAME_STATE_PLAYING;
    aiPlayer.active = true;
    aiPlayer.start();
    statusEl.textContent = "AI playing";
  } else {
    game.togglePause();
  }
  syncButtons();
}

function syncButtons() {
  if (!game) return;
  pauseBtn.textContent = game.state === Constants.GAME_STATE_PAUSED ? "Resume" : "Pause";
}

function loadModel() {
  if (modelData) return Promise.resolve(modelData);
  return fetch("models/best.json")
    .then(function(r) { if (!r.ok) throw new Error(); return r.json(); })
    .then(function(d) { modelData = d; viewNet = NeuralNet.fromJSON(d); return d; });
}

loadModel()
  .then(function() { newGame(); })
  .catch(function() { statusEl.textContent = "No model. Run bin/train first."; newGame(); });

document.getElementById("new-game").onclick = newGame;
toggleBtn.onclick = toggleAI;
pauseBtn.onclick = togglePause;
