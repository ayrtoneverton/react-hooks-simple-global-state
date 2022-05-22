import React, { StrictMode, useState } from 'react';
import { act, render } from '@testing-library/react';
import { useGlobalState } from '..';

interface ComponentProps {
  id: string;
  stateName: string;
  listening?: boolean;
  children?: any;
}

let renderCount: { [key: string]: number } = {};

const Component = ({
  id,
  stateName,
  listening = true,
  children,
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
      <button type="button" className="increment" onClick={() => setValue((oldValue) => oldValue + 1)}>
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
      <Component id="2-2-" stateName="State_B" />
    </Component>
  </StrictMode>
);

const renderApp = () => {
  renderCount = {};
  return render(<App />);
};

const click = (selector: string, container: HTMLElement, clickCount = 1) => {
  const actEvent = () => {
    container.querySelector(selector)?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };
  for (let i = 0; i < clickCount; i += 1) {
    act(actEvent);
  }
};

describe('useGlobalState - render count in complex hierarchy', () => {
  it('Initialize', () => {
    expect(renderApp().getAllByText(/renderCount: 2,/).length).toBe(10);
  });

  it('Change State_B once', () => {
    const { container, getAllByText } = renderApp();
    click('#id-1-2-2- .increment', container);

    expect(getAllByText(/renderCount: 2,/).length).toBe(7);
    expect(getAllByText(/renderCount: 4,/).length).toBe(3);
  });

  it('Change State_B three times', () => {
    const { container, getAllByText } = renderApp();
    click('#id-2- .increment', container, 3);

    expect(getAllByText(/renderCount: 2,/).length).toBe(7);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
  });

  it('Change State_B three times and State_A once', () => {
    const { container, getAllByText } = renderApp();
    click('#id-2- .increment', container, 3);
    click('#id-1- .increment', container);

    expect(getAllByText(/renderCount: 2,/).length).toBe(3);
    expect(getAllByText(/renderCount: 4,/).length).toBe(4);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
  });

  it('Change State_B three times and State_A twice', () => {
    const { container, getAllByText } = renderApp();
    click('#id-2- .increment', container, 3);
    click('#id-1- .increment', container);
    click('#id-1-1-2- .increment', container);

    expect(getAllByText(/renderCount: 2,/).length).toBe(3);
    expect(getAllByText(/renderCount: 6,/).length).toBe(4);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
  });

  it('Change State_B three times and State_A twice and update a single Component', () => {
    const { container, getAllByText } = renderApp();
    click('#id-2- .increment', container, 3);
    click('#id-1- .increment', container);
    click('#id-1-1-2- .increment', container);
    click('#id-1-2-1- .update', container);

    expect(getAllByText(/renderCount: 2,/).length).toBe(2);
    expect(getAllByText(/renderCount: 4,/).length).toBe(1);
    expect(getAllByText(/renderCount: 6,/).length).toBe(4);
    expect(getAllByText(/renderCount: 8,/).length).toBe(3);
  });
});
