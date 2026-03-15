import Constants from '../snake/constants.js';
import NeuralNet from '../../src/neural_net.js';

var DIRECTIONS = [
  Constants.DIRECTION_NORTH,
  Constants.DIRECTION_EAST,
  Constants.DIRECTION_SOUTH,
  Constants.DIRECTION_WEST
];

function AIPlayer(game, modelData) {
  this.game   = game;
  this.net    = NeuralNet.fromJSON(modelData);
  this.active = false;
  this.steps  = 0;
  this._tickTimeout = null;
}

AIPlayer.prototype.start = function() {
  var self = this;
  this.active = true;
  this.steps  = 0;

  // Stop the game's own timer -- engine.gameTime is the source of truth
  if (this.game.timerInterval) {
    clearInterval(this.game.timerInterval);
    this.game.timerInterval = null;
  }

  // Stop the game's internal tick loop
  if (this.game.tickTimeout) {
    clearTimeout(this.game.tickTimeout);
    this.game.tickTimeout = null;
  }

  // Run our own tick loop via the game's tickAdapter hook
  this.game.tickAdapter = function(game) {
    self._scheduleTick();
  };

  // Before each move, inject the AI's direction decision
  this.game.onBeforeMove = function(game) {
    if (!self.active) return;
    var vision  = game.engine.getVision();
    var outputs = self.net.forward(vision);
    var bestIdx = 0;
    for (var i = 1; i < outputs.length; i++) {
      if (outputs[i] > outputs[bestIdx]) bestIdx = i;
    }
    game.engine.direction = DIRECTIONS[bestIdx];
    self.steps++;
  };

  this._scheduleTick();
};

AIPlayer.prototype._scheduleTick = function() {
  var self = this;
  var game = this.game;
  var interval = game.engine.tickInterval();

  this._tickTimeout = setTimeout(function() {
    self._tickTimeout = null;
    if (!self.active) return;
    if (game.state !== Constants.GAME_STATE_PLAYING) return;

    game.moveOne();

    if (game.state === Constants.GAME_STATE_PLAYING) {
      self._scheduleTick();
    }
  }, interval);
};

AIPlayer.prototype.stop = function() {
  this.active = false;

  if (this._tickTimeout) {
    clearTimeout(this._tickTimeout);
    this._tickTimeout = null;
  }

  // Remove hooks
  this.game.onBeforeMove = null;
  this.game.tickAdapter  = null;

  // Pause so the snake doesn't run uncontrolled while no one is steering
  if (this.game.state === Constants.GAME_STATE_PLAYING) {
    this.game.state = Constants.GAME_STATE_PAUSED;
  }
};

export default AIPlayer;
