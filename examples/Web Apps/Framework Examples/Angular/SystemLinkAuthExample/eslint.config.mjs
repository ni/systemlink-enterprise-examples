import { defineConfig } from 'eslint/config';
import { angularTypescriptConfig, angularTemplateConfig } from '@ni/eslint-config-angular';
import { javascriptConfig, importNodeEsmConfig } from '@ni/eslint-config-javascript';

export default defineConfig([
    {
        // JavaScript rules fail to parse the HTML files that are added below. Therefore, the JavaScript
        // configuration must now match the correct files to avoid an error.
        files: ['**/*.js', '**/*.mjs'],
        extends: [javascriptConfig, importNodeEsmConfig]
    },
    {
        files: ['**/*.ts'],
        extends: angularTypescriptConfig,
        languageOptions: {
            parserOptions: {
                // The `languageOptions.parserOptions.projectService` option is recommended but does not identify
                // tsconfig.*.json files. Use the older `project` configuration instead. `project` has an order of
                // precedence, so include `tsconfig.json` last.
                // https://typescript-eslint.io/troubleshooting/typed-linting/#project-service-issues
                project: ['tsconfig.app.json', 'tsconfig.spec.json', 'tsconfig.json']
                // In projects (e.g. libraries) using `parserOptions.project`, Angular requires that the paths be
                // relative to the root, but the VSCode extension requires them to be relative to the project
                // directory. Set the root to be the project directory to satisfy both. The `parserOptions.projectService`
                // configuration would likely resolve this, but is not used for reasons described above.
                // https://typescript-eslint.io/blog/project-service
                // tsconfigRootDir: import.meta.dirname
            }

        }
    },
    {
        files: ['**/*.html'],
        extends: angularTemplateConfig
    }
]);
