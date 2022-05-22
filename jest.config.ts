module.exports = {
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'jsdom',
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
    },
  },
};
