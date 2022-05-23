import React, { StrictMode, useState } from 'react';
import { render } from '@testing-library/react';
import { useGlobalState } from '..';
import { click } from './utils';

interface ComponentProps {
  id: string;
  stateName: string;
  valueToSet?: any;
  listening?: boolean;
  children?: any;
}

let renderCount: { [key: string]: number } = {};

const Component = ({
  id, stateName, valueToSet, listening = true, children,
}: ComponentProps) => {
  const [, setState] = useState(false);
  const [value, setValue] = useGlobalState(stateName, 0, listening);

  const count = renderCount[id] + 1 || 1;
  renderCount[id] = count;

  return (
    <div
      id={`id-${id}`}
      style={{
        border: 'solid 1px #000',
        margin: 6,
        padding: 8,
      }}
    >
      {`${id} ${stateName}: ${value} `}
      <button type="button" className="increment" onClick={() => setValue(valueToSet ?? ((oldValue) => oldValue + 1))}>
        Increment
      </button>
      {` renderCount: ${count}, listening: ${listening} `}
      <button type="button" className="update" onClick={() => setState((oldValue) => !oldValue)}>
        Update
      </button>
      {children}
    </div>
  );
};

const App = () => (
  <StrictMode>
    <Component id="1-" stateName="State_A">
      <Component id="1-1-" stateName="State_B">
        <Component id="1-1-1-" stateName="State_A" listening={false} />
        <Component id="1-1-2-" stateName="State_A" />
      </Component>
      <Component id="1-2-" stateName="State_A">
        <Component id="1-2-1-" stateName="State_B" listening={false} />
        <Component id="1-2-2-" stateName="State_B" />
      </Component>
    </Component>
    <Component id="2-" stateName="State_B" listening={false}>
      <Component id="2-1-" stateName="State_A" />
      <Component id="2-2-" stateName="State_B" valueToSet={13} />
    </Component>
  </StrictMode>
);

const renderApp = () => {
  renderCount = {};
  return render(<App />);
};

describe('useGlobalState - render count in complex hierarchy', () => {
  it('Initialize', () => {
    const { getAllByText } = renderApp();

    expect(getAllByText(/renderCount: 2,/).length).toBe(10);
    expect(getAllByText(/State_A: 0/).length).toBe(5);
    expect(getAllByText(/State_B: 0/).length).toBe(5);
  });

  it('Change State_B once', () => {
    const { getAllByText } = renderApp();
    click('#id-1-2-2- .increment');

    expect(getAllByText(/renderCount: 2,/).length).toBe(7);
    expect(getAllByText(/State_A: 0/).length).toBe(5);
    expect(getAllByText(/renderCount: 4,/).length).toBe(3);
    expect(getAllByText(/State_B: 0/).length).toBe(2);
    expect(getAllByText(/State_B: 1/).length).toBe(3);
  });

  it('Change State_B three times', () => {
    const { getAllByText } = renderApp();
    click('#id-2- .increment', 3);

    expect(getAllByText(/renderCount: 2,/).length).toBe(7);
    expect(getAllByText(/State_A: 0/).length).toBe(5);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
    expect(getAllByText(/State_B: 1/).length).toBe(2);
    expect(getAllByText(/State_B: 4/).length).toBe(3);
  });

  it('Change State_B three times and State_A once', () => {
    const { getAllByText } = renderApp();
    click('#id-2- .increment', 3);
    click('#id-1- .increment');

    expect(getAllByText(/renderCount: 2,/).length).toBe(3);
    expect(getAllByText(/State_A: 0/).length).toBe(1);
    expect(getAllByText(/renderCount: 4,/).length).toBe(4);
    expect(getAllByText(/State_A: 1/).length).toBe(4);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
    expect(getAllByText(/State_B: 4/).length).toBe(2);
    expect(getAllByText(/State_B: 7/).length).toBe(3);
  });

  it('Change State_B three times and State_A twice', () => {
    const { getAllByText } = renderApp();
    click('#id-2- .increment', 3);
    click('#id-1- .increment');
    click('#id-1-1-2- .increment');

    expect(getAllByText(/renderCount: 2,/).length).toBe(3);
    expect(getAllByText(/State_A: 1/).length).toBe(1);
    expect(getAllByText(/renderCount: 6,/).length).toBe(4);
    expect(getAllByText(/State_A: 3/).length).toBe(4);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
    expect(getAllByText(/State_B: 7/).length).toBe(2);
    expect(getAllByText(/State_B: 10/).length).toBe(3);
  });

  it('Change State_B three times and State_A twice and update a single Component', () => {
    const { getAllByText } = renderApp();
    click('#id-2- .increment', 3);
    click('#id-1- .increment');
    click('#id-1-1-2- .increment');
    click('#id-1-2-1- .update');

    expect(getAllByText(/renderCount: 2,/).length).toBe(2);
    expect(getAllByText(/renderCount: 4,/).length).toBe(1);
    expect(getAllByText(/State_A: 3/).length).toBe(1);
    expect(getAllByText(/renderCount: 6,/).length).toBe(4);
    expect(getAllByText(/State_A: 5/).length).toBe(4);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
    expect(getAllByText(/State_B: 10/).length).toBe(1);
    expect(getAllByText(/State_B: 13/).length).toBe(4);
  });

  it('Change it to the same value and don\'t render any components', () => {
    const { getAllByText } = renderApp();
    click('#id-2-2- .increment');

    expect(getAllByText(/renderCount: 2,/).length).toBe(10);
    expect(getAllByText(/State_A: 5/).length).toBe(5);
    expect(getAllByText(/State_B: 13/).length).toBe(5);
  });
});
