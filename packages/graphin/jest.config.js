module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.ts?$': 'ts-jest',
  },
  testRegex: '.*\\.test.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['jest-canvas-mock'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mock__/styleMock.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
