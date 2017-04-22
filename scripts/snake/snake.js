define(function(require) {
  var Constants = require("snake/constants"),
      Board     = require("snake/board"),
      _         = require("lib/lodash");

  function Snake() {
    // a Snake instance is an array of Piece instances
    this.snake = new Array(Constants.DEFAULT_SNAKE_LENGTH);
    return _.extend(this.snake, mixin);
  };

  var mixin = new Object();

  return Snake;
});
