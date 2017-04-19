define(function(require) {
  var Constants = require("snake/constants");


  function buildSnake() {
    var snake = new Array();
  };

  function Snake() {
    this.snake = buildSnake();
    return this.snake;
  };

  return Snake;
});