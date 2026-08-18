export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/routes.js',
    '!src/models/**',
    '!src/config/**',
    '!src/database.js',
    '!src/subscription/expiry.job.js',
    '!src/ai/groq.service.js',
    '!src/ai/groq.config.js',
    '!src/showrooms/placesService.js',
    '!src/showrooms/seedService.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};