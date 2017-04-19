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
    this.board.setSnake(this.snake);
    this._renderer.render();
  };

  return Game;
});