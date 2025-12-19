export default [
  {
    test: {
      name: 'unit',
      environment: 'node',
      include: ['tests/unit/**/*.spec.ts'],
    },
  },
  {
    test: {
      name: 'integration',
      environment: 'node',
      include: ['tests/integration/**/*.spec.ts'],
      setupFiles: ['tests/setup.ts'],
    },
  },
  {
    test: {
      name: 'component',
      environment: 'node',
      include: ['tests/component/**/*.spec.ts'],
      setupFiles: ['tests/setup.ts'],
    },
  },
];
