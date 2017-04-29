define(function(require) {
  var Constants = require("snake/constants"),
      Piece     = require("snake/piece");

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
    this.pieces = buildBoard();
  }

  Board.prototype.getPieceNode = function(y, x) {
    if (!this.exists(y, x)) { return null; };

    var node = Piece.getNode(y, x);
    node.piece = this.pieces[y][x];
    return node;
  };

  Board.prototype.exists = function(y, x) {
    return !(y > Constants.GAME_HEIGHT-1 || y < 0 || x > Constants.GAME_WIDTH-1 || x < 0);
  };

  Board.prototype.render = function() {
    var table, row, cell, node, endTime, startTime = new Date();

    table = document.createElement("TABLE");
    for(var y = 0; y < this.pieces.length; y++) {
      row = table.insertRow(y);
      for(x = 0; x < this.pieces[y].length; x++) {
        cell = row.insertCell(x);
        cell.setAttribute("data-key", this.pieces[y][x].key());
      };
    };

    node = document.getElementById(Constants.GAME_CONTAINER_ID);
    node.removeChild(node.firstChild);
    node.appendChild(table);

    endTime = new Date();
    console.log("rendered board in "+ (endTime - startTime) + " ms");
  };

  Board.prototype.setPieceType = function(y, x, type) {
    if (!this.exists(y, x)) { return null; };
    this.pieces[y][x].type = type;
  };

  return Board;


});
