const gcomp = (student_scp, group_scp, goal_scp) => {
  const total_scp = student_scp.map((value, index) => value + group_scp[index]);
  const diff_scp = total_scp.map((value, index) =>
    Math.abs(goal_scp[index] - value)
  );
  const incompatibility = diff_scp.reduce(
    (accumulator, value) => accumulator + value,
    0
  );

  return incompatibility;
};

module.exports = { gcomp };
