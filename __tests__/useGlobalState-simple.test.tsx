import React, { StrictMode } from 'react';
import { render } from '@testing-library/react';
import { useGlobalState } from '..';
import { click } from './utils';

interface ComponentProps {
  stateName?: string;
  initValue?: any;
  listening?: boolean;
  valueToSet?: any;
}

const Component = ({
  stateName, initValue, listening, valueToSet,
}: ComponentProps) => {
  // @ts-ignore
  const [value, setValue] = useGlobalState(stateName, initValue, listening);

  return (
    <StrictMode>
      {`Value: ${value}`}
      <button type="button" onClick={() => setValue(valueToSet || ((oldValue: any) => oldValue + 1))}>
        Increment
      </button>
    </StrictMode>
  );
};

const App = (props: ComponentProps) => (
  <StrictMode>
    <Component {...props} />
  </StrictMode>
);

describe('useGlobalState - simple', () => {
  it('Initialize without params', () => {
    expect(render(<App />)
      .getByText('Value: undefined')).toBeDefined();
  });

  it('Initialize with stateName', () => {
    expect(render(<App stateName="State_A" />)
      .getByText('Value: undefined')).toBeDefined();
  });

  it('Initialize with initValue as number', () => {
    expect(render(<App stateName="State_B" initValue={33} />)
      .getByText('Value: 33')).toBeDefined();
  });

  it('Initialize with initValue as string', () => {
    expect(render(<App stateName="State_C" initValue="State_value" />)
      .getByText('Value: State_value')).toBeDefined();
  });

  it('SetState with function', () => {
    const { getByText } = render(<App stateName="State_B" />);
    click('button');

    expect(getByText('Value: 34')).toBeDefined();
  });

  it('SetState with value', () => {
    const { getByText } = render(<App stateName="State_C" valueToSet="New_value" />);
    click('button');

    expect(getByText('Value: New_value')).toBeDefined();
  });

  it('SetState with the same value', () => {
    const { getByText } = render(<App stateName="State_C" valueToSet="New_value" />);
    click('button');

    expect(getByText('Value: New_value')).toBeDefined();
  });
});
