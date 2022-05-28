import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { useAsyncGlobalState } from '..';
import { click, sleep } from './utils';

interface ComponentProps {
  stateName?: string;
  throwError?: boolean;
}

const Component = ({ stateName, throwError }: ComponentProps) => {
  const {
    data, loading, error, refetch,
  // @ts-ignore
  } = useAsyncGlobalState(stateName, () => new Promise((resolve, reject) => {
    setTimeout(() => {
      if (throwError) reject(new Error());
      else resolve('OK');
    }, 10);
  }));

  return (
    <>
      {loading ? 'Loading...' : (error && 'Error :( ') || `Data: ${data} `}
      <button type="button" onClick={refetch}>reload</button>
    </>
  );
};

const App = (props: ComponentProps) => (
  <StrictMode>
    <Component {...props} />
  </StrictMode>
);

describe('useGlobalState - simple', () => {
  it('Initialize without params, loading and OK', async () => {
    const { getByText } = render(<App />);

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Data: OK')).toBeDefined();
  });

  it('Initialize with stateName, loading and OK', async () => {
    const { getByText } = render(<App stateName="State_A" />);

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Data: OK')).toBeDefined();
  });

  it('Initialize with stateName, loading and error', async () => {
    const { getByText } = render(<App stateName="State_B" throwError />);

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Error :(')).toBeDefined();
  });

  it('Call refetch: OK, loading and OK', async () => {
    const { getByText } = render(<App stateName="State_A" />);

    expect(getByText('Data: OK')).toBeDefined();

    click('button');

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Data: OK')).toBeDefined();
  });

  it('Call refetch: OK, loading and error', async () => {
    const { getByText } = render(<App stateName="State_A" throwError />);

    expect(getByText('Data: OK')).toBeDefined();

    click('button');

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Error :(')).toBeDefined();
  });

  it('Call refetch: error, loading and error', async () => {
    const { getByText } = render(<App stateName="State_B" throwError />);

    expect(getByText('Error :(')).toBeDefined();

    click('button');

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Error :(')).toBeDefined();
  });

  it('Call refetch: error, loading and OK', async () => {
    const { getByText } = render(<App stateName="State_B" />);

    expect(getByText('Error :(')).toBeDefined();

    click('button');

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Data: OK')).toBeDefined();
  });

  it('Call refetch during loading', async () => {
    const { getByText } = render(<App stateName="State_C" />);

    expect(getByText('Loading...')).toBeDefined();

    click('button');

    expect(getByText('Loading...')).toBeDefined();
    await sleep();
    expect(getByText('Data: OK')).toBeDefined();
  });
});
