const { getDefaultConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
defaultConfig.resolver.sourceExts.push('cjs');

module.exports = {
  maxWorkers: 2, // Limit the number of workers
  resetCache: false,
  cacheStores: [
    {
      name: 'metro',
      type: 'file',
    },
  ],
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true, // Enable inline requires
      },
    }),
  },
};

// This is the new line you should add in, after the previous lines
defaultConfig.resolver.unstable_enablePackageExports = false;