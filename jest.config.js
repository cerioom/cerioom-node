module.exports = {
  roots: ['./spec'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFiles: ['./spec/bootstrap.ts'],
  verbose: true,
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.json'
    }
  },
  // coverageThreshold: {
  //   global: {
  //     branches: 20,
  //     functions: 20,
  //     lines: 20,
  //     statements: 20
  //   }
  // },
  coverageDirectory: './coverage',
  coveragePathIgnorePatterns: ['/node_modules/', './dist', './spec']
}
