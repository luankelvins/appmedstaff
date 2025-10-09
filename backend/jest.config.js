export default {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    '<rootDir>/tests/**/*.test.{js,ts}',
    '<rootDir>/src/**/*.test.{js,ts}',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{js}',
    '!src/**/*.test.{js}',
  ],
  testTimeout: 10000,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};