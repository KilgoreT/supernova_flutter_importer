// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginImport from 'eslint-plugin-import';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        plugins: {
            import: pluginImport,
        },
        rules: {
            'import/no-restricted-paths': [
                'error',
                {
                    zones: [
                        {
                            target: './',
                            from: './exporter',
                            message: 'Импортируй из exporter только внутри content/',
                        },
                    ],
                },
            ],
        },
    },
    {
        ignores: ['node_modules', 'dist', 'build'],
    },
];
