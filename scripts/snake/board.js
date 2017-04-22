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
    this.board = buildBoard();
    return _.extend(this.board, mixin);
  }

  mixin = new Object();

  mixin.getPieceNode = function(y, x) {
    if (!this.exists(y, x)) { return null; };

    var node = Piece.getNode(y, x);
    return _.extend(node, this[y][x]);
  };

  mixin.exists = function(y, x) {
    if (y > Constants.GAME_HEIGHT || y < 0 || x > Constants.GAME_WIDTH || x < 0) {
      return false;
    };
    return true;
  };

  mixin.render = function() {
    var html, node, endTime, startTime = new Date();

    html = new String();
    html += "<table>";
    for(var y = 0; y < this.length; y++) {
      html += "<tr>";
      for(x = 0; x < this[y].length; x++) {
        html += "<td data-key='" + this[y][x].key() + "'></td>";
      };
      html += "</tr>";
    };
    html += "</table>";

    node = document.getElementById(Constants.GAME_CONTAINER_ID);
    node.innerHTML = html;

    endTime = new Date();
    console.log("rendered board in "+ (endTime - startTime) + " ms");
  };

  mixin.setPieceType = function(y, x, type) {
    if (!this.exists(y, x)) { return null; };
    this[y][x].setType(type);
  };

  return Board;


});
