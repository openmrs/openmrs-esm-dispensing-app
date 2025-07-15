/** @type {import('jest').Config} */

module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': ['@swc/jest'],
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs|.+\\.pnp\\.[^\\/]+$)'],
  moduleNameMapper: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
    '^lodash-es/(.*)$': 'lodash/$1',
    '^lodash-es$': 'lodash',
    '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js',
    dexie: require.resolve('dexie'),
  },
  collectCoverageFrom: [
    '!**/node_modules/**',
    '!**/e2e/**',
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/e2e/"  // Ignore the e2e directory containing Playwright tests
    ],
  setupFilesAfterEnv: ['<rootDir>/tools/setup-tests.ts'],
  testEnvironment: 'jsdom',
};
