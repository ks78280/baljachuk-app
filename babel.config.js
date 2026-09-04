module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind", worklets: false, reanimated: false }],
      "nativewind/babel",
    ],
  };
};
