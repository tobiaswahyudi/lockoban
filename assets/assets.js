const FONTS = [
  // ['Edu-SA', ['400', '500', '600', '700']],
  ["Tiny5", ["400"]],
];

const ASSETS = {
  UI: {
    TOOLS: {
      DEFAULT: "assets/ui/tools.png",
      HOVER: "assets/ui/tools-hover.png",
    },
    BUTTON: {
      DEFAULT: "assets/ui/button-lp.png",
      HOVER: "assets/ui/button-lp-hover.png",
      DISABLED: "assets/ui/button-lp-disabled.png",
    },
    FILTER: "assets/ui/filter.png",
  },
};

const COLORS = {
  BLACK: "#0a0a16",
  SLATE: "#272938",
  SCARLET: "#8c0013",
  RED: "#fd0e45",
  PINK: "#fe5a8f",
  CREAM: "#f8e5d7",
  WHITE: "#f5fbff",
};

const _flatten = (obj) => {
  return Object.values(obj).flatMap((v) =>
    typeof v === "object" ? _flatten(v) : v,
  );
};

const ALL_ASSETS = _flatten(ASSETS);
