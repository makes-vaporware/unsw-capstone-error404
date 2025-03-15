const { optimalMapping } = require('./hungarian');

const compatibilityMatrix = [
  [9, 2, 7, 8, 6],
  [6, 4, 3, 7, 5],
  [5, 8, 1, 8, 3],
  [8, 5, 4, 2, 7],
];

const result = optimalMapping(compatibilityMatrix);
console.log(result);
