define(function(require) {
  var Constants = require("snake/constants"),
      _         = require("lib/lodash");

  function buildKey(y, x) {
    return [y.toString(), x.toString()].join(":");
  };

  function Piece(y, x, type) {
    this.positionY = y;
    this.positionX = x;
    this.type = type;
  };

  Piece.getNode = function(y, x) {
    return document.querySelector('[data-key = "'+ buildKey(y,x) +'"]');
  };

  Piece.prototype.key = function() {
    return buildKey(this.positionY, this.positionX);
  };

  Piece.prototype.isEmpty = function() {
    return this.type == Constants.GAME_EMPTY_PIECE;
  };

  Piece.prototype.isFood = function() {
    return this.type == Constants.GAME_FOOD_PIECE;
  };

  Piece.prototype.isSnake = function() {
    return this.type == Constants.GAME_SNAKE_PIECE;
  };

  return Piece;
});