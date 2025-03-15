const { gcomp } = require('./gcomp');

const generateRandomArray = (length, min, max) => {
  return Array.from(
    { length },
    () => Math.floor(Math.random() * (max - min + 1)) + min
  );
};
const student_scp = generateRandomArray(6, 1, 10);
const group_scp = generateRandomArray(6, 35, 55);
const goal_scp = generateRandomArray(6, 45, 65);

const result = gcomp(student_scp, group_scp, goal_scp);

console.log('Incompatibility:', result);
