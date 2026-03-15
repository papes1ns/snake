import GameCore from './game_core.js';

var DIRECTIONS = [
  GameCore.DIRECTION_NORTH,
  GameCore.DIRECTION_EAST,
  GameCore.DIRECTION_SOUTH,
  GameCore.DIRECTION_WEST
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

export default Agent;
