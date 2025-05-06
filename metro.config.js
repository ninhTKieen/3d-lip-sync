// Learn more https://docs.expo.io/guides/customizing-metro
module.exports = async () => {
  const { getDefaultConfig } = require("expo/metro-config");

  /** @type {import('expo/metro-config').MetroConfig} */
  const config = getDefaultConfig(__dirname);

  //   config.resolver.assetExts = ["js", "jsx", "json", "ts", "tsx", "cjs", "mjs"];
  ["jsx", "ts", "tsx", "cjs", "mjs"].forEach((ext) => {
    if (!config.resolver.sourceExts.includes(ext)) {
      config.resolver.sourceExts.push(ext);
    }
  });
  //   config.resolver.sourceExts = ["glb", "gltf", "png", "jpg"];
  ["glb", "gltf", "png", "jpg"].forEach((ext) => {
    if (!config.resolver.assetExts.includes(ext)) {
      config.resolver.assetExts.push(ext);
    }
  });

  return config;
};
