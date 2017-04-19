define(function(require) {
  var Constants = require("snake/constants"),
      Piece     = require("snake/piece"),
      _         = require("lib/lodash");

  function buildBoard() {
    // board is a two-dimensional array
    // first dimension is height
    // second dimension is width
    var board = new Array(Constants.GAME_HEIGHT);
    for(var y = 0; y < board.length; y++) {
      var row = new Array(Constants.GAME_WIDTH);
      for(var x = 0; x < row.length; x++) {
        row[x] = new Piece(y, x, Constants.GAME_EMPTY_PIECE);
      };
      board[y] = row;
    };

    return board;
  };

  function Board() {
    var board = buildBoard();
    return _.extend(board, methods);
  }

  methods = new Object();

  methods.getPieceNode = function(y, x) {
    var node = Piece.getNode(y, x);
    return _.extend(node, this[y][x]);
  };

  methods.setSnake = function(snake) {
    for(var i = 0; i < snake.length; i++) {
      var y, x, snake, node;
      piece = snake[i];
      y = piece.positionY;
      x = piece.positionX;
      node = this.getPieceNode(y, x);
      node.className += " snake";
      // swap the default board piece with the snakes piece
      this[y][x] = piece;
    };
  };

  return Board;

});