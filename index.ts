import { useEffect, useState } from 'react';

type ValueOrFunc<T> = T | ((currentValue: T) => T);

type FuncSetValue<T> = (newValueOrFunc: ValueOrFunc<T>) => void;

type FuncStateListener = (f: (v: number) => number) => void;

interface State<T> {
  value: T;
  statesListening: Set<FuncStateListener>;
  set: FuncSetValue<T>;
}

interface GlobalState {
  [stateName: string]: State<any>;
}

const globalState: GlobalState = {};

const rerender = (v: number) => (v % 999) + 1;

export const useGlobalState = <T>(
  stateName: string,
  initValue?: T,
  listening = true,
): [currentValue: T, setValue: FuncSetValue<T>] => {
  const [, setCurrentState] = useState(0);
  let state: State<T> = globalState[stateName];

  if (!state) {
    state = {
      value: initValue as T,
      statesListening: new Set<FuncStateListener>(),
      set(newValue: ValueOrFunc<T>): void {
        const oldValue = state.value;
        state.value = newValue instanceof Function ? newValue(oldValue) : newValue;

        if (state.value !== oldValue) {
          state.statesListening.forEach((setState) => setState(rerender));
        }
      },
    };
    globalState[stateName] = state;
  }

  useEffect(() => {
    if (listening) state.statesListening.add(setCurrentState);

    return () => {
      state.statesListening.delete(setCurrentState);
    };
  }, [state.statesListening, listening]);

  return [state.value, state.set];
};

export default useGlobalState;

interface AsyncData<T> {
  loading: boolean;
  data?: T;
  error?: any;
  refetch: () => void;
}

interface InternalAsyncData<T> extends AsyncData<T> {
  initialized?: boolean;
}

const getInitAsyncData = <T>(): InternalAsyncData<T> => ({
  loading: true,
  refetch: () => {},
});

export const useAsyncGlobalState = <T>(
  stateName: string,
  funcLoadAsyncData?: () => Promise<T>,
): AsyncData<T> => {
  const [asyncData, setAsyncData] = useGlobalState(`async_${stateName}`, getInitAsyncData<T>());

  useEffect(() => {
    if (asyncData.initialized || !funcLoadAsyncData) return;
    asyncData.initialized = true;

    const newAsyncData = {
      loading: false,
      initialized: true,
      refetch: () => setAsyncData(getInitAsyncData()),
    };
    funcLoadAsyncData()
      .then((data) => setAsyncData({ ...newAsyncData, data }))
      .catch((error) => setAsyncData({ ...newAsyncData, error }));
  }, [asyncData.initialized]);

  return asyncData;
};
