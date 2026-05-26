const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const projectRoot = __dirname;
const defaultConfig = getDefaultConfig(projectRoot);

const config = {
  watchFolders: [path.resolve(projectRoot, 'node_modules')],
  resolver: {
    ...defaultConfig.resolver,
    // Ignore Gradle/C++ output - Metro must not watch folders that clean/build deletes.
    blockList: [
      /[\\/]android[\\/]app[\\/]build[\\/].*/,
      /[\\/]android[\\/]build[\\/].*/,
      /[\\/]android[\\/]\.gradle[\\/].*/,
      /[\\/]\.cxx[\\/].*/,
      /[\\/]node_modules[\\/].*[\\/]android[\\/]build[\\/].*/,
      /[\\/]node_modules[\\/].*[\\/]android[\\/]\.cxx[\\/].*/,
    ],
    nodeModulesPaths: [path.resolve(projectRoot, 'node_modules')],
  },
};

module.exports = mergeConfig(defaultConfig, config);
