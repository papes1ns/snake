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
    // board needs to act like an array but also a respond to game related calls
    return _.extend(board, methods);
  }

  methods = new Object();

  methods.height = function() {
    return this.length;
  };

  methods.setSnake

  return Board;

});