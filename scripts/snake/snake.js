define(function(require) {
  var Constants = require("snake/constants"),
      Piece     = require("snake/piece");

  function buildSnake() {
    var head, snake = new Array(Constants.DEFAULT_SNAKE_LENGTH);

    // start by creating the head of the snake useing defualt values
    head = new Piece(
      Constants.DEFAULT_SNAKE_POSITION_Y,
      Constants.DEFAULT_SNAKE_POSITION_X,
      Constants.GAME_SNAKE_PIECE
    );

    snake[0] = head;

    for(var i = 1; i < snake.length; i++) {
      snake[i] = new Piece(
        Constants.DEFAULT_SNAKE_POSITION_Y,
        snake[i-1].positionX - 1,
        Constants.GAME_SNAKE_PIECE
      );
    };

    return snake;
  };

  function Snake() {
    // a Snake instance is an array of Piece instances
    this.snake = buildSnake();
    return this.snake;
  };

  return Snake;
});