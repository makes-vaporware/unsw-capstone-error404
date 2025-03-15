const pcomp = (isLiked, group_scp, project_scp) => {
  let totalDifference = 0;
  for (let i = 0; i < group_scp.length; i++) {
    totalDifference += Math.abs(group_scp[i] - project_scp[i]);
  }

  let score = totalDifference;
  if (isLiked) {
    score *= 1.5;
  }

  return score;
};

module.exports = { pcomp };
