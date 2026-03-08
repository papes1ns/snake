define(function(require) {
  var Board     = require("snake/board"),
      Constants = require("snake/constants"),
      Snake     = require("snake/snake"),
      scoreNode = document.getElementById("score"),
      rateNode  = document.getElementById("rate"),
      timerNode = document.getElementById("timer");

  function Game() {
    this.snake = new Snake();
    this.board = new Board();
    this.direction = Constants.DIRECTION_NORTH;
    this.state = Constants.GAME_STATE_PLAYING;
    this.score = 0;
    this.directionKeyRegistered = false;
    this.ticksWithoutFood = 0;
    this.startedAt = null;
    this.timerInterval = null;
    this.tickTimeout = null;
  };

  Game.prototype.start = function() {
    this.board.render();
    scoreNode.innerHTML = this.score;
    rateNode.innerHTML = this.nodeRate();
    this.spawnSnake();
    this.generateFood();
    this.startedAt = Date.now();
    this.startTimer();
    this.tick();
  };

  Game.prototype.nodeRate = function() {
    return (1000 / this.tickInterval()).toFixed(2);
  };

  Game.prototype.startTimer = function() {
    var that = this;
    var limit = Constants.GAME_TIME_LIMIT;
    that.updateTimer();
    this.timerInterval = setInterval(function() {
      if (that.state === Constants.GAME_STATE_DONE) {
        clearInterval(that.timerInterval);
        that.timerInterval = null;
        return;
      }
      that.updateTimer();
      var elapsed = (Date.now() - that.startedAt) / 1000;
      if (elapsed >= limit) {
        that.state = Constants.GAME_STATE_DONE;
        that.updateTimer();
      }
    }, 100);
  };

  Game.prototype.updateTimer = function() {
    if (!timerNode) return;
    var elapsed = (Date.now() - this.startedAt) / 1000;
    var remaining = Math.max(0, Constants.GAME_TIME_LIMIT - elapsed);
    timerNode.innerHTML = remaining.toFixed(1);
  };

  Game.prototype.spawnSnake = function() {
    var node;

    for (var i = 0; i < this.snake.pieces.length; i++) {
      node = this.board.getPieceNode(
        Constants.DEFAULT_SNAKE_POSITION_Y,
        Constants.DEFAULT_SNAKE_POSITION_X - i
      );
      node.className = "snake";
      this.board.setPieceType(
        node.piece.positionY,
        node.piece.positionX,
        Constants.GAME_SNAKE_PIECE
      );
      this.snake.pieces[i] = node;
    };

  };

  Game.prototype.tick = function() {
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
    }, this.tickInterval());
  };


  // Arcade-style bit-shift speed: base >> (score >> divisor)
  // Logarithmic ramp — never negative, doubles speed every 2^divisor points
  Game.prototype.tickInterval = function() {
    var shift = this.score >> Constants.TICK_SPEED_DIVISOR;
    return Math.max(Constants.TICK_BASE_INTERVAL >> shift, Constants.TICK_MIN_INTERVAL);
  };

  Game.prototype.moveOne = function() {
    var head, position, tail, y, x, shouldGrow = false;

    switch (this.direction) {
      case Constants.DIRECTION_NORTH:
        position = [this.snake.pieces[0].piece.positionY - 1,
                    this.snake.pieces[0].piece.positionX];
        break;
      case Constants.DIRECTION_EAST:
        position = [this.snake.pieces[0].piece.positionY,
                    this.snake.pieces[0].piece.positionX + 1];
        break;
      case Constants.DIRECTION_SOUTH:
        position = [this.snake.pieces[0].piece.positionY + 1,
                    this.snake.pieces[0].piece.positionX];
        break;
      case Constants.DIRECTION_WEST:
        position = [this.snake.pieces[0].piece.positionY,
                    this.snake.pieces[0].piece.positionX - 1];
        break;
      };

      y = position[0];
      x = position[1];

      head = this.board.getPieceNode(y, x);

      if (!head || head.piece.isSnake()) {
        console.log("collision at y:" + y + ", x:" + x);
        if (!head) {
          this.snake.pieces[0].className = "collision";
        } else {
          head.className = "collision";
        };
        this.state = Constants.GAME_STATE_DONE;
        return;
      };


      if (head.piece.isFood()) {
        shouldGrow = true;
        console.log("yummy!");
        this.generateFood();
        this.score++;
        this.ticksWithoutFood = 0;
        scoreNode.innerHTML = this.score;
        rateNode.innerHTML = this.nodeRate();
      } else {
        this.ticksWithoutFood++;
      };

      head.className = "snake";
      this.board.setPieceType(y, x, Constants.GAME_SNAKE_PIECE);
      this.snake.pieces.unshift(head);

      if(!shouldGrow) {
        tail = this.snake.pieces.pop();
        tail.classList.remove("snake");
        this.board.setPieceType(
          tail.piece.positionY,
          tail.piece.positionX,
          Constants.GAME_EMPTY_PIECE
        );
      };

      var hungerLimit = Constants.HUNGER_BASE + this.snake.pieces.length * Constants.HUNGER_PER_SEGMENT;
      if (this.ticksWithoutFood > hungerLimit) {
        console.log("starved after " + this.ticksWithoutFood + " ticks without food");
        this.state = Constants.GAME_STATE_DONE;
        return;
      };

      this.directionKeyRegistered = false;

  };

  Game.prototype.setDirection = function(direction) {
    if (this.directionKeyRegistered) { return; };
    switch(this.direction) {
      case Constants.DIRECTION_NORTH:
        if (direction != Constants.DIRECTION_SOUTH) { this.direction = direction};
        break;
      case Constants.DIRECTION_WEST:
        if (direction != Constants.DIRECTION_EAST) { this.direction = direction};
        break;
      case Constants.DIRECTION_SOUTH:
        if (direction != Constants.DIRECTION_NORTH) { this.direction = direction};
        break;
      case Constants.DIRECTION_EAST:
        if (direction != Constants.DIRECTION_WEST) { this.direction = direction};
        break;
    };
    this.directionKeyRegistered = true;
  }

  Game.prototype.generateFood = function() {
    var y, x, node;
    y = Math.floor(Math.random() * (Constants.GAME_HEIGHT));
    x = Math.floor(Math.random() * (Constants.GAME_WIDTH));
    node = this.board.getPieceNode(y,x);
    if (!node.piece.isEmpty()) {
      console.log("gererated food clash");
      console.log(node.piece);
      return this.generateFood();
    };
    node.className = "food";
    this.board.setPieceType(y, x, Constants.GAME_FOOD_PIECE);
  }

  Game.prototype.togglePause = function() {
    if (this.state == Constants.GAME_STATE_PAUSED) {
      this.state = Constants.GAME_STATE_PLAYING;
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

  return Game;
});
