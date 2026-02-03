export default {
  extends: ['stylelint-config-standard-scss'],
  ignoreFiles: [
    '**/*.js',
    '**/*.ts',
    '**/*.html',
    '**/node_modules/**',
    '**/dist/**',
    '**/.nx/**',
    '**/coverage/**',
  ],
};
