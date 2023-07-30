// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require("fs");

function findEntrypoints(subdirectory) {
  const entrynames = fs.readdirSync(`./public/assets/ts/${subdirectory}`);
  let results = [];

  for (const entryname of entrynames) {
    if (entryname.includes(".ts")) {
      results.push(`${subdirectory}${entryname}`.replace(/\.ts$/, ""));
    } else {
      results = results.concat(findEntrypoints(`${subdirectory}${entryname}/`));
    }
  }

  return results;
}

const entrypoints = findEntrypoints("").reduce((map, currentPath) => {
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
