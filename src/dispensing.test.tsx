import React from 'react';
import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import Dispensing from './dispensing.component';

describe('<div/>', () => {
  test('renders dispening without error', () => {
    render(<Dispensing />);
  });
});
