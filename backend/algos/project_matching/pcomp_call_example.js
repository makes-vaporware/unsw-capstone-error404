const { pcomp } = require('./pcomp');

const isLiked = true;
const group_scp = [1, 2, 3, 4, 5, 6];
const project_scp = [2, 1, 7, 4, 2, 7];

const score = pcomp(isLiked, group_scp, project_scp);
console.log(`The calculated score is: ${score}`);
