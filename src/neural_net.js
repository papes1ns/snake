function NeuralNet(layers) {
  this.layers = layers.slice();
  this.weights = [];
  this.biases  = [];

  for (var i = 0; i < layers.length - 1; i++) {
    this.weights.push(randomMatrix(layers[i + 1], layers[i]));
    this.biases.push(zeroArray(layers[i + 1]));
  }
}

function randomMatrix(rows, cols) {
  var scale = Math.sqrt(2 / cols);
  var m = [];
  for (var r = 0; r < rows; r++) {
    m[r] = [];
    for (var c = 0; c < cols; c++) {
      m[r][c] = (Math.random() * 2 - 1) * scale;
    }
  }
  return m;
}

function zeroArray(size) {
  var a = [];
  for (var i = 0; i < size; i++) a[i] = 0;
  return a;
}

NeuralNet.prototype.forward = function(inputs) {
  var activation = inputs;
  this.lastActivations = [inputs];

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
    this.lastActivations.push(activation);
  }

  return activation;
};

NeuralNet.prototype.getWeightsFlat = function() {
  var flat = [];
  for (var i = 0; i < this.weights.length; i++) {
    for (var r = 0; r < this.weights[i].length; r++) {
      for (var c = 0; c < this.weights[i][r].length; c++) {
        flat.push(this.weights[i][r][c]);
      }
    }
    for (var j = 0; j < this.biases[i].length; j++) {
      flat.push(this.biases[i][j]);
    }
  }
  return flat;
};

NeuralNet.prototype.setWeightsFlat = function(flat) {
  var idx = 0;
  for (var i = 0; i < this.weights.length; i++) {
    for (var r = 0; r < this.weights[i].length; r++) {
      for (var c = 0; c < this.weights[i][r].length; c++) {
        this.weights[i][r][c] = flat[idx++];
      }
    }
    for (var j = 0; j < this.biases[i].length; j++) {
      this.biases[i][j] = flat[idx++];
    }
  }
};

NeuralNet.prototype.clone = function() {
  var nn = new NeuralNet(this.layers);
  nn.setWeightsFlat(this.getWeightsFlat());
  return nn;
};

NeuralNet.prototype.toJSON = function() {
  return { layers: this.layers, weights: this.getWeightsFlat() };
};

NeuralNet.fromJSON = function(json) {
  var nn = new NeuralNet(json.layers);
  nn.setWeightsFlat(json.weights);
  return nn;
};

export default NeuralNet;
