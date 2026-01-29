import '@testing-library/jest-dom';

// Suppress expected localStorage parse errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn((message, error) => {
    // Suppress "Failed to load saved game" errors (expected in invalid JSON test)
    if (message === "Failed to load saved game:" && error instanceof SyntaxError) {
      return;
    }
    originalError.call(console, message, error);
  });
});

afterAll(() => {
  console.error = originalError;
});

// Clear localStorage before each test
beforeEach(() => {
  localStorage.clear();
});
