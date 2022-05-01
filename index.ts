import { useEffect, useState } from 'react';

type Value<T> = T | undefined;

type NewValueOrFunc<T> = Value<T> | ((oldValue: Value<T>) => Value<T>);

type FuncSetValue<T> = (newValue: NewValueOrFunc<T>) => void;

type FuncStateListener = (f: ((v: boolean) => boolean)) => void;

interface State<T> {
  value: Value<T>;
  statesListening: Set<(FuncStateListener)>;
  set: FuncSetValue<T>;
}

interface GlobalState {
  [stateName: string]: State<any>;
}

const globalState: GlobalState = {};

const funcToggleValue = (v: boolean) => !v;

export const useGlobalState = <T>(
  stateName: string,
  initValue?: Value<T>,
  listening = true,
): [Value<T>, FuncSetValue<T>] => {
  const [, setToggleState] = useState(false);
  let state: State<T> = globalState[stateName];

  if (!state) {
    state = {
      value: initValue,
      statesListening: new Set<FuncStateListener>(),
      set(newValue: NewValueOrFunc<T>): void {
        const oldValue = state.value;
        state.value = newValue instanceof Function ? newValue(oldValue) : newValue;

        if (state.value !== oldValue) {
          state.statesListening.forEach((f) => f(funcToggleValue));
        }
      },
    };
    globalState[stateName] = state;
  }

  if (listening) {
    state.statesListening.add(setToggleState);
  }

  useEffect(() => () => {
    state.statesListening.delete(setToggleState);
  }, [state.statesListening]);

  return [state.value, state.set];
};

export default useGlobalState;
