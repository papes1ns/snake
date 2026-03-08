define(function() {
  var constants = new Object();

  constants.GAME_CONTAINER_ID = "main";

  constants.GAME_HEIGHT = 30;
  constants.GAME_WIDTH = 30;

  constants.GAME_STATE_PAUSED = "p";
  constants.GAME_STATE_DONE = "d";
  constants.GAME_STATE_PLAYING = "pl";

  constants.GAME_EMPTY_PIECE = 0;
  constants.GAME_SNAKE_PIECE = 1;
  constants.GAME_FOOD_PIECE  = 2;

  constants.DEFAULT_SNAKE_LENGTH = 1;
  constants.DEFAULT_SNAKE_POSITION_Y = 10;
  constants.DEFAULT_SNAKE_POSITION_X = 10;

  constants.DIRECTION_NORTH = 1;
  constants.DIRECTION_EAST = 2;
  constants.DIRECTION_SOUTH = 3;
  constants.DIRECTION_WEST = 4;

  constants.TICK_BASE_INTERVAL = 100; // miliseconds
  constants.TICK_SPEED_DIVISOR = 3;
  constants.TICK_MIN_INTERVAL = 10;
  constants.GAME_TIME_LIMIT = 300; // seconds

  constants.HUNGER_BASE = (constants.GAME_WIDTH + constants.GAME_HEIGHT) * 2;
  constants.HUNGER_PER_SEGMENT = 3;

  return constants;
});
