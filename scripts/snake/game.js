import Board from './board.js';
import Constants from './constants.js';
import Snake from './snake.js';
import GameCore from '../../src/game_core.js';

var scoreNode  = document.getElementById("score"),
    rateNode   = document.getElementById("rate"),
    timerNode  = document.getElementById("timer"),
    hungerNode = document.getElementById("hunger");

function Game() {
  this.engine = new GameCore(Constants.GAME_WIDTH, Constants.GAME_HEIGHT,
                             Constants.GAME_TIME_LIMIT * 1000);
  this.snake = new Snake();
  this.board = new Board();
  this.state = Constants.GAME_STATE_PLAYING;
  this.directionKeyRegistered = false;
  this.tickTimeout = null;
  this.timerInterval = null;

  // Adapter hooks -- set externally (e.g. by AIPlayer, NNPanel)
  this.onBeforeMove = null;
  this.onAfterMove  = null;
  this.tickAdapter  = null;
};

Game.prototype.start = function() {
  this.board.render();
  this.syncFullBoard();
  scoreNode.innerHTML = this.engine.score;
  rateNode.innerHTML = this.nodeRate();
  this.updateHunger();
  this.startTimer();
  if (this.onAfterMove) this.onAfterMove(this);
  this.tick();
};

Game.prototype.nodeRate = function() {
  return (1000 / this.engine.tickInterval()).toFixed(2);
};

Game.prototype.updateHunger = function() {
  if (!hungerNode) return;
  var e = this.engine;
  var limit     = Constants.HUNGER_BASE + e.snake.length * Constants.HUNGER_PER_SEGMENT;
  var remaining = limit - e.stepsWithoutFood;
  hungerNode.innerHTML = remaining + ' / ' + limit;
};

// Render the entire board from engine state (used on start / reset)
Game.prototype.syncFullBoard = function() {
  for (var y = 0; y < this.engine.height; y++) {
    for (var x = 0; x < this.engine.width; x++) {
      var node = this.board.getPieceNode(y, x);
      var cell = this.engine.board[y][x];
      if (cell === GameCore.SNAKE)     { node.className = "snake"; }
      else if (cell === GameCore.FOOD) { node.className = "food"; }
      else                             { node.className = ""; }
      this.board.setPieceType(y, x, cell);
    }
  }
};

Game.prototype.startTimer = function() {
  var that = this;
  that.updateTimer();
  this.timerInterval = setInterval(function() {
    if (that.state === Constants.GAME_STATE_DONE) {
      clearInterval(that.timerInterval);
      that.timerInterval = null;
      return;
    }
    that.updateTimer();
  }, 100);
};

Game.prototype.updateTimer = function() {
  if (!timerNode) return;
  var remaining = Math.max(0, Constants.GAME_TIME_LIMIT - this.engine.gameTime / 1000);
  timerNode.innerHTML = remaining.toFixed(1);
};

Game.prototype.tick = function() {
  if (this.tickAdapter) {
    this.tickAdapter(this);
    return;
  }

  var that = this;
  this.tickTimeout = setTimeout(function() {
    that.tickTimeout = null;
    if (that.state == Constants.GAME_STATE_PAUSED ||
        that.state == Constants.GAME_STATE_DONE) {
      return;
    };
    that.moveOne();
    if (that.state === Constants.GAME_STATE_PLAYING) {
      that.tick();
    }
  }, this.engine.tickInterval());
};

Game.prototype.moveOne = function() {
  if (this.onBeforeMove) {
    this.onBeforeMove(this);
  }

  var result = this.engine.step(this.engine.direction);
  this.directionKeyRegistered = false;

  if (!result.alive && result.collisionType) {
    var node = this.board.getPieceNode(result.head.y, result.head.x);
    if (node) {
      node.className = "collision";
    } else {
      // Wall collision -- highlight current head
      var engineHead = this.engine.snake[0];
      var headNode = this.board.getPieceNode(engineHead.y, engineHead.x);
      if (headNode) headNode.className = "collision";
    }
    this.state = Constants.GAME_STATE_DONE;
    this.updateTimer();
    return;
  }

  if (!result.alive) {
    this.state = Constants.GAME_STATE_DONE;
    this.updateTimer();
    return;
  }

  // Incremental DOM sync from step result
  var headNode = this.board.getPieceNode(result.head.y, result.head.x);
  headNode.className = "snake";
  this.board.setPieceType(result.head.y, result.head.x, Constants.GAME_SNAKE_PIECE);

  if (result.removedTail) {
    var tailNode = this.board.getPieceNode(result.removedTail.y, result.removedTail.x);
    tailNode.className = "";
    this.board.setPieceType(result.removedTail.y, result.removedTail.x, Constants.GAME_EMPTY_PIECE);
  }

  if (result.ateFood) {
    scoreNode.innerHTML = this.engine.score;
    rateNode.innerHTML = this.nodeRate();
    // Render the newly placed food
    if (this.engine.food) {
      var foodNode = this.board.getPieceNode(this.engine.food.y, this.engine.food.x);
      foodNode.className = "food";
      this.board.setPieceType(this.engine.food.y, this.engine.food.x, Constants.GAME_FOOD_PIECE);
    }
  }

  this.updateHunger();
  this.updateTimer();
  if (this.onAfterMove) this.onAfterMove(this);
};

// Public API for external callers (AI) to advance one step and sync DOM.
// Bypasses the tick loop so the caller controls timing.
Game.prototype.stepAndRender = function(direction) {
  this.engine.direction = direction;
  this.moveOne();
};

Game.prototype.setDirection = function(direction) {
  if (this.directionKeyRegistered) { return; };
  var engine = this.engine;
  switch(engine.direction) {
    case Constants.DIRECTION_NORTH:
      if (direction != Constants.DIRECTION_SOUTH) { engine.direction = direction; };
      break;
    case Constants.DIRECTION_WEST:
      if (direction != Constants.DIRECTION_EAST)  { engine.direction = direction; };
      break;
    case Constants.DIRECTION_SOUTH:
      if (direction != Constants.DIRECTION_NORTH) { engine.direction = direction; };
      break;
    case Constants.DIRECTION_EAST:
      if (direction != Constants.DIRECTION_WEST)  { engine.direction = direction; };
      break;
  };
  this.directionKeyRegistered = true;
};

Game.prototype.togglePause = function() {
  if (this.state == Constants.GAME_STATE_PAUSED) {
    this.state = Constants.GAME_STATE_PLAYING;
    if (!this.timerInterval) {
      this.startTimer();
    }
    this.tick();
  }
  else if (this.state == Constants.GAME_STATE_PLAYING) {
    this.state = Constants.GAME_STATE_PAUSED;
    if (this.tickTimeout) {
      clearTimeout(this.tickTimeout);
      this.tickTimeout = null;
    }
  };
};

Game.prototype.stop = function() {
  this.state = Constants.GAME_STATE_DONE;
  if (this.tickTimeout) {
    clearTimeout(this.tickTimeout);
    this.tickTimeout = null;
  }
  if (this.timerInterval) {
    clearInterval(this.timerInterval);
    this.timerInterval = null;
  }
};

export default Game;
