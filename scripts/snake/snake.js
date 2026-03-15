import Constants from './constants.js';

function Snake() {
  // a Snake instance is an array of Piece instances
  this.pieces = new Array(Constants.DEFAULT_SNAKE_LENGTH);
};

export default Snake;
