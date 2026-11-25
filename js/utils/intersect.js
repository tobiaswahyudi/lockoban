const parseLine = (p1, p2) => {
  if (p1.x == p2.x) {
    return {
      axis: "x",
      align: p1.x,
      lo: Math.min(p1.y, p2.y),
      hi: Math.max(p1.y, p2.y),
    };
  } else {
    return {
      axis: "y",
      align: p1.y,
      lo: Math.min(p1.x, p2.x),
      hi: Math.max(p1.x, p2.x),
    };
  }
};

const between = (inclusive, x, lo, hi) => {
  if (inclusive) return lo <= x && x <= hi;
  return lo < x && x < hi;
};

// Curried
const checkIntersect =
  (l1, strict = true) =>
  (l2) => {
    if (l1.axis == l2.axis) {
      return l1.align == l2.align && l1.lo < l2.hi && l2.lo < l1.hi;
    } else {
      // perpendicular
      return (
        between(strict, l1.align, l2.lo, l2.hi) &&
        between(strict, l2.align, l1.lo, l1.hi)
      );
    }
  };
