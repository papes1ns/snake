define(function(require) {
  var Constants = require("snake/constants");

  var game, keyMap, initialized = false;

  keyMap = {
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    P: 80
  };

  function KeyboardDispatch(gameInstance) {
    registerEvents();
    game = gameInstance;
  };

  function registerEvents() {
    if(initialized == true) { return; };

    document.onkeydown = function(evt) {
      evt = evt || window.event;

      switch(evt.keyCode) {
        case keyMap.LEFT:
          game.setDirection(Constants.DIRECTION_WEST);
          break;
        case keyMap.UP:
          game.setDirection(Constants.DIRECTION_NORTH);
          break;
        case keyMap.RIGHT:
          game.setDirection(Constants.DIRECTION_EAST);
          break;
        case keyMap.DOWN:
          game.setDirection(Constants.DIRECTION_SOUTH);
          break;
        case keyMap.P:
          game.togglePause();
          break;
      };

    };

    initialized = true;
  };




  return KeyboardDispatch;

});
