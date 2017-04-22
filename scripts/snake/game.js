define(function(require) {
  var Board     = require("snake/board"),
      Constants = require("snake/constants"),
      Snake     = require("snake/snake"),
      scoreNode = document.getElementById("score"),
      rateNode  = document.getElementById("rate");



  function Game() {
    this.snake = new Snake();
    this.board = new Board();
    this.direction = Constants.DIRECTION_NORTH;
    this.state = Constants.GAME_STATE_PLAYING;
    this.score = 0;
    this.directionKeyRegistered = false;
  };

  Game.prototype.start = function() {
    this.board.render();
    scoreNode.innerHTML = this.score;
    rateNode.innerHTML = this.tickInterval();
    this.spawnSnake();
    this.generateFood();
    this.tick();
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

    setTimeout(function() {
      if (that.state == Constants.GAME_STATE_PAUSED ||
          that.state == Constants.GAME_STATE_DONE) {
        return;
      };

      that.moveOne();

      that.tick();
    }, this.tickInterval());
  };


  Game.prototype.tickInterval = function() {
    return Constants.TICK_INTERVAL - (this.score * Constants.TICK_FASTER_MULTIPLYER);
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
      this.directionKeyRegistered = false;

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
        scoreNode.innerHTML = this.score;
        rateNode.innerHTML = this.tickInterval();
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
    };
  };

  return Game;
});
