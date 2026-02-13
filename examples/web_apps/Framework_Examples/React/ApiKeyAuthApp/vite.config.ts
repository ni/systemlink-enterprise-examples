/* eslint import/no-extraneous-dependencies: "off" */
/* eslint import/no-default-export: "off" */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 1:1  error  'vite' should be listed in the project's dependencies, not devDependencies  import/no-extraneous-dependencies
// 5:8  error  Prefer named exports                                                        import/no-default-export

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './', // use relative path to load assets in productions. (Load from webapp path, not from website root)
});
