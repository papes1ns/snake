define(function(require) {
  var Board     = require("snake/board"),
      Constants = require("snake/constants"),
      Snake     = require("snake/snake");

  function Game() {
    this.snake = new Snake();
    this.board = new Board();
    this.direction = Constants.DIRECTION_WEST;
    this.interval = Constants.TICK_INTERVAL;
    this.state = Constants.GAME_STATE_PAUSED;
  };

  Game.prototype.start = function() {
    this.board.render();
    main();
  };


  function main(){
    
  };

  return Game;
});