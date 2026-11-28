const LOCK_MAP_SIZE = {
  width: 32,
  height: 28,
};

const LOCK_LAYOUT = `
##################################
#................................#
#............................#...#
#.........###################....#
#................................#
#.....#..........................#
#.....#.....###########..........#
#.....#................##........#
#.....#.................#........#
#.....#.................#........#
#.....#...........#.....##########
#.....#...........#..............#
#.........###.....#..............#
#......####.......#....#######...#
#..####...........#...##.....##..#
#..#..............#...........#..#
#..#..............#...........#..#
#..#..............#...........#..#
#..#....#....###..#...........#..#
#..#....######.########.......#..#
#..#....#.........OLLL#####...#..#
#..##...#OO.........L.....K...#..#
#...#...#OO.......OLL.....L...#..#
#...#...#...........K.....L...#..#
#...#...#LLLLLLLLLLK#LLLLK#####..#
#.......#...........#............#
#.......#...........####.........#
#.......#..............###.......#
#.......#................#.......#
#########................#########
`;

// For now the locks cannot touch. We can fix this later its fine
// NOTE: toby, for next games dont do row major. I keep forgetting to flip r/c
//       and for convenience it's easier to spread
const parseMap = () => {
  const mapGrid = LOCK_LAYOUT.split("\n")
    .filter((r) => r.length > 0)
    .map((r) => r.split(""));

  const walls = mapGrid.map((r) => r.map((c) => c == "#"));

  const mapVis = mapGrid.map((r) => r.map((c) => false));
  /** @type [int, int][] */
  const lockKeyholes = [];
  const pushableCells = [];

  mapGrid.forEach((r, ridx) =>
    r.forEach((c, cidx) => {
      if (c == "K") {
        lockKeyholes.push([ridx, cidx]);
      }
      if (c == "O") {
        pushableCells.push([ridx, cidx]);
      }
    }),
  );

  /** @type PLock[] */
  const locks = [];
  /** @type Pushable[] */
  const pushables = [];
  /** @type [int, int][] */
  let curDfsCells = [];

  // must do DFS
  const dfsSource = (cell, r, c) => {
    if (r < 0 || c < 0) return;
    if (r >= mapGrid.length || c >= mapGrid[0].length) return;
    if (mapGrid[r][c] != cell) return;

    if (mapVis[r][c]) return;
    mapVis[r][c] = true;

    curDfsCells.push([r, c]);
    NEWS.forEach((dir) => {
      const { x, y } = DirVec[dir];
      dfsSource(cell, r + x, y + c);
    });
  };

  lockKeyholes.forEach((kh) => {
    curDfsCells = [];
    const [r, c] = kh;
    mapGrid[r][c] = "L";

    dfsSource("L", r, c);

    // remove first cell
    curDfsCells.splice(0, 1);

    // direction = keyhole minus first cell;
    const khVec = new Position(c, r);
    const [fr, fc] = curDfsCells[0];
    const firstCellVec = new Position(fc, fr);

    const pushDir = VecToDir[strPosition(firstCellVec.add(khVec.negate()))];

    locks.push(new PLock(kh, pushDir, curDfsCells));
  });

  pushableCells.forEach((oc) => {
    const [r, c] = oc;
    // absorbed in other stuff
    if(mapVis[r][c]) return;

    curDfsCells = [];

    dfsSource("O", r, c);

    pushables.push(new Pushable(curDfsCells));
  });

  return {
    mapGrid,
    walls,
    locks,
    pushables
  };
};
