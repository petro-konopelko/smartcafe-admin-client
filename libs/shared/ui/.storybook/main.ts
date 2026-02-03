import type { StorybookConfig } from '@analogjs/storybook-angular';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';
import { UserConfig, mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/lib/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y"
  ],
  framework: {
    name: "@analogjs/storybook-angular",
    options: {},
  },
  // Include global styles
  previewHead: (head) => `
    ${head}
    <style>
      body {
        margin: 0;
        font-family: 'Roboto', sans-serif;
      }
    </style>
  `,
  async viteFinal(config: UserConfig) {
    return mergeConfig(config, {
      plugins: [nxViteTsPaths()],
    });
  },
};

export default config;
