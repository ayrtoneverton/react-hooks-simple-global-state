import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { useAsyncGlobalState } from '..';
import { click, sleep } from './utils';

interface ComponentProps {
  id: string;
  stateName?: string;
  children?: any;
}

let renderCount: { [key: string]: number } = {};

const Component = ({ id, stateName, children }: ComponentProps) => {
  const {
    data, loading, refetch,
  // @ts-ignore
  } = useAsyncGlobalState(stateName, () => new Promise((resolve) => {
    setTimeout(() => resolve('OK'), 10);
  }));

  const count = renderCount[id] + 1 || 1;
  renderCount[id] = count;

  return (
    <div id={`id-${id}`}>
      {`renderCount: ${count}, `}
      {loading ? 'Loading...' : `Data: ${data}`}
      <button type="button" onClick={refetch}>reload</button>
      {children}
    </div>
  );
};

const App = () => (
  <StrictMode>
    <Component id="1-" stateName="State_A">
      <Component id="1-1-" stateName="State_A" />
      <Component id="1-2-" stateName="State_B" />
    </Component>
    <Component id="2-" stateName="State_B">
      <Component id="2-1-" stateName="State_A" />
      <Component id="2-2-" stateName="State_B" />
    </Component>
  </StrictMode>
);

const renderApp = () => {
  renderCount = {};
  return render(<App />);
};

describe('useAsyncGlobalState - render count in complex hierarchy', () => {
  it('Initialize All: loading and OK', async () => {
    const { getAllByText } = renderApp();

    expect(getAllByText(/Loading.../).length).toBe(6);
    expect(getAllByText(/renderCount: 2,/).length).toBe(6);
    await sleep();
    expect(getAllByText(/Data: OK/).length).toBe(6);
    expect(getAllByText(/renderCount: 4,/).length).toBe(6);
  });

  it.each([
    ['1-', 'A'],
    ['2-1-', 'A'],
    ['2-', 'B'],
    ['1-2-', 'B'],
  ])('Call refetch in %i(State_%i): OK, loading and OK', async (id) => {
    const { getAllByText } = renderApp();

    expect(getAllByText(/Data: OK/).length).toBe(6);
    expect(getAllByText(/renderCount: 2,/).length).toBe(6);

    click(`#id-${id} > button`);

    expect(getAllByText(/Data: OK/).length).toBe(3);
    expect(getAllByText(/renderCount: 2,/).length).toBe(3);
    expect(getAllByText(/Loading.../).length).toBe(3);
    expect(getAllByText(/renderCount: 4,/).length).toBe(3);
    await sleep();
    expect(getAllByText(/Data: OK/).length).toBe(6);
    expect(getAllByText(/renderCount: 2,/).length).toBe(3);
    expect(getAllByText(/renderCount: 6,/).length).toBe(3);
  });
});
