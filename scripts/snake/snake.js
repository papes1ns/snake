define(function(require) {
  var Constants = require("snake/constants"),
      Board     = require("snake/board");

  function Snake() {
    // a Snake instance is an array of Piece instances
    this.pieces = new Array(Constants.DEFAULT_SNAKE_LENGTH);
  };

  return Snake;
});
