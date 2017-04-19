define(function(require) {
  var Constants = require("snake/constants"),
      _         = require("lib/lodash");

  function buildKey(y, x) {
    return [y.toString(), x.toString()].join(":");
  };

  function Piece(y, x, state) {
    this.positionY = y;
    this.positionX = x;
    this._state = state;
  };

  Piece.getNode = function(y, x) {
    return document.querySelector('[data-key = "'+ buildKey(y,x) +'"]');
  };

  Piece.prototype.key = function() {
    return buildKey(this.positionY, this.positionX);
  };

  Piece.prototype.isEmpty = function() {
    return this._state == Constants.GAME_EMPTY_PIECE;
  };

  Piece.prototype.isFood = function() {
    return this._state == Constants.GAME_FOOD_PIECE;
  };

  Piece.prototype.isSnake = function() {
    return this._state == Constants.GAME_SNAKE_PIECE;
  };

  Piece.prototype.updateState = function(state) {
    this._state = state;
  };

  return Piece;
});