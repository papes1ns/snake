'use strict';

var DIRECTION_NORTH = 1;
var DIRECTION_EAST  = 2;
var DIRECTION_SOUTH = 3;
var DIRECTION_WEST  = 4;

var EMPTY = 0;
var SNAKE = 1;
var FOOD  = 2;

var OPPOSITE = {};
OPPOSITE[DIRECTION_NORTH] = DIRECTION_SOUTH;
OPPOSITE[DIRECTION_SOUTH] = DIRECTION_NORTH;
OPPOSITE[DIRECTION_EAST]  = DIRECTION_WEST;
OPPOSITE[DIRECTION_WEST]  = DIRECTION_EAST;

var TICK_BASE_INTERVAL = 100;
var TICK_SPEED_DIVISOR = 3;
var TICK_MIN_INTERVAL = 10;
var DEFAULT_TIME_LIMIT = 300000;

var HUNGER_BASE        = 120;
var HUNGER_PER_SEGMENT = 3;

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

function HeadlessGame(width, height, timeLimit) {
  this.width     = width     || 30;
  this.height    = height    || 30;
  this.timeLimit = (timeLimit !== undefined) ? timeLimit : DEFAULT_TIME_LIMIT;
  this.reset();
}

HeadlessGame.prototype.reset = function() {
  this.board = [];
  for (var y = 0; y < this.height; y++) {
    this.board[y] = [];
    for (var x = 0; x < this.width; x++) {
      this.board[y][x] = EMPTY;
    }
  }

  // Randomize start position and direction to prevent overfitting
  var margin = 3;
  var startY = margin + Math.floor(Math.random() * (this.height - margin * 2));
  var startX = margin + Math.floor(Math.random() * (this.width  - margin * 2));
  this.snake = [{ y: startY, x: startX }];
  this.board[startY][startX] = SNAKE;
  var dirs = [DIRECTION_NORTH, DIRECTION_EAST, DIRECTION_SOUTH, DIRECTION_WEST];
  this.direction = dirs[Math.floor(Math.random() * dirs.length)];
  this.score = 0;
  this.alive = true;
  this.steps = 0;
  this.stepsWithoutFood = 0;
  this.gameTime = 0;
  this.food = null;
  this.placeFood();
  return this;
};

HeadlessGame.prototype.placeFood = function() {
  var empty = [];
  for (var y = 0; y < this.height; y++) {
    for (var x = 0; x < this.width; x++) {
      if (this.board[y][x] === EMPTY) {
        empty.push({ y: y, x: x });
      }
    }
  }
  if (empty.length === 0) {
    this.alive = false;
    return;
  }
  var cell = empty[Math.floor(Math.random() * empty.length)];
  this.board[cell.y][cell.x] = FOOD;
  this.food = cell;
};

HeadlessGame.prototype.step = function(direction) {
  if (!this.alive) return this;

  if (OPPOSITE[direction] !== this.direction) {
    this.direction = direction;
  }

  var head = this.snake[0];
  var next = this.nextPosition(head, this.direction);

  if (next.y < 0 || next.y >= this.height || next.x < 0 || next.x >= this.width) {
    this.alive = false;
    return this;
  }

  if (this.board[next.y][next.x] === SNAKE) {
    this.alive = false;
    return this;
  }

  var ateFood = this.board[next.y][next.x] === FOOD;
  this.board[next.y][next.x] = SNAKE;
  this.snake.unshift(next);

  if (ateFood) {
    this.score++;
    this.stepsWithoutFood = 0;
    if (this.snake.length < this.width * this.height) {
      this.placeFood();
    } else {
      this.alive = false;
    }
  } else {
    var tail = this.snake.pop();
    this.board[tail.y][tail.x] = EMPTY;
    this.stepsWithoutFood++;
  }

  this.steps++;
  var shift = this.score >> TICK_SPEED_DIVISOR;
  this.gameTime += Math.max(TICK_BASE_INTERVAL >> shift, TICK_MIN_INTERVAL);

  var hungerLimit = HUNGER_BASE + this.snake.length * HUNGER_PER_SEGMENT;
  if (this.stepsWithoutFood > hungerLimit) {
    this.alive = false;
  }

  if (this.timeLimit > 0 && this.gameTime >= this.timeLimit) {
    this.alive = false;
  }

  return this;
};

HeadlessGame.prototype.nextPosition = function(pos, dir) {
  switch (dir) {
    case DIRECTION_NORTH: return { y: pos.y - 1, x: pos.x     };
    case DIRECTION_EAST:  return { y: pos.y,     x: pos.x + 1 };
    case DIRECTION_SOUTH: return { y: pos.y + 1, x: pos.x     };
    case DIRECTION_WEST:  return { y: pos.y,     x: pos.x - 1 };
  }
};

// 8-directional raycasting: for each of N, NE, E, SE, S, SW, W, NW
// returns [1/distToWall, foodVisible, bodyVisible] per ray (24 inputs total)
HeadlessGame.prototype.getVision = function() {
  var head = this.snake[0];
  var inputs = [];

  for (var r = 0; r < RAY_DIRECTIONS.length; r++) {
    var ray = RAY_DIRECTIONS[r];
    var distance  = 0;
    var foodFound = 0;
    var bodyFound = 0;
    var y = head.y;
    var x = head.x;

    while (true) {
      y += ray.dy;
      x += ray.dx;
      distance++;

      if (y < 0 || y >= this.height || x < 0 || x >= this.width) break;

      if (this.board[y][x] === FOOD  && !foodFound) foodFound = 1;
      if (this.board[y][x] === SNAKE && !bodyFound) bodyFound = 1;
    }

    inputs.push(1 / distance);
    inputs.push(foodFound);
    inputs.push(bodyFound);
  }

  return inputs;
};

HeadlessGame.setTimeLimit = function(ms) {
  DEFAULT_TIME_LIMIT = ms;
};

HeadlessGame.DIRECTION_NORTH = DIRECTION_NORTH;
HeadlessGame.DIRECTION_EAST  = DIRECTION_EAST;
HeadlessGame.DIRECTION_SOUTH = DIRECTION_SOUTH;
HeadlessGame.DIRECTION_WEST  = DIRECTION_WEST;
HeadlessGame.EMPTY = EMPTY;
HeadlessGame.SNAKE = SNAKE;
HeadlessGame.FOOD  = FOOD;

module.exports = HeadlessGame;
