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
#..#....#.............#####...#..#
#..##...#.....................#..#
#...#...#.....................#..#
#...#...#.....................#..#
#...#...#LLLLLLLLLLK#.....#####..#
#.......#...........#............#
#.......#...........####.........#
#.......#..............###.......#
#.......#................#.......#
#########................#########
`;

// For now the locks cannot touch. We can fix this later its fine
const parseMap = () => {
  const mapGrid = LOCK_LAYOUT.split("\n")
    .filter((r) => r.length > 0)
    .map((r) => r.split(""));

  const walls = mapGrid.map((r) => r.map((c) => c == "#"));

  const mapVis = mapGrid.map((r) => r.map((c) => false));
  /** @type [int, int][] */
  const lockKeyholes = [];

  mapGrid.forEach((r, ridx) =>
    r.forEach((c, cidx) => {
      if (c == "K") {
        lockKeyholes.push([ridx, cidx]);
      }
    }),
  );

  /** @type PLock[] */
  const locks = [];
  /** @type [int, int][] */
  let curDfsCells = [];

  // must do DFS
  const dfsSource = (r, c) => {
    if (r < 0 || c < 0) return;
    if (r >= mapGrid.length || c >= mapGrid[0].length) return;
    if (mapVis[r][c]) return;
    mapVis[r][c] = true;

    if (mapGrid[r][c] != "L") return;
    curDfsCells.push([r, c]);
    NEWS.forEach((dir) => {
      const { x, y } = DirVec[dir];
      dfsSource(r + x, y + c);
    });
  };

  lockKeyholes.forEach(kh => {
    curDfsCells = [];
    const [r, c] = kh;
    mapGrid[r][c] = 'L';

    dfsSource(r, c);

    // remove first cell
    curDfsCells.splice(0, 1);

    // direction = keyhole minus first cell;
    const khVec = new Position(c, r);
    const [fr, fc] = curDfsCells[0];
    const firstCellVec = new Position(fc, fr);

    const pushDir = VecToDir[strPosition(firstCellVec.add(khVec.negate()))];

    locks.push(new PLock(kh, pushDir, curDfsCells));
  })

  return {
    mapGrid,
    walls,
    locks
  }
};
