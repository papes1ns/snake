define(function(require) {
  var Board  = require("snake/board"),
      Render = require("snake/render"),
      Snake  = require("snake/snake");

  function Game() {
    this.snake = new Snake();
    this.board = new Board();
    this._renderer = new Render(this.board);
  };

  Game.prototype.start = function() {
    this._renderer.render();
    this.board.setSnake(this.snake);
    console.log(this.board.getPieceNode(10,10).key());
  };

  return Game;
});