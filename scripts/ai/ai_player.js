define(function(require) {
  var Constants = require("snake/constants");

  var RAY_DIRECTIONS = [
    { dy: -1, dx:  0 },
    { dy: -1, dx:  1 },
    { dy:  0, dx:  1 },
    { dy:  1, dx:  1 },
    { dy:  1, dx:  0 },
    { dy:  1, dx: -1 },
    { dy:  0, dx: -1 },
    { dy: -1, dx: -1 }
  ];

  var DIRECTIONS = [
    Constants.DIRECTION_NORTH,
    Constants.DIRECTION_EAST,
    Constants.DIRECTION_SOUTH,
    Constants.DIRECTION_WEST
  ];

  // Minimal neural net forward pass for inference only
  function NeuralNet(data) {
    this.layers  = data.layers;
    this.weights = [];
    this.biases  = [];

    var flat = data.weights;
    var idx  = 0;
    for (var i = 0; i < this.layers.length - 1; i++) {
      var rows = this.layers[i + 1];
      var cols = this.layers[i];
      var w = [];
      for (var r = 0; r < rows; r++) {
        w[r] = [];
        for (var c = 0; c < cols; c++) {
          w[r][c] = flat[idx++];
        }
      }
      this.weights.push(w);

      var b = [];
      for (var j = 0; j < rows; j++) {
        b[j] = flat[idx++];
      }
      this.biases.push(b);
    }
  }

  NeuralNet.prototype.forward = function(inputs) {
    var activation = inputs;
    for (var i = 0; i < this.weights.length; i++) {
      var w = this.weights[i];
      var b = this.biases[i];
      var isOutput = (i === this.weights.length - 1);
      var next = [];
      for (var j = 0; j < w.length; j++) {
        var sum = b[j];
        for (var k = 0; k < activation.length; k++) {
          sum += w[j][k] * activation[k];
        }
        next.push(isOutput ? sum : Math.max(0, sum));
      }
      activation = next;
    }
    return activation;
  };

  // Extract 8-directional vision from the browser-side Game object
  function getVision(game) {
    var head  = game.snake.pieces[0].piece;
    var headY = head.positionY;
    var headX = head.positionX;
    var inputs = [];

    for (var r = 0; r < RAY_DIRECTIONS.length; r++) {
      var ray       = RAY_DIRECTIONS[r];
      var distance  = 0;
      var foodFound = 0;
      var bodyFound = 0;
      var y = headY;
      var x = headX;

      while (true) {
        y += ray.dy;
        x += ray.dx;
        distance++;

        if (y < 0 || y >= Constants.GAME_HEIGHT || x < 0 || x >= Constants.GAME_WIDTH) break;

        var pieceType = game.board.pieces[y][x].type;
        if (pieceType === Constants.GAME_FOOD_PIECE  && !foodFound) foodFound = 1;
        if (pieceType === Constants.GAME_SNAKE_PIECE && !bodyFound) bodyFound = 1;
      }

      inputs.push(1 / distance);
      inputs.push(foodFound);
      inputs.push(bodyFound);
    }

    return inputs;
  }

  function AIPlayer(game, modelData) {
    this.game   = game;
    this.net    = new NeuralNet(modelData);
    this.active = false;
  }

  AIPlayer.prototype.start = function() {
    var self = this;
    this.active = true;

    var originalMoveOne = this.game.moveOne;
    this.game.moveOne = function() {
      if (self.active && self.game.state === Constants.GAME_STATE_PLAYING) {
        var vision  = getVision(self.game);
        var outputs = self.net.forward(vision);
        console.log(outputs);
        var bestIdx = 0;
        for (var i = 1; i < outputs.length; i++) {
          if (outputs[i] > outputs[bestIdx]) bestIdx = i;
        }
        self.game.setDirection(DIRECTIONS[bestIdx]);
      }
      originalMoveOne.call(self.game);
    };
  };

  AIPlayer.prototype.stop = function() {
    this.active = false;
  };

  return AIPlayer;
});
