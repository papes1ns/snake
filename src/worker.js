import NeuralNet from './neural_net.js';
import Agent from './agent.js';
import GameCore from './game_core.js';

// Must match GeneticAlgorithm.prototype.fitness in genetic.js
function fitness(score, steps) {
  return score * score * 5000 + steps;
}

process.on('message', function(msg) {
  if (msg.type === 'init') {
    GameCore.setTimeLimit(msg.timeLimit);
    process.send({ type: 'ready' });
    return;
  }

  if (msg.type === 'evaluate') {
    var batch        = msg.batch;
    var gamesPerEval = msg.gamesPerEval;
    var game         = new GameCore();
    var results      = [];

    for (var i = 0; i < batch.length; i++) {
      var item  = batch[i];
      var net   = NeuralNet.fromJSON(item);
      var agent = new Agent(net);
      var totalFitness = 0;
      var bestScore    = 0;

      for (var g = 0; g < gamesPerEval; g++) {
        var result = agent.play(game);
        totalFitness += fitness(result.score, result.steps);
        if (result.score > bestScore) bestScore = result.score;
      }

      results.push({
        id:      item.id,
        fitness: totalFitness / gamesPerEval,
        score:   bestScore
      });
    }

    process.send({ type: 'results', results: results });
  }
});
