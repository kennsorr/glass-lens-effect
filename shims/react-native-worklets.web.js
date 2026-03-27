// Web shim for react-native-worklets.
// Worklets use native threading APIs that don't exist on web.
// Reanimated's JS fallback (JSReanimated) handles web without real worklets.

const noop = () => {};
const noopAsync = async () => {};

module.exports = {
  Worklets: {
    defaultContext: {
      runAsync: noopAsync,
      addDecorator: noop,
      createRunAsync: () => noopAsync,
    },
    createContext: () => ({
      runAsync: noopAsync,
      addDecorator: noop,
      createRunAsync: () => noopAsync,
    }),
    createSharedValue: (v) => ({ value: v }),
    createRunInContextFn: () => noop,
    createRunInJsFn: () => noop,
  },
  __WORKLETS_VERSION: "0.7.1",
};
