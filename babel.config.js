const path = require("path");

module.exports = {
  presets: [["@babel/preset-env", { targets: { node: "current" } }]],
  plugins: [
    [
      "module-resolver",
      {
        alias: {
          "@core": path.resolve(__dirname, "src/core"),
          "@enums": path.resolve(__dirname, "src/enums"),
          "@helpers": path.resolve(__dirname, "src/helpers"),
          "@noise": path.resolve(__dirname, "src/noise"),
        },
      },
    ],
  ],
};
