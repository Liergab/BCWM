// Global test setup
beforeAll(async () => {
  // Setup code that runs before all tests
  console.log('Starting test suite...');
});

afterAll(async () => {
  // Cleanup code that runs after all tests
  console.log('Test suite completed');
});

// Increase timeout for integration tests
jest.setTimeout(10000);
