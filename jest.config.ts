module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  modulePathIgnorePatterns: ['utils.ts'],
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      statements: 100,
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
