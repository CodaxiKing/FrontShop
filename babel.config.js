// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      "@babel/plugin-transform-class-static-block",
      // outros plugins que você eventualmente tenha,
      // SEMPRE deixe o reanimated por último:
      "react-native-reanimated/plugin",
    ],
  };
};
