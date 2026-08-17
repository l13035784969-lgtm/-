import { defineConfig } from '@tarojs/cli';

export default defineConfig(async (merge) => {
  const baseConfig = {
    projectName: 'miniapp',
    date: '2026-8-17',
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: 'dist/weapp',
    plugins: [],
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: 'react',
    compiler: 'webpack5',
    cache: {
      enable: false,
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        url: {
          enable: true,
          config: {
            limit: 1024,
          },
        },
        cssModules: {
          enable: false,
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      outputRoot: 'dist/h5',
      postcss: {
        autoprefixer: {
          enable: true,
        },
        cssModules: {
          enable: false,
        },
      },
    },
  };

  return merge({}, baseConfig);
});
