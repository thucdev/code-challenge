/**
 * Summation to n: sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15
 *
 * For a negative n the result is the signed analogue, e.g.
 * sum_to_n(-5) === -1 + -2 + -3 + -4 + -5 === -15.
 * n === 0 yields 0.
 *
 * Assumes the result is always less than Number.MAX_SAFE_INTEGER.
 */

/**
 * Closed-form (Gauss formula).
 *
 * Time:  O(1)
 * Space: O(1)
 *
 * Most efficient: a constant number of arithmetic operations, independent of n.
 * n * (|n| + 1) is always even, so the result is an integer.
 */
function sum_to_n_a(n) {
  return (n * (Math.abs(n) + 1)) / 2;
}

/**
 * Iterative accumulation.
 *
 * Time:  O(|n|)
 * Space: O(1)
 *
 * Linear in |n|. Extra memory is constant (running total + loop index).
 * Clear and easy to reason about; slower than the closed form for large |n|.
 */
function sum_to_n_b(n) {
  const sign = n < 0 ? -1 : 1;
  const limit = Math.abs(n);
  let sum = 0;

  for (let i = 1; i <= limit; i++) {
    sum += i;
  }

  return sign * sum;
}

/**
 * Recursive accumulation.
 *
 * Time:  O(|n|)
 * Space: O(|n|)  — call-stack frames
 *
 * Same asymptotic time as the loop, but uses linear stack space and can hit
 * the engine's maximum call-stack size for large |n|. Least practical of the three.
 */
function sum_to_n_c(n) {
  if (n === 0) {
    return 0;
  }

  const step = n > 0 ? 1 : -1;
  return n + sum_to_n_c(n - step);
}

module.exports = { sum_to_n_a, sum_to_n_b, sum_to_n_c };

if (require.main === module) {
  const n = Number(process.argv[2] ?? 5);
  console.log(`n = ${n}`);
  console.log("sum_to_n_a:", sum_to_n_a(n));
  console.log("sum_to_n_b:", sum_to_n_b(n));
  console.log("sum_to_n_c:", sum_to_n_c(n));
}
