import React from 'react';
import { render } from '@testing-library/react';

function A() {
  return <div>a</div>;
}

describe('useGlobalState', () => {
  it('1', () => {
    render(<A />);
    expect(1 + 2).toBe(3);
  });

  it('2', () => {
    expect(1 + 2).toBe(3);
  });
});
