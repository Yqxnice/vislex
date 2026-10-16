import { createViteConfig } from '../../vite.shared.ts';

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    static: 'src/static.ts',
    styles: 'src/styles.ts',
  },
});
