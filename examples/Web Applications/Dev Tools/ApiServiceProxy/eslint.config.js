import { defineConfig } from 'eslint/config';

import { javascriptConfig, importNodeEsmConfig } from '@ni/eslint-config-javascript';

export default defineConfig([
    {
        files: ['**/*.js'],
        extends: [javascriptConfig, importNodeEsmConfig],
        ignores: ['proxyConfig.js']
    },
]);
