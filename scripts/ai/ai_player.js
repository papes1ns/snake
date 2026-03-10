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

  var DIR_NAMES  = ['N', 'E', 'S', 'W'];
  var RAY_NAMES  = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  var SIG_NAMES  = ['Wall', 'Food', 'Body'];
  var LAYER_NAMES = ['Input (24)', 'Hidden 1 (18)', 'Hidden 2 (18)', 'Output (4)'];
  var LAYER_SIZES = [24, 18, 18, 4];
  var SPEED_LABELS = ['Paused', 'Slow (3s)', 'Normal'];

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

  NeuralNet.prototype.forwardDebug = function(inputs) {
    var activations = [inputs.slice()];
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
      activations.push(activation.slice());
    }
    return { activations: activations, output: activation };
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

  // --- Debug panel DOM references ---
  var debugPanel     = document.getElementById('ai-debug');
  var speedSlider    = document.getElementById('speed-slider');
  var speedLabel     = document.getElementById('speed-label');
  var stepBtn        = document.getElementById('step-btn');
  var chosenDirNode  = document.getElementById('chosen-dir');
  var dbgScore       = document.getElementById('dbg-score');
  var dbgSteps       = document.getElementById('dbg-steps');
  var dbgFitness     = document.getElementById('dbg-fitness');
  var dbgSpeed       = document.getElementById('dbg-speed');
  var dbgHunger      = document.getElementById('dbg-hunger');
  var dbgHungerLimit = document.getElementById('dbg-hunger-limit');
  var hungerFill     = document.getElementById('hunger-fill');
  var visionContainer = document.getElementById('vision-container');
  var networkViz     = document.getElementById('network-viz');
  var decisionBarsEl = document.getElementById('decision-bars');

  var visionCells  = [];
  var neuronCells  = [];
  var decisionRows = [];
  var debugBuilt   = false;

  function buildDebugDOM() {
    if (debugBuilt) return;
    debugBuilt = true;

    // --- Vision table ---
    var table = document.createElement('table');
    table.id = 'vision-table';
    var thead = document.createElement('thead');
    var hRow = document.createElement('tr');
    var th0 = document.createElement('th');
    th0.textContent = 'Ray';
    hRow.appendChild(th0);
    for (var s = 0; s < SIG_NAMES.length; s++) {
      var th = document.createElement('th');
      th.textContent = SIG_NAMES[s];
      hRow.appendChild(th);
    }
    thead.appendChild(hRow);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    for (var r = 0; r < RAY_NAMES.length; r++) {
      var tr = document.createElement('tr');
      var labelTd = document.createElement('td');
      labelTd.textContent = RAY_NAMES[r];
      labelTd.style.fontWeight = 'bold';
      labelTd.style.color = '#aaa';
      tr.appendChild(labelTd);
      visionCells[r] = [];
      for (var c = 0; c < 3; c++) {
        var td = document.createElement('td');
        td.textContent = '-';
        tr.appendChild(td);
        visionCells[r][c] = td;
      }
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    visionContainer.appendChild(table);

    // --- Network neurons ---
    for (var l = 0; l < LAYER_SIZES.length; l++) {
      var col = document.createElement('div');
      col.className = 'net-layer';
      var lbl = document.createElement('div');
      lbl.className = 'net-layer-label';
      lbl.textContent = LAYER_NAMES[l];
      col.appendChild(lbl);
      neuronCells[l] = [];
      for (var n = 0; n < LAYER_SIZES[l]; n++) {
        var neuron = document.createElement('div');
        neuron.className = 'neuron';
        col.appendChild(neuron);
        neuronCells[l][n] = neuron;
      }
      if (l < LAYER_SIZES.length - 1) {
        var arrow = document.createElement('div');
        arrow.style.cssText = 'font-size:16px;color:#555;margin:0 2px;align-self:center;';
        arrow.textContent = '\u2192';
        networkViz.appendChild(col);
        networkViz.appendChild(arrow);
      } else {
        networkViz.appendChild(col);
      }
    }

    // --- Decision bars ---
    for (var d = 0; d < DIR_NAMES.length; d++) {
      var row = document.createElement('div');
      row.className = 'decision-row';

      var label = document.createElement('div');
      label.className = 'decision-label';
      label.textContent = DIR_NAMES[d];

      var barBg = document.createElement('div');
      barBg.className = 'decision-bar-bg';
      var fill = document.createElement('div');
      fill.className = 'decision-bar-fill';
      fill.style.width = '0%';
      barBg.appendChild(fill);

      var val = document.createElement('div');
      val.className = 'decision-val';
      val.textContent = '0.00';

      row.appendChild(label);
      row.appendChild(barBg);
      row.appendChild(val);
      decisionBarsEl.appendChild(row);

      decisionRows[d] = { row: row, fill: fill, val: val };
    }
  }

  function neuronColor(value, maxVal) {
    if (maxVal <= 0) return 'hsl(0, 0%, 12%)';
    var norm = Math.min(Math.abs(value) / maxVal, 1);
    var lightness = 12 + Math.round(norm * 50);
    if (value < 0) return 'hsl(0, 60%, ' + lightness + '%)';
    return 'hsl(120, 60%, ' + lightness + '%)';
  }

  function renderDebugPanel(vision, debugData, bestIdx, game, steps) {
    // --- Vision inputs ---
    for (var r = 0; r < 8; r++) {
      var base = r * 3;
      var wallVal = vision[base];
      var foodVal = vision[base + 1];
      var bodyVal = vision[base + 2];

      visionCells[r][0].textContent = wallVal.toFixed(2);
      var wallHue = Math.round(120 * (1 - Math.min(wallVal * 2, 1)));
      visionCells[r][0].style.backgroundColor = 'hsl(' + wallHue + ', 50%, 22%)';

      visionCells[r][1].textContent = foodVal ? 'YES' : '-';
      visionCells[r][1].style.backgroundColor = foodVal ? 'hsl(120, 60%, 28%)' : 'transparent';
      visionCells[r][1].style.color = foodVal ? '#00ff88' : '#666';

      visionCells[r][2].textContent = bodyVal ? 'YES' : '-';
      visionCells[r][2].style.backgroundColor = bodyVal ? 'hsl(0, 60%, 28%)' : 'transparent';
      visionCells[r][2].style.color = bodyVal ? '#ff6666' : '#666';
    }

    // --- Network neurons ---
    var activations = debugData.activations;
    for (var l = 0; l < activations.length; l++) {
      var layer = activations[l];
      var maxVal = 0;
      for (var n = 0; n < layer.length; n++) {
        if (Math.abs(layer[n]) > maxVal) maxVal = Math.abs(layer[n]);
      }
      for (var n2 = 0; n2 < layer.length; n2++) {
        neuronCells[l][n2].style.backgroundColor = neuronColor(layer[n2], maxVal);
        neuronCells[l][n2].title = LAYER_NAMES[l] + '[' + n2 + '] = ' + layer[n2].toFixed(4);
        if (l === activations.length - 1) {
          neuronCells[l][n2].className = n2 === bestIdx ? 'neuron winner' : 'neuron';
        }
      }
    }

    // --- Decision bars ---
    var outputs = debugData.output;
    var maxOut = 0;
    for (var i = 0; i < outputs.length; i++) {
      if (Math.abs(outputs[i]) > maxOut) maxOut = Math.abs(outputs[i]);
    }
    if (maxOut === 0) maxOut = 1;

    for (var d = 0; d < DIR_NAMES.length; d++) {
      var pct = Math.abs(outputs[d]) / maxOut * 100;
      decisionRows[d].fill.style.width = pct + '%';
      decisionRows[d].fill.style.background = outputs[d] >= 0 ? '#44aa66' : '#aa4444';
      decisionRows[d].val.textContent = outputs[d].toFixed(2);
      decisionRows[d].row.className = d === bestIdx ? 'decision-row chosen' : 'decision-row';
    }

    chosenDirNode.textContent = DIR_NAMES[bestIdx];

    // --- Fitness & state ---
    var score = game.score;
    var fitness = score * score * 5000 + steps;
    var hungerLimit = Constants.HUNGER_BASE + game.snake.pieces.length * Constants.HUNGER_PER_SEGMENT;
    var ticksWithoutFood = game.ticksWithoutFood || 0;

    dbgScore.textContent = score;
    dbgSteps.textContent = steps;
    dbgFitness.textContent = fitness.toLocaleString();

    var shift = score >> Constants.TICK_SPEED_DIVISOR;
    var realInterval = Math.max(Constants.TICK_BASE_INTERVAL >> shift, Constants.TICK_MIN_INTERVAL);
    dbgSpeed.textContent = (1000 / realInterval).toFixed(1);

    dbgHunger.textContent = ticksWithoutFood;
    dbgHungerLimit.textContent = hungerLimit;

    var hungerPct = Math.min(100, (ticksWithoutFood / hungerLimit) * 100);
    hungerFill.style.width = hungerPct + '%';
    if (hungerPct > 75) {
      hungerFill.style.background = '#ff2222';
    } else if (hungerPct > 50) {
      hungerFill.style.background = '#ff6644';
    } else {
      hungerFill.style.background = '#ffaa22';
    }
  }

  // --- AIPlayer ---
  function AIPlayer(game, modelData) {
    this.game      = game;
    this.net       = new NeuralNet(modelData);
    this.active    = false;
    this.steps     = 0;
    this._pausedAt = null;
    this._pauseElapsed = 0;
  }

  AIPlayer.prototype.start = function() {
    var self = this;
    this.active = true;
    this.steps  = 0;

    buildDebugDOM();
    debugPanel.style.display = 'block';
    speedSlider.value = '2';
    speedLabel.textContent = 'Normal';
    stepBtn.style.display = 'none';

    var originalMoveOne      = this.game.moveOne;
    var originalTick         = this.game.tick;
    var originalTickInterval = this.game.tickInterval;

    // Monkey-patch moveOne: AI decision + debug panel update
    this.game.moveOne = function() {
      if (self.active && self.game.state === Constants.GAME_STATE_PLAYING) {
        var vision    = getVision(self.game);
        var debugData = self.net.forwardDebug(vision);
        var bestIdx   = 0;
        for (var i = 1; i < debugData.output.length; i++) {
          if (debugData.output[i] > debugData.output[bestIdx]) bestIdx = i;
        }
        self.game.setDirection(DIRECTIONS[bestIdx]);
        self.steps++;
        renderDebugPanel(vision, debugData, bestIdx, self.game, self.steps);
      }
      originalMoveOne.call(self.game);
    };

    // Monkey-patch tick: speed slider controls timing
    this.game.tick = function() {
      var that = this;
      var sliderVal = parseInt(speedSlider.value);

      if (sliderVal === 0) {
        stepBtn.style.display = 'inline-block';
        return;
      }

      stepBtn.style.display = 'none';
      var interval = sliderVal === 1 ? 3000 : originalTickInterval.call(this);

      this.tickTimeout = setTimeout(function() {
        that.tickTimeout = null;
        if (that.state == Constants.GAME_STATE_PAUSED ||
            that.state == Constants.GAME_STATE_DONE) {
          return;
        }
        that.moveOne();
        if (that.state === Constants.GAME_STATE_PLAYING) {
          that.tick();
        }
      }, interval);
    };

    // Step button: advance one tick while paused
    stepBtn.onclick = function() {
      if (self.game.state !== Constants.GAME_STATE_PLAYING) return;
      self.game.moveOne();
    };

    // Slider change: handle pause/resume and timer freeze
    speedSlider.oninput = function() {
      var val = parseInt(this.value);
      speedLabel.textContent = SPEED_LABELS[val];

      if (val === 0) {
        stepBtn.style.display = 'inline-block';
        self._pausedAt = Date.now();
        self._pauseElapsed = Date.now() - self.game.startedAt;
        if (self.game.tickTimeout) {
          clearTimeout(self.game.tickTimeout);
          self.game.tickTimeout = null;
        }
        if (self.game.timerInterval) {
          clearInterval(self.game.timerInterval);
          self.game.timerInterval = null;
        }
      } else {
        stepBtn.style.display = 'none';
        if (self._pausedAt) {
          self.game.startedAt = Date.now() - self._pauseElapsed;
          self._pausedAt = null;
          self.game.startTimer();
        }
        if (self.game.state === Constants.GAME_STATE_PLAYING && !self.game.tickTimeout) {
          self.game.tick();
        }
      }
    };
  };

  AIPlayer.prototype.stop = function() {
    this.active = false;
    this._pausedAt = null;
    debugPanel.style.display = 'none';
  };

  return AIPlayer;
});
