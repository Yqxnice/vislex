import { createViteConfig } from '../../vite.shared.ts';

export default createViteConfig({
  entry: {
    index: 'src/index.ts',
    styles: 'src/styles.ts',
  },
});
