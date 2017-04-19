define(function(require) {
  var Constants = require("snake/constants");

  function Piece(y, x, state) {
    this.positionY = y;
    this.positionX = x;
    this._state = state;
  };

  Piece.prototype.key = function() {
    return [this.positionY.toString(), this.positionX.toString()].join(":");
  };

  Piece.prototype.isEmpty = function() {
    return this._state == Constants.GAME_EMPTY_PIECE;
  };

  Piece.prototype.isFood = function() {
    return this._state == Constants.GAME_FOOD_PIECE;
  };

  Piece.prototype.isSnake = function() {
    return this._state.state == Constants.GAME_SNAKE_PIECE;
  };

  return Piece;
});