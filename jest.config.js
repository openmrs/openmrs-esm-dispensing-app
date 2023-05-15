module.exports = {
  transform: {
    "^.+\\.tsx?$": "@swc/jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!@openmrs)"],
  moduleNameMapper: {
    "@openmrs/esm-framework": "@openmrs/esm-framework/mock",
    "\\.(s?css)$": "identity-obj-proxy",
    "^lodash-es/(.*)$": "lodash/$1",
    "^uuid$": "<rootDir>/node_modules/uuid/dist/index.js",
    dexie: require.resolve("dexie"),
  },
  setupFilesAfterEnv: ["<rootDir>/src/setup-tests.ts"],
  testEnvironment: "jsdom",
};
