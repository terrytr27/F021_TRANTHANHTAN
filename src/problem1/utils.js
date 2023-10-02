const sumToNFirstSol = function (n) {
  let total = 0;
  for (let i = 1; i <= n; i++) {
    total += i;
  }
  return total;
};

const sumToNSecSol = function (n) {
  let numberArray = Array.from(Array(n), (_, i) => i + 1);
  return numberArray.reduce((i, val) => i + val, 0);
};

const sumToNThirdSol = function (n) {
  return (n * (n + 1)) / 2;
};
