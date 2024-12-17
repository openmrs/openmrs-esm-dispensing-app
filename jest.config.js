module.exports = {
  transform: {
    '^.+\\.tsx?$': '@swc/jest',
  },
  transformIgnorePatterns: ['/node_modules/(?!@openmrs)'],
  moduleNameMapper: {
    '@openmrs/esm-framework': '@openmrs/esm-framework/mock',
    '\\.(s?css)$': 'identity-obj-proxy',
    '^lodash-es/(.*)$': 'lodash/$1',
    '^lodash-es$': 'lodash',
    '^uuid$': '<rootDir>/node_modules/uuid/dist/index.js',
    dexie: require.resolve('dexie'),
  },
  setupFilesAfterEnv: ['<rootDir>/src/setup-tests.ts'],
  testPathIgnorePatterns: [
    "/node_modules/",
      "/e2e/"  // Ignore the e2e directory containing Playwright tests
    ],
  testEnvironment: 'jsdom',
};
