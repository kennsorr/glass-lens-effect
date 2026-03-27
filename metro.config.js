const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push("wasm");

// On web, react-native-worklets tries to use native threading APIs
// that don't exist. Redirect to a no-op shim on web platform.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === "web" &&
    moduleName === "react-native-worklets"
  ) {
    return {
      filePath: path.resolve(__dirname, "shims/react-native-worklets.web.js"),
      type: "sourceFile",
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
