'use strict';

var HeadlessGame = require('./headless_game');

var DIRECTIONS = [
  HeadlessGame.DIRECTION_NORTH,
  HeadlessGame.DIRECTION_EAST,
  HeadlessGame.DIRECTION_SOUTH,
  HeadlessGame.DIRECTION_WEST
];

function Agent(neuralNet) {
  this.net = neuralNet;
}

Agent.prototype.decide = function(game) {
  var vision  = game.getVision();
  var outputs = this.net.forward(vision);

  var bestIdx = 0;
  for (var i = 1; i < outputs.length; i++) {
    if (outputs[i] > outputs[bestIdx]) bestIdx = i;
  }
  return DIRECTIONS[bestIdx];
};

Agent.prototype.play = function(game) {
  game.reset();
  while (game.alive) {
    var dir = this.decide(game);
    game.step(dir);
  }
  return { score: game.score, steps: game.steps };
};

module.exports = Agent;
