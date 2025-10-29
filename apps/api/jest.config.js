module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
    '!**/*.spec.ts',
    '!**/*.module.ts',
    '!**/main.ts',
    '!**/index.ts'
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@barbershop/domain(.*)$': '<rootDir>/../../../packages/domain/src$1',
    '^@barbershop/application(.*)$': '<rootDir>/../../../packages/application/src$1',
    '^@barbershop/infrastructure(.*)$': '<rootDir>/../../../packages/infrastructure/src$1',
    '^@barbershop/shared(.*)$': '<rootDir>/../../../packages/shared/src$1'
  }
}
