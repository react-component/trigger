import { defineConfig } from 'dumi';
import path from 'path';

const basePath = process.env.GH_PAGES ? '/trigger/' : '/';
const publicPath = basePath;

export default defineConfig({
  alias: {
    '@rc-component/trigger$': path.resolve(__dirname, 'src'),
    '@rc-component/trigger/es': path.resolve(__dirname, 'src'),
    '@rc-component/trigger/assets': path.resolve(__dirname, 'assets'),
  },
  mfsu: false,
  favicons: ['https://avatars0.githubusercontent.com/u/9441414?s=200&v=4'],
  themeConfig: {
    name: 'Trigger',
    logo: 'https://avatars0.githubusercontent.com/u/9441414?s=200&v=4',
  },
  styles: [
    `
      .dumi-default-previewer-demo {
        position: relative;
        min-height: 300px;
      }
    `,
  ],
  outputPath: 'docs-dist',
  base: basePath,
  publicPath,
});
