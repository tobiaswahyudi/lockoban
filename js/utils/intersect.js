const parseLine = (p1, p2) => {
  if (p1.x == p2.x) {
    return {
      // this axis notation is actually kinda unintuitive - but i'll flip it another time
      axis: "x", // AKA x = c; thus it spans a y-segment
      align: p1.x,
      lo: Math.min(p1.y, p2.y),
      hi: Math.max(p1.y, p2.y),
    };
  } else {
    return {
      axis: "y", // AKA y = c; thus it spans an x-segment
      align: p1.y,
      lo: Math.min(p1.x, p2.x),
      hi: Math.max(p1.x, p2.x),
    };
  }
};

const makePointOnLine = (axis, c, v) => {
  if (axis == "x") return new Position(c, v);
  return new Position(v, c);
};

const getLineVicinityCap = (isOnLowSide, line) => {
  const loc = isOnLowSide ? line.lo - 1 : line.hi;
  return [
    makePointOnLine(line.axis, line.align - 1, loc),
    makePointOnLine(line.axis, line.align, loc)
  ]
}

const getLineVicinityAlong = (isOnLowPerp, line) => {
  const delta = isOnLowPerp ? -1 : 0;
  const pts = [];
  for (let i = line.lo; i < line.hi; i++) pts.push(makePointOnLine(line.axis, line.align + delta, i));
  return pts;
}

const getLineVicinity = (line, dir) => {
  const isLowSide = dir == Direction.UP || dir == Direction.LEFT

  const dirAxis = (dir == Direction.UP || dir == Direction.DOWN) ? 'y' : 'x';

  // if we're moving up/down, we do caps if the line is x = c aka y-span segment.
  // if we change the axis notation this needs to be negated
  if (dirAxis != line.axis) {
    return {
      type: 'cap',
      points: getLineVicinityCap(isLowSide, line)
    };
  }
  return {
    type: 'along',
    points: getLineVicinityAlong(isLowSide, line)
  };
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
