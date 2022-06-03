/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports = {
    clearMocks: true,
    coverageProvider: 'v8',
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
    globalSetup: '<rootDir>/database/startDatabase.js',
    globalTeardown: '<rootDir>/database/stopDatabase.js'
};
