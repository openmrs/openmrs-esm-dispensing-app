/** @type {import('jest').Config} */

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
  setupFilesAfterEnv: ['<rootDir>/tools/setup-tests.ts'],
  testEnvironment: 'jsdom',
};
