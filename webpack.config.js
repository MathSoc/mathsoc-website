const entrypoints = [
  "carousel",
  "collapsible",
  "exam-bank",
  "navbar",
  "admin/generic-editor",
  "admin/documents",
  "admin/image-store",
  "admin/toast",
].reduce((map, currentPath) => {
  map[
    `./public/assets/js/${currentPath}` // output path
  ] = `./public/assets/ts/${currentPath}`; // source file path

  return map;
}, {});

module.exports = {
  entry: entrypoints,
  output: {
    filename: "[name].js",
    path: __dirname,
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [["@babel/preset-env", { targets: "defaults" }]],
            },
          },
          "ts-loader",
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
};
