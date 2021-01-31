module.exports = {
    // roots: ['./spec'],
    preset: 'ts-jest',
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    testMatch: ['<rootDir>/**/*.test.ts'],
    testEnvironment: 'node',
    // testRegex: 'test\.ts$',
    // setupFiles: ['./spec/bootstrap.ts'],
    verbose: true,
    globals: {
        'ts-jest': {
            tsconfig: './tsconfig.json',
            diagnostics: {
                ignoreCodes: [2300],
            },
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
    coveragePathIgnorePatterns: ['dist', 'test', '\\.test\\.ts$'],
    collectCoverageFrom : ['packages/**/*.ts'],
};
