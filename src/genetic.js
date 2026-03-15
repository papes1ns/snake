import NeuralNet from './neural_net.js';
import Agent from './agent.js';
import GameCore from './game_core.js';

function GeneticAlgorithm(options) {
  options = options || {};
  this.populationSize = options.populationSize || 1000;
  this.mutationRate   = options.mutationRate   || 0.05;
  this.mutationScale  = options.mutationScale  || 0.3;
  this.eliteCount     = options.eliteCount     || Math.max(1, Math.floor(this.populationSize * 0.05));
  this.tournamentSize = options.tournamentSize || 5;
  this.layers         = options.layers         || [30, 20, 20, 4];
  this.gamesPerEval   = options.gamesPerEval   || 8;

  this.population = [];
  for (var i = 0; i < this.populationSize; i++) {
    this.population.push(new NeuralNet(this.layers));
  }

  this.generation  = 0;
  this.bestFitness = -Infinity;
  this.bestNet     = null;
}

// Quadratic score reward with survival bonus. The 100s game time limit
// naturally punishes slow play while the survival term rewards longevity.
GeneticAlgorithm.prototype.fitness = function(score, steps) {
  return score * score * 5000 + steps;
};

GeneticAlgorithm.prototype.evaluate = function() {
  var game    = new GameCore();
  var results = [];

  for (var i = 0; i < this.population.length; i++) {
    var net   = this.population[i];
    var agent = new Agent(net);
    var totalFitness = 0;
    var bestScore    = 0;

    for (var g = 0; g < this.gamesPerEval; g++) {
      var result = agent.play(game);
      totalFitness += this.fitness(result.score, result.steps);
      if (result.score > bestScore) bestScore = result.score;
    }

    results.push({
      net:     net,
      fitness: totalFitness / this.gamesPerEval,
      score:   bestScore
    });
  }

  results.sort(function(a, b) { return b.fitness - a.fitness; });
  return results;
};

GeneticAlgorithm.prototype.select = function(results) {
  var best = null;
  for (var i = 0; i < this.tournamentSize; i++) {
    var idx = Math.floor(Math.random() * results.length);
    if (!best || results[idx].fitness > best.fitness) {
      best = results[idx];
    }
  }
  return best.net;
};

GeneticAlgorithm.prototype.crossover = function(parent1, parent2) {
  var child = new NeuralNet(this.layers);
  var w1 = parent1.getWeightsFlat();
  var w2 = parent2.getWeightsFlat();
  var childWeights = [];

  var crossPoint = Math.floor(Math.random() * w1.length);
  for (var i = 0; i < w1.length; i++) {
    childWeights.push(i < crossPoint ? w1[i] : w2[i]);
  }

  child.setWeightsFlat(childWeights);
  return child;
};

GeneticAlgorithm.prototype.mutate = function(net) {
  var weights = net.getWeightsFlat();
  for (var i = 0; i < weights.length; i++) {
    if (Math.random() < this.mutationRate) {
      weights[i] += gaussianRandom() * this.mutationScale;
    }
  }
  net.setWeightsFlat(weights);
};

// Serialize population for distribution to worker processes
GeneticAlgorithm.prototype.getPopulationData = function() {
  var data = [];
  for (var i = 0; i < this.population.length; i++) {
    var json = this.population[i].toJSON();
    json.id = i;
    data.push(json);
  }
  return data;
};

GeneticAlgorithm.prototype.evolve = function() {
  var results = this.evaluate();
  return this._nextGeneration(results);
};

// Evolve from externally-computed fitness (parallel workers).
// fitnesses is an array indexed by population position: [{fitness, score}, ...]
GeneticAlgorithm.prototype.evolveFromResults = function(fitnesses) {
  var results = [];
  for (var i = 0; i < this.population.length; i++) {
    results.push({
      net:     this.population[i],
      fitness: fitnesses[i].fitness,
      score:   fitnesses[i].score
    });
  }
  results.sort(function(a, b) { return b.fitness - a.fitness; });
  return this._nextGeneration(results);
};

GeneticAlgorithm.prototype._nextGeneration = function(results) {
  var best = results[0];

  if (best.fitness > this.bestFitness) {
    this.bestFitness = best.fitness;
    this.bestNet     = best.net.clone();
  }

  var newPop = [];

  for (var i = 0; i < this.eliteCount && i < results.length; i++) {
    newPop.push(results[i].net.clone());
  }

  while (newPop.length < this.populationSize) {
    var p1    = this.select(results);
    var p2    = this.select(results);
    var child = this.crossover(p1, p2);
    this.mutate(child);
    newPop.push(child);
  }

  this.population = newPop;
  this.generation++;

  return {
    generation:  this.generation,
    bestFitness: best.fitness,
    bestScore:   best.score,
    avgFitness:  results.reduce(function(s, r) { return s + r.fitness; }, 0) / results.length,
    topScores:   results.slice(0, 5).map(function(r) { return r.score; })
  };
};

function gaussianRandom() {
  var u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export default GeneticAlgorithm;
