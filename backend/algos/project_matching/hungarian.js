const hungarianAlgorithm = (costMatrix) => {
  const n = costMatrix.length;
  const m = costMatrix[0].length;

  const u = Array(n).fill(0);
  const v = Array(m).fill(0);
  const p = Array(m + 1).fill(-1);
  const way = Array(m + 1).fill(-1);

  for (let i = 0; i < n; i++) {
    const minv = Array(m + 1).fill(Infinity);
    const used = Array(m + 1).fill(false);
    let j0 = 0;
    p[0] = i;

    do {
      used[j0] = true;
      const i0 = p[j0];
      let delta = Infinity;
      let j1 = -1;
      for (let j = 1; j <= m; j++) {
        if (!used[j]) {
          const cur = costMatrix[i0][j - 1] - u[i0] - v[j - 1];
          if (cur < minv[j]) {
            minv[j] = cur;
            way[j] = j0;
          }
          if (minv[j] < delta) {
            delta = minv[j];
            j1 = j;
          }
        }
      }
      for (let j = 0; j <= m; j++) {
        if (used[j]) {
          u[p[j]] += delta;
          v[j - 1] -= delta;
        } else {
          minv[j] -= delta;
        }
      }
      j0 = j1;
    } while (p[j0] !== -1);

    do {
      const j1 = way[j0];
      p[j0] = p[j1];
      j0 = j1;
    } while (j0 !== 0);
  }

  const result = Array(n)
    .fill(null)
    .map(() => Array(m).fill(0));
  for (let j = 1; j <= m; j++) {
    if (p[j] !== -1) {
      result[p[j]][j - 1] = 1;
    }
  }
  return result;
};

function optimalMapping(compatibilityMatrix) {
  const costMatrix = compatibilityMatrix.map((row) => row.map((val) => -val));
  return hungarianAlgorithm(costMatrix);
}

module.exports = { optimalMapping };
