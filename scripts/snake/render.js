define(function(require) {
  var Constants = require("snake/constants"),
      node      = null;

  node = document.getElementById(Constants.GAME_CONTAINER_ID);

  function Render(board) {
    this._board = board;
  };

  Render.prototype.render = function() {
    var html, endTime, startTime = new Date();

    html = new String();
    html += "<table>";
    for(var y = 0; y < this._board.length; y++) {
      html += "<tr>";
      for(x = 0; x < this._board[y].length; x++) {
        html += "<td key='" + this._board[y][x].key() + "'></td>";
      };
      html += "</tr>";
    };
    html += "</table>";

    node.innerHTML = html;
    
    endTime = new Date();
    console.log("rendered board in "+ (endTime - startTime) + " ms");
  };


  return Render;
});