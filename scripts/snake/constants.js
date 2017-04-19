define(function() {
  var constants = new Object();

  constants.GAME_CONTAINER_ID = "main";

  constants.GAME_HEIGHT = 20;
  constants.GAME_WIDTH = 20;

  constants.GAME_EMPTY_PIECE = 0;
  constants.GAME_SNAKE_PIECE = 1;
  constants.GAME_FOOD_PIECE  = 2;

  constants.DEFAULT_SNAKE_LENGTH = 4;
  constants.DEFAULT_SNAKE_POSITION_Y = 10;
  constants.DEFAULT_SNAKE_POSITION_X = 10;

  return constants;
});