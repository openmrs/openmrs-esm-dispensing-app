import '@testing-library/jest-dom';

// Mock ResizeObserver for Carbon components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));
